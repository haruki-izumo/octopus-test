"""Adds example contracts to the local database. Run it with `just seed`.

Start dates are worked out from today, so the examples always include a
contract in its first year, one more than 12 months in, one in its final
3 months and one that has been terminated.
"""

import asyncio
from dataclasses import dataclass
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import select

from src.common.audit import AuditWriter
from src.common.contracts import ContractDatabaseClient
from src.common.database import Database
from src.common.dates import BusinessDate, SystemClock
from src.common.money import MoneyInt
from src.common.outbox import OutboxWriter
from src.common.pricing import RateCard, calculate_monthly_payment
from src.config import Config
from src.enums import AuditAction, ContractStatus
from src.events.catalogue import ContractCreated
from src.models import Contract

ACTOR = "seed-script"


@dataclass(frozen=True, slots=True)
class ExampleContract:
    make: str
    model: str
    registration: str
    price: Decimal
    term_months: int
    annual_mileage: int
    months_since_start: int
    billing_day: int
    status: ContractStatus = ContractStatus.ACTIVE


EXAMPLES = [
    ExampleContract("Tesla", "Model 3", "LC25 KTA", Decimal("42000"), 36, 10_000, 2, 1),
    ExampleContract("Volkswagen", "ID.3", "LB25 XWD", Decimal("34000"), 36, 15_000, 9, 5),
    ExampleContract("Renault", "Megane E-Tech", "LD26 RMV", Decimal("35000"), 24, 12_000, 1, 25),
    ExampleContract("MG", "MG4", "LF25 MGH", Decimal("27000"), 24, 30_000, 6, 12),
    ExampleContract("Kia", "EV6", "LA24 KEV", Decimal("45500"), 48, 12_000, 20, 15),
    ExampleContract("Hyundai", "Ioniq 5", "LG24 HYN", Decimal("41000"), 48, 5_000, 30, 20),
    ExampleContract("Audi", "Q4 e-tron", "LH23 AQE", Decimal("50000"), 48, 25_000, 40, 8),
    ExampleContract("BMW", "i4", "LJ24 BMW", Decimal("52000"), 24, 8_000, 22, 28),
    ExampleContract("Skoda", "Enyaq", "LK23 SKE", Decimal("39500"), 36, 10_000, 34, 1),
    ExampleContract(
        "Polestar", "2", "LM24 PLS", Decimal("48000"), 36, 20_000, 14, 10, ContractStatus.TERMINATED
    ),
]


async def seed(database: Database, rate_card: RateCard, today: BusinessDate) -> int:
    """Adds the examples, unless there are contracts already. Returns how many were added."""
    contracts = ContractDatabaseClient()
    audit = AuditWriter()
    outbox = OutboxWriter()
    async with database.sessions.begin() as session:
        if await session.scalar(select(Contract.id).limit(1)) is not None:
            return 0
        for example in EXAMPLES:
            vehicle_price = MoneyInt.from_pounds(example.price)
            payment = calculate_monthly_payment(
                vehicle_price, example.term_months, example.annual_mileage, rate_card
            )
            contract = Contract(
                customer_uuid=uuid4(),
                vehicle_make=example.make,
                vehicle_model=example.model,
                vehicle_registration=example.registration,
                vehicle_price=vehicle_price,
                status=example.status,
                start_date=today.add_months(-example.months_since_start),
                term_months=example.term_months,
                annual_mileage=example.annual_mileage,
                residual_value=payment.residual_value,
                monthly_payment=payment.monthly_payment,
                billing_day=example.billing_day,
            )
            await contracts.create(session, contract)
            audit.record(
                session,
                contract,
                AuditAction.CONTRACT_CREATED,
                before=None,
                after=contract.audit_snapshot(),
                actor=ACTOR,
            )
            outbox.enqueue(
                session,
                ContractCreated(
                    contract_uuid=contract.uuid,
                    customer_uuid=contract.customer_uuid,
                    created_at=contract.created_at,
                ),
            )
    return len(EXAMPLES)


async def main() -> None:
    config = Config()
    database = Database(config.database_url)
    try:
        added = await seed(database, config.rate_card, SystemClock().today())
    finally:
        await database.dispose()
    if added:
        print(f"Added {added} example contracts")
    else:
        print("There are contracts already, so no examples were added")


if __name__ == "__main__":
    asyncio.run(main())
