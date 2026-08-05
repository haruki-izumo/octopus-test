from datetime import date
from decimal import Decimal
from typing import Self
from uuid import UUID

from pydantic import BaseModel, Field

from src.enums import ContractStatus
from src.models import Contract


class Vehicle(BaseModel):
    make: str = Field(min_length=1)
    model: str = Field(min_length=1)
    registration: str = Field(min_length=1)


class VehicleWithPrice(Vehicle):
    price: Decimal = Field(gt=0, decimal_places=2, description="In pounds")


class CreateContractRequest(BaseModel):
    customer_uuid: UUID
    vehicle: VehicleWithPrice
    term_months: int
    annual_mileage: int
    start_date: date
    billing_day: int = Field(ge=1, le=28)


class ContractResponse(BaseModel):
    uuid: UUID
    customer_uuid: UUID
    status: ContractStatus
    vehicle: Vehicle
    start_date: date
    end_date: date
    term_months: int
    annual_mileage: int
    monthly_payment: Decimal = Field(description="In pounds")
    billing_day: int
    months_remaining: int

    @classmethod
    def from_contract(cls, contract: Contract, today: date) -> Self:
        return cls(
            uuid=contract.uuid,
            customer_uuid=contract.customer_uuid,
            status=contract.status,
            vehicle=Vehicle(
                make=contract.vehicle_make,
                model=contract.vehicle_model,
                registration=contract.vehicle_registration,
            ),
            start_date=contract.start_date,
            end_date=contract.end_date,
            term_months=contract.term_months,
            annual_mileage=contract.annual_mileage,
            monthly_payment=contract.monthly_payment.to_pounds(),
            billing_day=contract.billing_day,
            months_remaining=contract.months_remaining(today),
        )
