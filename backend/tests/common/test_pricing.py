from decimal import Decimal

import pytest

from src.common.errors import BusinessRuleError
from src.common.money import MoneyInt
from src.common.pricing import (
    MonthlyPaymentBreakdown,
    RateCard,
    calculate_monthly_payment,
    calculate_residual_value,
)

RATE_CARD = RateCard()
# The standard rate card never reaches the residual limits, so these change the base percentage.
HIGH_RATE_CARD = RateCard(base_residual_percentages={36: Decimal("0.62")})
LOW_RATE_CARD = RateCard(base_residual_percentages={48: Decimal("0.30")})


def pounds(amount: str) -> MoneyInt:
    return MoneyInt.from_pounds(Decimal(amount))


class TestCalculateMonthlyPayment:
    @pytest.mark.parametrize(
        (
            "vehicle_price",
            "term_months",
            "annual_mileage",
            "rate_card",
            "residual_value",
            "depreciation",
            "finance",
            "monthly_payment",
        ),
        [
            pytest.param(
                "40000", 36, 10_000, RATE_CARD, "20000.00", "555.56", "210.00", "765.56",
                id="standard_mileage",
            ),
            pytest.param(
                "32500", 24, 15_000, RATE_CARD, "16900.00", "650.00", "172.90", "822.90",
                id="above_standard_mileage",
            ),
            pytest.param(
                "28000", 48, 12_000, RATE_CARD, "11088.00", "352.33", "136.81", "489.14",
                id="48_months",
            ),
            pytest.param(
                "25000", 36, 5_000, RATE_CARD, "14000.00", "305.56", "136.50", "442.06",
                id="lowest_mileage",
            ),
            pytest.param(
                "45000", 24, 30_000, RATE_CARD, "15300.00", "1237.50", "211.05", "1448.55",
                id="highest_mileage",
            ),
            pytest.param(
                "30000", 36, 5_000, HIGH_RATE_CARD, "19500.00", "291.67", "173.25", "464.92",
                id="residual_held_at_maximum",
            ),
            pytest.param(
                "20000", 48, 30_000, LOW_RATE_CARD, "3000.00", "354.17", "80.50", "434.67",
                id="residual_held_at_minimum",
            ),
            pytest.param(
                "22509", 36, 10_000, RATE_CARD, "11254.50", "312.63", "118.17", "430.80",
                id="depreciation_exactly_half_a_penny_rounds_up",
            ),
        ],
    )  # fmt: skip
    def test_calculate_monthly_payment(
        self,
        vehicle_price: str,
        term_months: int,
        annual_mileage: int,
        rate_card: RateCard,
        residual_value: str,
        depreciation: str,
        finance: str,
        monthly_payment: str,
    ) -> None:
        breakdown = calculate_monthly_payment(
            pounds(vehicle_price), term_months, annual_mileage, rate_card
        )

        assert breakdown == MonthlyPaymentBreakdown(
            residual_value=pounds(residual_value),
            depreciation=pounds(depreciation),
            finance=pounds(finance),
            monthly_payment=pounds(monthly_payment),
        )

    @pytest.mark.parametrize("term_months", [0, 12, 30, 60])
    def test_calculate_monthly_payment__invalid_term(self, term_months: int) -> None:
        with pytest.raises(BusinessRuleError, match="term_months must be one of 24, 36, 48"):
            calculate_monthly_payment(pounds("40000"), term_months, 10_000, RATE_CARD)

    @pytest.mark.parametrize("annual_mileage", [4_000, 31_000, 10_500])
    def test_calculate_monthly_payment__invalid_mileage(self, annual_mileage: int) -> None:
        with pytest.raises(BusinessRuleError, match="annual_mileage must be between"):
            calculate_monthly_payment(pounds("40000"), 36, annual_mileage, RATE_CARD)


class TestCalculateResidualValue:
    def test_calculate_residual_value(self) -> None:
        assert calculate_residual_value(pounds("32500"), 24, 15_000, RATE_CARD) == pounds("16900")
