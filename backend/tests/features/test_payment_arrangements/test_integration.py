import asyncio
from collections.abc import Awaitable, Callable
from datetime import date
from typing import Any
from uuid import uuid4

import pytest
from httpx import AsyncClient, Response
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from src.common.contracts import ContractDatabaseClient
from src.common.database import Database
from src.enums import AuditAction, ContractStatus
from src.models import AuditEntry, BillingDayChange, Contract, OutboxMessage
from tests.conftest import ACTOR

CreateContract = Callable[..., Awaitable[Contract]]


async def post_billing_day_change(
    client: AsyncClient, body: dict[str, Any], *, idempotency_key: str | None = None
) -> Response:
    return await client.post(
        "/billing-day-changes",
        json=body,
        headers={"Idempotency-Key": idempotency_key or str(uuid4())},
    )


async def saved[Model: (Contract, BillingDayChange, AuditEntry, OutboxMessage)](
    session: AsyncSession, model: type[Model]
) -> list[Model]:
    return list(await session.scalars(select(model).order_by(model.id)))


async def assert_nothing_saved(session: AsyncSession) -> None:
    assert await saved(session, BillingDayChange) == []
    assert await saved(session, AuditEntry) == []
    assert await saved(session, OutboxMessage) == []


async def wait_until_waiting_for_a_lock(database: Database) -> None:
    for _ in range(100):
        # A new session each time, because Postgres keeps the same view of activity for the
        # whole of a transaction.
        async with database.sessions() as session:
            waiting = await session.scalar(
                text(
                    "SELECT count(*) FROM pg_stat_activity "
                    "WHERE wait_event_type = 'Lock' AND datname = current_database()"
                )
            )
        if waiting:
            return
        await asyncio.sleep(0.05)
    raise AssertionError("No query waited for a lock")


class TestCreateBillingDayChange:
    @pytest.mark.parametrize(
        ("current_billing_day", "effective_from"),
        [
            pytest.param(20, date(2026, 3, 20), id="billing_day_later_this_month"),
            pytest.param(10, date(2026, 4, 10), id="billing_day_is_today"),
            pytest.param(1, date(2026, 4, 1), id="billing_day_earlier_this_month"),
        ],
    )
    async def test_create_billing_day_change(
        self,
        client: AsyncClient,
        session: AsyncSession,
        create_contract: CreateContract,
        current_billing_day: int,
        effective_from: date,
    ) -> None:
        contract = await create_contract(billing_day=current_billing_day)

        response = await post_billing_day_change(
            client, {"contract_uuid": str(contract.uuid), "billing_day": 15}
        )

        assert response.status_code == 201
        [change] = await saved(session, BillingDayChange)
        assert response.json() == {
            "uuid": str(change.uuid),
            "contract_uuid": str(contract.uuid),
            "previous_billing_day": current_billing_day,
            "new_billing_day": 15,
            "effective_from": effective_from.isoformat(),
        }
        assert change.contract_id == contract.id
        assert change.effective_from == effective_from

        [saved_contract] = await saved(session, Contract)
        assert saved_contract.billing_day == 15
        assert saved_contract.version == 2

        [audit_entry] = await saved(session, AuditEntry)
        assert audit_entry.contract_id == contract.id
        assert audit_entry.action == AuditAction.BILLING_DAY_CHANGED
        assert audit_entry.before == {"billing_day": current_billing_day}
        assert audit_entry.after == {"billing_day": 15}
        assert audit_entry.actor == ACTOR

        [message] = await saved(session, OutboxMessage)
        assert message.event_type == "contract.billing_day_changed"
        assert message.payload == {
            "contract_uuid": str(contract.uuid),
            "billing_day_change_uuid": str(change.uuid),
            "effective_from": effective_from.isoformat(),
        }
        assert message.sent_at is None

    @pytest.mark.parametrize("billing_day", [0, 29])
    async def test_create_billing_day_change__invalid_billing_day(
        self,
        client: AsyncClient,
        session: AsyncSession,
        create_contract: CreateContract,
        billing_day: int,
    ) -> None:
        contract = await create_contract()

        response = await post_billing_day_change(
            client, {"contract_uuid": str(contract.uuid), "billing_day": billing_day}
        )

        assert response.status_code == 422
        assert response.json()["error"]["code"] == "INVALID_REQUEST"
        await assert_nothing_saved(session)

    async def test_create_billing_day_change__unknown_contract(
        self, client: AsyncClient, session: AsyncSession
    ) -> None:
        response = await post_billing_day_change(
            client, {"contract_uuid": str(uuid4()), "billing_day": 15}
        )

        assert response.status_code == 404
        assert response.json()["error"]["code"] == "NOT_FOUND"
        await assert_nothing_saved(session)

    @pytest.mark.parametrize(
        "status", [ContractStatus.PENDING_VARIATION, ContractStatus.TERMINATED]
    )
    async def test_create_billing_day_change__contract_not_active(
        self,
        client: AsyncClient,
        session: AsyncSession,
        create_contract: CreateContract,
        status: ContractStatus,
    ) -> None:
        contract = await create_contract(status=status, billing_day=1)

        response = await post_billing_day_change(
            client, {"contract_uuid": str(contract.uuid), "billing_day": 15}
        )

        assert response.status_code == 422
        assert response.json()["error"]["code"] == "BUSINESS_RULE_BROKEN"
        [saved_contract] = await saved(session, Contract)
        assert (saved_contract.billing_day, saved_contract.version) == (1, 1)
        await assert_nothing_saved(session)

    @pytest.mark.parametrize(
        ("start_date", "status_code"),
        [
            pytest.param(date(2023, 4, 10), 422, id="ends_in_30_days"),
            pytest.param(date(2023, 4, 11), 201, id="ends_in_31_days"),
        ],
    )
    async def test_create_billing_day_change__near_end_date(
        self,
        client: AsyncClient,
        create_contract: CreateContract,
        start_date: date,
        status_code: int,
    ) -> None:
        contract = await create_contract(start_date=start_date, term_months=36)

        response = await post_billing_day_change(
            client, {"contract_uuid": str(contract.uuid), "billing_day": 15}
        )

        assert response.status_code == status_code

    async def test_create_billing_day_change__repeated_request(
        self, client: AsyncClient, session: AsyncSession, create_contract: CreateContract
    ) -> None:
        contract = await create_contract()
        body = {"contract_uuid": str(contract.uuid), "billing_day": 15}
        first = await post_billing_day_change(client, body, idempotency_key="key-1")

        repeated = await post_billing_day_change(client, body, idempotency_key="key-1")

        assert repeated.status_code == 201
        assert repeated.json() == first.json()
        assert len(await saved(session, BillingDayChange)) == 1
        assert len(await saved(session, AuditEntry)) == 1
        assert len(await saved(session, OutboxMessage)) == 1
        [saved_contract] = await saved(session, Contract)
        assert saved_contract.version == 2

    async def test_create_billing_day_change__idempotency_key_reused(
        self, client: AsyncClient, session: AsyncSession, create_contract: CreateContract
    ) -> None:
        contract = await create_contract()
        await post_billing_day_change(
            client,
            {"contract_uuid": str(contract.uuid), "billing_day": 15},
            idempotency_key="key-1",
        )

        response = await post_billing_day_change(
            client,
            {"contract_uuid": str(contract.uuid), "billing_day": 20},
            idempotency_key="key-1",
        )

        assert response.status_code == 422
        assert response.json()["error"]["code"] == "IDEMPOTENCY_KEY_REUSED"
        [saved_contract] = await saved(session, Contract)
        assert saved_contract.billing_day == 15
        assert len(await saved(session, BillingDayChange)) == 1

    async def test_create_billing_day_change__missing_idempotency_key(
        self, client: AsyncClient, session: AsyncSession, create_contract: CreateContract
    ) -> None:
        contract = await create_contract()

        response = await client.post(
            "/billing-day-changes", json={"contract_uuid": str(contract.uuid), "billing_day": 15}
        )

        assert response.status_code == 400
        assert response.json()["error"]["code"] == "BAD_REQUEST"
        await assert_nothing_saved(session)

    async def test_create_billing_day_change__contract_changed_at_the_same_time(
        self,
        client: AsyncClient,
        database: Database,
        session: AsyncSession,
        create_contract: CreateContract,
    ) -> None:
        contract = await create_contract(billing_day=1)
        contracts = ContractDatabaseClient()
        async with database.sessions() as other_session:
            other_copy = await contracts.get_by_uuid(other_session, contract.uuid)
            other_copy.billing_day = 20
            # Holds a lock on the contract until the other session commits.
            await contracts.update(other_session, other_copy, expected_version=1)

            request = asyncio.create_task(
                post_billing_day_change(
                    client, {"contract_uuid": str(contract.uuid), "billing_day": 15}
                )
            )
            await wait_until_waiting_for_a_lock(database)
            await other_session.commit()
            response = await request

        assert response.status_code == 409
        assert response.json()["error"]["code"] == "CONFLICT"
        [saved_contract] = await saved(session, Contract)
        assert (saved_contract.billing_day, saved_contract.version) == (20, 2)
        await assert_nothing_saved(session)
