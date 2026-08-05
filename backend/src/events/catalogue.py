"""Events we tell other services about.

Names and contents are agreed with the teams that use them, so don't change
them without talking to those teams. Keep contents small: what happened and
the relevant IDs.
"""

from datetime import date, datetime
from typing import ClassVar
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class Event(BaseModel):
    model_config = ConfigDict(frozen=True)

    event_type: ClassVar[str]


class ContractCreated(Event):
    event_type = "contract.created"

    contract_uuid: UUID
    customer_uuid: UUID
    created_at: datetime


class BillingDayChanged(Event):
    event_type = "contract.billing_day_changed"

    contract_uuid: UUID
    billing_day_change_uuid: UUID
    effective_from: date


class ContractVariationRequested(Event):
    event_type = "contract.variation_requested"

    contract_uuid: UUID
    variation_uuid: UUID
    variation_type: str
    requested_at: datetime


class ContractVariationAccepted(Event):
    event_type = "contract.variation_accepted"

    contract_uuid: UUID
    variation_uuid: UUID
    effective_from: date


CATALOGUE: dict[str, type[Event]] = {
    event.event_type: event
    for event in (
        ContractCreated,
        BillingDayChanged,
        ContractVariationRequested,
        ContractVariationAccepted,
    )
}
