from datetime import date

import pytest

from src.common.errors import BusinessRuleError
from src.enums import ContractStatus
from tests.factories import ContractFactory


class TestContract:
    @pytest.mark.parametrize(
        ("start_date", "term_months", "end_date"),
        [
            pytest.param(date(2026, 3, 10), 36, date(2029, 3, 9), id="mid_month"),
            pytest.param(date(2026, 3, 1), 36, date(2029, 2, 28), id="first_of_month"),
            pytest.param(date(2026, 1, 31), 24, date(2028, 1, 30), id="month_end"),
        ],
    )
    def test_end_date(self, start_date: date, term_months: int, end_date: date) -> None:
        contract = ContractFactory.build(start_date=start_date, term_months=term_months)

        assert contract.end_date == end_date

    @pytest.mark.parametrize(
        ("as_of", "months_remaining"),
        [
            pytest.param(date(2026, 2, 1), 36, id="before_start"),
            pytest.param(date(2026, 3, 10), 36, id="start_date"),
            pytest.param(date(2026, 4, 9), 36, id="part_way_through_first_month"),
            pytest.param(date(2026, 4, 10), 35, id="second_month"),
            pytest.param(date(2029, 3, 9), 1, id="end_date"),
            pytest.param(date(2029, 3, 10), 0, id="after_end_date"),
        ],
    )
    def test_months_remaining(self, as_of: date, months_remaining: int) -> None:
        contract = ContractFactory.build(start_date=date(2026, 3, 10), term_months=36)

        assert contract.months_remaining(as_of) == months_remaining

    @pytest.mark.parametrize(
        ("current", "new"),
        [
            (ContractStatus.ACTIVE, ContractStatus.PENDING_VARIATION),
            (ContractStatus.PENDING_VARIATION, ContractStatus.ACTIVE),
            (ContractStatus.ACTIVE, ContractStatus.TERMINATED),
        ],
    )
    def test_change_status(self, current: ContractStatus, new: ContractStatus) -> None:
        contract = ContractFactory.build(status=current)

        contract.change_status(new)

        assert contract.status == new

    @pytest.mark.parametrize(
        ("current", "new"),
        [
            (ContractStatus.PENDING_VARIATION, ContractStatus.TERMINATED),
            (ContractStatus.TERMINATED, ContractStatus.ACTIVE),
            (ContractStatus.TERMINATED, ContractStatus.PENDING_VARIATION),
            (ContractStatus.ACTIVE, ContractStatus.ACTIVE),
        ],
    )
    def test_change_status__not_allowed(self, current: ContractStatus, new: ContractStatus) -> None:
        contract = ContractFactory.build(status=current)

        with pytest.raises(BusinessRuleError, match="can't change"):
            contract.change_status(new)

        assert contract.status == current
