"""Works out lease prices.

A monthly payment covers the value the vehicle loses during the lease, plus a
finance charge:

1. The residual value is what the vehicle should be worth at the end of the
   lease. It's a percentage of the price that depends on the term, and goes
   down as the annual mileage goes up.
2. Depreciation is the price minus the residual value, spread over the term.
3. The finance charge is the price plus the residual value, multiplied by the
   money factor (the monthly rate we charge for financing the vehicle).
4. The monthly payment is depreciation plus the finance charge.

Each amount is rounded to the nearest penny as it's worked out. For example, a
£40,000 vehicle on a 36-month lease at 10,000 miles a year keeps 50% of its
value, so its residual value is £20,000.00. Depreciation is £20,000 divided by
36, which is £555.56. The finance charge is £60,000 multiplied by 0.0035, which
is £210.00. So the monthly payment is £765.56.
"""

from dataclasses import dataclass
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from src.common.errors import BusinessRuleError
from src.common.money import MoneyInt


class RateCard(BaseModel):
    """The figures used for pricing. Percentages are fractions, so 0.5 is 50%."""

    model_config = ConfigDict(frozen=True)

    base_residual_percentages: dict[int, Decimal] = {
        24: Decimal("0.58"),
        36: Decimal("0.50"),
        48: Decimal("0.42"),
    }
    minimum_annual_mileage: int = 5_000
    maximum_annual_mileage: int = 30_000
    annual_mileage_step: int = 1_000
    standard_annual_mileage: int = 10_000
    residual_adjustment_per_thousand_miles: Decimal = Decimal("0.012")
    minimum_residual_percentage: Decimal = Decimal("0.15")
    maximum_residual_percentage: Decimal = Decimal("0.65")
    money_factor: Decimal = Decimal("0.0035")


@dataclass(frozen=True, slots=True)
class MonthlyPaymentBreakdown:
    residual_value: MoneyInt
    depreciation: MoneyInt
    finance: MoneyInt
    monthly_payment: MoneyInt


def calculate_residual_value(
    vehicle_price: MoneyInt, term_months: int, annual_mileage: int, rate_card: RateCard
) -> MoneyInt:
    return vehicle_price * _residual_percentage(term_months, annual_mileage, rate_card)


def calculate_monthly_payment(
    vehicle_price: MoneyInt, term_months: int, annual_mileage: int, rate_card: RateCard
) -> MonthlyPaymentBreakdown:
    residual_value = calculate_residual_value(vehicle_price, term_months, annual_mileage, rate_card)
    depreciation = (vehicle_price - residual_value) / term_months
    finance = (vehicle_price + residual_value) * rate_card.money_factor
    return MonthlyPaymentBreakdown(
        residual_value=residual_value,
        depreciation=depreciation,
        finance=finance,
        monthly_payment=depreciation + finance,
    )


def _residual_percentage(term_months: int, annual_mileage: int, rate_card: RateCard) -> Decimal:
    base_percentage = rate_card.base_residual_percentages.get(term_months)
    if base_percentage is None:
        terms = ", ".join(str(term) for term in sorted(rate_card.base_residual_percentages))
        raise BusinessRuleError(f"term_months must be one of {terms}, not {term_months}")

    if (
        not rate_card.minimum_annual_mileage <= annual_mileage <= rate_card.maximum_annual_mileage
        or annual_mileage % rate_card.annual_mileage_step != 0
    ):
        raise BusinessRuleError(
            f"annual_mileage must be between {rate_card.minimum_annual_mileage:,} and "
            f"{rate_card.maximum_annual_mileage:,} in steps of "
            f"{rate_card.annual_mileage_step:,}, not {annual_mileage:,}"
        )

    thousands_of_miles_under_standard = (
        Decimal(rate_card.standard_annual_mileage - annual_mileage) / 1_000
    )
    percentage = (
        base_percentage
        + thousands_of_miles_under_standard * rate_card.residual_adjustment_per_thousand_miles
    )
    return min(
        max(percentage, rate_card.minimum_residual_percentage),
        rate_card.maximum_residual_percentage,
    )
