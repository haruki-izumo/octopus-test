import operator
from collections.abc import Callable
from decimal import Decimal
from typing import Any

import pytest

from src.common.money import MoneyInt


class TestMoneyInt:
    @pytest.mark.parametrize(
        ("pence", "factor", "expected_pence"),
        [
            pytest.param(1000, Decimal("0.5"), 500, id="exact"),
            pytest.param(1, Decimal("0.5"), 1, id="half_rounds_up"),
            pytest.param(5, Decimal("0.5"), 3, id="half_rounds_up_not_to_even"),
            pytest.param(1000, Decimal("0.0004"), 0, id="below_half_rounds_down"),
            pytest.param(-5, Decimal("0.5"), -3, id="negative_half_rounds_away_from_zero"),
        ],
    )
    def test_multiply(self, pence: int, factor: Decimal, expected_pence: int) -> None:
        assert MoneyInt(pence) * factor == MoneyInt(expected_pence)

    @pytest.mark.parametrize(
        ("pence", "divisor", "expected_pence"),
        [
            pytest.param(900, 3, 300, id="exact"),
            pytest.param(100, 3, 33, id="rounds_down"),
            pytest.param(200, 3, 67, id="rounds_up"),
            pytest.param(5, 2, 3, id="half_rounds_up"),
        ],
    )
    def test_divide(self, pence: int, divisor: int, expected_pence: int) -> None:
        assert MoneyInt(pence) / divisor == MoneyInt(expected_pence)

    def test_add_and_subtract(self) -> None:
        assert MoneyInt(150) + MoneyInt(50) == MoneyInt(200)
        assert MoneyInt(150) - MoneyInt(200) == MoneyInt(-50)

    def test_compare(self) -> None:
        assert MoneyInt(100) < MoneyInt(101)
        assert MoneyInt(100) >= MoneyInt(100)

    @pytest.mark.parametrize(
        ("pounds", "pence", "pounds_again"),
        [
            pytest.param(Decimal("765.56"), 76556, "765.56", id="pounds_and_pence"),
            pytest.param(Decimal("40000"), 4000000, "40000.00", id="whole_pounds"),
            pytest.param(Decimal("0.1"), 10, "0.10", id="one_decimal_place"),
        ],
    )
    def test_from_pounds_and_to_pounds(
        self, pounds: Decimal, pence: int, pounds_again: str
    ) -> None:
        money = MoneyInt.from_pounds(pounds)

        assert money == MoneyInt(pence)
        assert str(money.to_pounds()) == pounds_again

    def test_from_pounds__part_of_a_penny(self) -> None:
        with pytest.raises(ValueError, match="whole number of pence"):
            MoneyInt.from_pounds(Decimal("1.005"))

    @pytest.mark.parametrize("pence", [1.5, True, Decimal(1)])
    def test_create__not_whole_pence(self, pence: Any) -> None:
        with pytest.raises(TypeError):
            MoneyInt(pence)

    def test_from_pounds__float(self) -> None:
        pounds: Any = 1.5

        with pytest.raises(TypeError):
            MoneyInt.from_pounds(pounds)

    @pytest.mark.parametrize(
        ("operation", "left", "right"),
        [
            pytest.param(operator.add, MoneyInt(100), 1, id="add_int"),
            pytest.param(operator.add, 1, MoneyInt(100), id="add_to_int"),
            pytest.param(operator.sub, MoneyInt(100), 1, id="subtract_int"),
            pytest.param(operator.mul, MoneyInt(100), 2, id="multiply_by_int"),
            pytest.param(operator.mul, MoneyInt(100), 0.5, id="multiply_by_float"),
            pytest.param(operator.mul, MoneyInt(100), MoneyInt(2), id="multiply_by_money"),
            pytest.param(operator.truediv, MoneyInt(100), 2.0, id="divide_by_float"),
            pytest.param(operator.truediv, MoneyInt(100), Decimal(2), id="divide_by_decimal"),
            pytest.param(operator.lt, MoneyInt(100), 101, id="compare_with_int"),
        ],
    )
    def test_mixing_with_plain_numbers(
        self, operation: Callable[[Any, Any], Any], left: Any, right: Any
    ) -> None:
        with pytest.raises(TypeError):
            operation(left, right)
