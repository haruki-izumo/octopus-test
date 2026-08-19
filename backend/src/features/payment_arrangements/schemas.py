from datetime import date
from typing import Self
from uuid import UUID

from pydantic import BaseModel, Field

from src.models import BillingDayChange


class CreateBillingDayChangeRequest(BaseModel):
    contract_uuid: UUID
    billing_day: int = Field(ge=1, le=28)


class BillingDayChangeResponse(BaseModel):
    uuid: UUID
    contract_uuid: UUID
    previous_billing_day: int
    new_billing_day: int
    effective_from: date

    @classmethod
    def from_billing_day_change(cls, change: BillingDayChange, contract_uuid: UUID) -> Self:
        return cls(
            uuid=change.uuid,
            contract_uuid=contract_uuid,
            previous_billing_day=change.previous_billing_day,
            new_billing_day=change.new_billing_day,
            effective_from=change.effective_from,
        )
