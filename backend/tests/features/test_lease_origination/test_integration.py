from collections.abc import Awaitable, Callable
from datetime import date, datetime
from typing import Any
from uuid import uuid4

import pytest
from httpx import AsyncClient, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.common.money import MoneyInt
from src.enums import AuditAction, ContractStatus
from src.models import AuditEntry, Contract, OutboxMessage
from tests.conftest import ACTOR

CUSTOMER_UUID = "0b9f3c2e-5d4a-4f1e-9a8b-7c6d5e4f3a2b"
CREATE_CONTRACT_BODY = {
    "customer_uuid": CUSTOMER_UUID,
    "vehicle": {"make": "Kia", "model": "EV6", "registration": "LC25 ABC", "price": "40000.00"},
    "term_months": 36,
    "annual_mileage": 10_000,
    "start_date": "2026-03-01",
    "billing_day": 1,
}


async def post_contract(client: AsyncClient, body: dict[str, Any]) -> Response:
    return await client.post("/contracts", json=body, headers={"Idempotency-Key": str(uuid4())})


class TestCreateContract:
    async def test_create_contract(self, client: AsyncClient, session: AsyncSession) -> None:
        response = await post_contract(client, CREATE_CONTRACT_BODY)

        assert response.status_code == 201
        contract = await session.scalar(select(Contract))
        assert contract is not None
        assert response.json() == {
            "uuid": str(contract.uuid),
            "customer_uuid": CUSTOMER_UUID,
            "status": "ACTIVE",
            "vehicle": {"make": "Kia", "model": "EV6", "registration": "LC25 ABC"},
            "start_date": "2026-03-01",
            "end_date": "2029-02-28",
            "term_months": 36,
            "annual_mileage": 10_000,
            "monthly_payment": "765.56",
            "billing_day": 1,
            "months_remaining": 36,
        }
        assert contract.residual_value == MoneyInt(2_000_000)
        assert contract.monthly_payment == MoneyInt(76_556)
        assert contract.version == 1

        audit_entry = await session.scalar(select(AuditEntry))
        assert audit_entry is not None
        assert audit_entry.contract_id == contract.id
        assert audit_entry.action == AuditAction.CONTRACT_CREATED
        assert audit_entry.before is None
        assert audit_entry.after["monthly_payment_pence"] == 76_556
        assert audit_entry.actor == ACTOR

        message = await session.scalar(select(OutboxMessage))
        assert message is not None
        assert message.event_type == "contract.created"
        assert message.payload["contract_uuid"] == str(contract.uuid)
        assert message.payload["customer_uuid"] == CUSTOMER_UUID
        assert datetime.fromisoformat(message.payload["created_at"]) == contract.created_at

    @pytest.mark.parametrize(
        ("field", "value"),
        [
            pytest.param("term_months", 30, id="invalid_term"),
            pytest.param("annual_mileage", 10_500, id="invalid_mileage"),
        ],
    )
    async def test_create_contract__invalid_term_or_mileage(
        self, client: AsyncClient, session: AsyncSession, field: str, value: int
    ) -> None:
        response = await post_contract(client, {**CREATE_CONTRACT_BODY, field: value})

        assert response.status_code == 422
        assert response.json()["error"]["code"] == "BUSINESS_RULE_BROKEN"
        assert await session.scalar(select(Contract)) is None
        assert await session.scalar(select(AuditEntry)) is None
        assert await session.scalar(select(OutboxMessage)) is None


class TestGetContract:
    async def test_get_contract(
        self, client: AsyncClient, create_contract: Callable[..., Awaitable[Contract]]
    ) -> None:
        contract = await create_contract(
            status=ContractStatus.ACTIVE, start_date=date(2025, 9, 1), billing_day=1
        )

        response = await client.get(f"/contracts/{contract.uuid}")

        assert response.status_code == 200
        assert response.json() == {
            "uuid": str(contract.uuid),
            "customer_uuid": str(contract.customer_uuid),
            "status": "ACTIVE",
            "vehicle": {
                "make": "Kia",
                "model": "EV6",
                "registration": contract.vehicle_registration,
            },
            "start_date": "2025-09-01",
            "end_date": "2028-08-31",
            "term_months": 36,
            "annual_mileage": 10_000,
            "monthly_payment": "765.56",
            "billing_day": 1,
            "months_remaining": 30,
        }

    async def test_get_contract__unknown_contract(self, client: AsyncClient) -> None:
        response = await client.get(f"/contracts/{uuid4()}")

        assert response.status_code == 404
        assert response.json()["error"]["code"] == "NOT_FOUND"
