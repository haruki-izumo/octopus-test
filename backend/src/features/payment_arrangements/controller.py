from datetime import timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from src.common.audit import AuditWriter
from src.common.contracts import ContractDatabaseClient
from src.common.dates import Clock
from src.common.errors import BusinessRuleError
from src.common.outbox import OutboxWriter
from src.enums import AuditAction, ContractStatus
from src.events.catalogue import BillingDayChanged
from src.features.payment_arrangements.database_client import BillingDayChangeDatabaseClient
from src.features.payment_arrangements.schemas import (
    BillingDayChangeResponse,
    CreateBillingDayChangeRequest,
)
from src.models import BillingDayChange

NO_CHANGES_BEFORE_END_DATE = timedelta(days=30)


class PaymentArrangementsController:
    def __init__(
        self,
        contracts: ContractDatabaseClient,
        billing_day_changes: BillingDayChangeDatabaseClient,
        audit: AuditWriter,
        outbox: OutboxWriter,
        clock: Clock,
    ) -> None:
        self.contracts = contracts
        self.billing_day_changes = billing_day_changes
        self.audit = audit
        self.outbox = outbox
        self.clock = clock

    async def change_billing_day(
        self, session: AsyncSession, request: CreateBillingDayChangeRequest, actor: str
    ) -> BillingDayChangeResponse:
        today = self.clock.today()
        async with session.begin():
            contract = await self.contracts.get_by_uuid(session, request.contract_uuid)
            expected_version = contract.version
            if contract.status != ContractStatus.ACTIVE:
                raise BusinessRuleError(
                    f"The billing day can only be changed on an active contract, "
                    f"but this one is {contract.status}"
                )
            if contract.end_date - today <= NO_CHANGES_BEFORE_END_DATE:
                raise BusinessRuleError(
                    "The billing day can't be changed within 30 days of the contract's end date"
                )

            change = BillingDayChange(
                contract_id=contract.id,
                previous_billing_day=contract.billing_day,
                new_billing_day=request.billing_day,
                # The next payment is still taken on the current billing day.
                effective_from=today.next_occurrence_of_day(contract.billing_day),
            )
            await self.billing_day_changes.create(session, change)

            contract.billing_day = request.billing_day
            await self.contracts.update(session, contract, expected_version)
            self.audit.record(
                session,
                contract,
                AuditAction.BILLING_DAY_CHANGED,
                before={"billing_day": change.previous_billing_day},
                after={"billing_day": change.new_billing_day},
                actor=actor,
            )
            self.outbox.enqueue(
                session,
                BillingDayChanged(
                    contract_uuid=contract.uuid,
                    billing_day_change_uuid=change.uuid,
                    effective_from=change.effective_from,
                ),
            )
        return BillingDayChangeResponse.from_billing_day_change(change, contract.uuid)
