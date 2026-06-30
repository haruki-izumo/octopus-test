from abc import ABC, abstractmethod
from calendar import monthrange
from datetime import UTC, date, datetime
from zoneinfo import ZoneInfo

UK_TIMEZONE = ZoneInfo("Europe/London")


class BusinessDate(date):
    """A UK calendar date, such as a contract's start date or a billing date."""

    @classmethod
    def from_date(cls, value: date) -> BusinessDate:
        return cls(value.year, value.month, value.day)

    def add_months(self, months: int) -> BusinessDate:
        """The same day `months` later, or the last day of that month if it's shorter."""
        year, month_index = divmod(self.year * 12 + self.month - 1 + months, 12)
        month = month_index + 1
        return BusinessDate(year, month, min(self.day, monthrange(year, month)[1]))

    def next_occurrence_of_day(self, day: int) -> BusinessDate:
        """The first date after this one that falls on the given day of the month."""
        # Days 29 to 31 don't occur in every month.
        if not 1 <= day <= 28:
            raise ValueError(f"day must be between 1 and 28, not {day}")
        occurrence = BusinessDate(self.year, self.month, day)
        return occurrence if occurrence > self else occurrence.add_months(1)


class Clock(ABC):
    @abstractmethod
    def now(self) -> datetime:
        """The current time, in UTC."""

    def today(self) -> BusinessDate:
        """Today's date in the UK."""
        return BusinessDate.from_date(self.now().astimezone(UK_TIMEZONE).date())


class SystemClock(Clock):
    def now(self) -> datetime:
        return datetime.now(UTC)


class FixedClock(Clock):
    def __init__(self, now: datetime) -> None:
        if now.tzinfo is None:
            raise ValueError("FixedClock needs a timezone-aware datetime")
        self._now = now.astimezone(UTC)

    def now(self) -> datetime:
        return self._now
