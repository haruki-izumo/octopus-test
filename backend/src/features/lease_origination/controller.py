from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from src.common.audit import AuditWriter
from src.common.contracts import ContractDatabaseClient
from src.common.dates import Clock
from src.common.money import MoneyInt
from src.common.outbox import OutboxWriter
from src.common.pricing import RateCard, calculate_monthly_payment
from src.enums import AuditAction, ContractStatus
from src.events.catalogue import ContractCreated
from src.features.lease_origination.schemas import ContractResponse, CreateContractRequest
from src.models import Contract


class LeaseOriginationController:
    def __init__(
        self,
        contracts: ContractDatabaseClient,
        audit: AuditWriter,
        outbox: OutboxWriter,
        rate_card: RateCard,
        clock: Clock,
    ) -> None:
        self.contracts = contracts
        self.audit = audit
        self.outbox = outbox
        self.rate_card = rate_card
        self.clock = clock

    async def create_contract(
        self, session: AsyncSession, request: CreateContractRequest, actor: str
    ) -> ContractResponse:
        vehicle_price = MoneyInt.from_pounds(request.vehicle.price)
        payment = calculate_monthly_payment(
            vehicle_price, request.term_months, request.annual_mileage, self.rate_card
        )
        contract = Contract(
            customer_uuid=request.customer_uuid,
            vehicle_make=request.vehicle.make,
            vehicle_model=request.vehicle.model,
            vehicle_registration=request.vehicle.registration,
            vehicle_price=vehicle_price,
            status=ContractStatus.ACTIVE,
            start_date=request.start_date,
            term_months=request.term_months,
            annual_mileage=request.annual_mileage,
            residual_value=payment.residual_value,
            monthly_payment=payment.monthly_payment,
            billing_day=request.billing_day,
        )
        async with session.begin():
            await self.contracts.create(session, contract)
            self.audit.record(
                session,
                contract,
                AuditAction.CONTRACT_CREATED,
                before=None,
                after=contract.audit_snapshot(),
                actor=actor,
            )
            self.outbox.enqueue(
                session,
                ContractCreated(
                    contract_uuid=contract.uuid,
                    customer_uuid=contract.customer_uuid,
                    created_at=contract.created_at,
                ),
            )
        return ContractResponse.from_contract(contract, self.clock.today())

    async def get_contract(self, session: AsyncSession, contract_uuid: UUID) -> ContractResponse:
        contract = await self.contracts.get_by_uuid(session, contract_uuid)
        return ContractResponse.from_contract(contract, self.clock.today())
