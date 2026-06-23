from abc import ABC, abstractmethod
from datetime import UTC, date, datetime
from zoneinfo import ZoneInfo

UK_TIMEZONE = ZoneInfo("Europe/London")


class Clock(ABC):
    @abstractmethod
    def now(self) -> datetime:
        """The current time, in UTC."""

    def today(self) -> date:
        """Today's date in the UK."""
        return self.now().astimezone(UK_TIMEZONE).date()


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
