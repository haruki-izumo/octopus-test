from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal

from sqlalchemy import BigInteger, Dialect
from sqlalchemy.types import TypeDecorator

PENCE_PER_POUND = 100


@dataclass(frozen=True, slots=True, order=True)
class MoneyInt:
    """An amount of money in whole pence."""

    pence: int

    def __post_init__(self) -> None:
        # `type` rather than `isinstance`, so that `True` isn't accepted as a penny.
        if type(self.pence) is not int:
            raise TypeError(f"MoneyInt needs a whole number of pence, not {self.pence!r}")

    @classmethod
    def from_pounds(cls, pounds: Decimal) -> MoneyInt:
        if not isinstance(pounds, Decimal):
            raise TypeError(f"MoneyInt.from_pounds needs a Decimal, not {pounds!r}")
        pence = pounds * PENCE_PER_POUND
        if pence != pence.to_integral_value():
            raise ValueError(f"{pounds} is not a whole number of pence")
        return cls(int(pence))

    def to_pounds(self) -> Decimal:
        return (Decimal(self.pence) / PENCE_PER_POUND).quantize(Decimal("0.01"))

    def __add__(self, other: MoneyInt) -> MoneyInt:
        if not isinstance(other, MoneyInt):
            return NotImplemented
        return MoneyInt(self.pence + other.pence)

    def __sub__(self, other: MoneyInt) -> MoneyInt:
        if not isinstance(other, MoneyInt):
            return NotImplemented
        return MoneyInt(self.pence - other.pence)

    def __mul__(self, factor: Decimal) -> MoneyInt:
        if not isinstance(factor, Decimal):
            return NotImplemented
        return MoneyInt(_round_to_penny(self.pence * factor))

    def __truediv__(self, divisor: int) -> MoneyInt:
        if type(divisor) is not int:
            return NotImplemented
        return MoneyInt(_round_to_penny(Decimal(self.pence) / divisor))


def _round_to_penny(pence: Decimal) -> int:
    return int(pence.quantize(Decimal(1), rounding=ROUND_HALF_UP))


class MoneyIntType(TypeDecorator[MoneyInt]):
    """Stores a MoneyInt as a whole number of pence."""

    impl = BigInteger
    cache_ok = True

    def process_bind_param(self, value: MoneyInt | None, dialect: Dialect) -> int | None:
        return None if value is None else value.pence

    def process_result_value(self, value: int | None, dialect: Dialect) -> MoneyInt | None:
        return None if value is None else MoneyInt(value)
