from datetime import UTC, date, datetime

import pytest

from src.common.dates import FixedClock


class TestClock:
    @pytest.mark.parametrize(
        ("now", "expected_today"),
        [
            pytest.param(datetime(2026, 3, 28, 23, 30, tzinfo=UTC), date(2026, 3, 28), id="gmt"),
            pytest.param(datetime(2026, 3, 29, 23, 30, tzinfo=UTC), date(2026, 3, 30), id="bst"),
        ],
    )
    def test_today(self, now: datetime, expected_today: date) -> None:
        assert FixedClock(now).today() == expected_today

    def test_fixed_clock__naive_datetime(self) -> None:
        with pytest.raises(ValueError, match="timezone-aware"):
            FixedClock(datetime(2026, 3, 10, 9, 30))  # noqa: DTZ001
