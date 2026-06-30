from datetime import UTC, date, datetime

import pytest

from src.common.dates import BusinessDate, FixedClock


class TestBusinessDate:
    @pytest.mark.parametrize(
        ("start", "months", "expected"),
        [
            pytest.param(date(2026, 1, 15), 1, date(2026, 2, 15), id="mid_month"),
            pytest.param(date(2026, 1, 31), 1, date(2026, 2, 28), id="clamps_to_month_end"),
            pytest.param(date(2028, 1, 31), 1, date(2028, 2, 29), id="clamps_in_leap_year"),
            pytest.param(date(2026, 3, 31), 1, date(2026, 4, 30), id="clamps_to_30_days"),
            pytest.param(date(2026, 11, 30), 3, date(2027, 2, 28), id="crosses_year_end"),
            pytest.param(date(2026, 3, 10), 36, date(2029, 3, 10), id="several_years"),
            pytest.param(date(2026, 3, 31), -1, date(2026, 2, 28), id="backwards"),
        ],
    )
    def test_add_months(self, start: date, months: int, expected: date) -> None:
        assert BusinessDate.from_date(start).add_months(months) == expected

    @pytest.mark.parametrize(
        ("start", "day", "expected"),
        [
            pytest.param(date(2026, 3, 10), 15, date(2026, 3, 15), id="later_this_month"),
            pytest.param(date(2026, 3, 10), 10, date(2026, 4, 10), id="today_is_that_day"),
            pytest.param(date(2026, 3, 10), 1, date(2026, 4, 1), id="earlier_this_month"),
            pytest.param(date(2026, 12, 20), 5, date(2027, 1, 5), id="crosses_year_end"),
        ],
    )
    def test_next_occurrence_of_day(self, start: date, day: int, expected: date) -> None:
        assert BusinessDate.from_date(start).next_occurrence_of_day(day) == expected

    @pytest.mark.parametrize("day", [0, 29])
    def test_next_occurrence_of_day__day_not_in_every_month(self, day: int) -> None:
        with pytest.raises(ValueError, match="between 1 and 28"):
            BusinessDate(2026, 3, 10).next_occurrence_of_day(day)


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
