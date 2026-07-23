from datetime import date
from uuid import uuid4

import factory

from src.common.money import MoneyInt
from src.enums import ContractStatus
from src.models import Contract


class ContractFactory(factory.Factory):
    """A £40,000 vehicle over 36 months at 10,000 miles a year, so £765.56 a month."""

    class Meta:
        model = Contract

    customer_uuid = factory.LazyFunction(uuid4)
    vehicle_make = "Kia"
    vehicle_model = "EV6"
    vehicle_registration = factory.Sequence(lambda number: f"LC25 A{number:02d}")
    vehicle_price = MoneyInt(4_000_000)
    status = ContractStatus.ACTIVE
    start_date = date(2025, 9, 1)
    term_months = 36
    annual_mileage = 10_000
    residual_value = MoneyInt(2_000_000)
    monthly_payment = MoneyInt(76_556)
    billing_day = 1
