import asyncio
import os
import subprocess
import sys
from collections.abc import AsyncIterator, Awaitable, Callable
from datetime import UTC, datetime
from typing import Any

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy import make_url, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from src.application import create_application
from src.common.contracts import ContractDatabaseClient
from src.common.database import Database
from src.common.dates import FixedClock
from src.config import Config
from src.models import Base, Contract
from tests.factories import ContractFactory

ACTOR = "agent-1042"


@pytest.fixture(scope="session")
def database_url() -> str:
    """A newly migrated database for each test run, kept apart from the one used locally."""
    url = make_url(Config().database_url)
    test_database = f"{url.database}_test"
    asyncio.run(_recreate_database(url.render_as_string(hide_password=False), test_database))
    test_url = url.set(database=test_database).render_as_string(hide_password=False)
    subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        env={**os.environ, "DATABASE_URL": test_url},
        check=True,
        capture_output=True,
    )
    return test_url


async def _recreate_database(url: str, name: str) -> None:
    engine = create_async_engine(url, isolation_level="AUTOCOMMIT")
    async with engine.connect() as connection:
        await connection.execute(text(f'DROP DATABASE IF EXISTS "{name}" WITH (FORCE)'))
        await connection.execute(text(f'CREATE DATABASE "{name}"'))
    await engine.dispose()


@pytest.fixture
def clock() -> FixedClock:
    return FixedClock(datetime(2026, 3, 10, 9, 30, tzinfo=UTC))


@pytest.fixture
async def application(database_url: str, clock: FixedClock) -> AsyncIterator[FastAPI]:
    application = create_application(Config(database_url=database_url), clock)
    yield application
    database: Database = application.state.database
    tables = ", ".join(table.name for table in Base.metadata.sorted_tables)
    async with database.engine.begin() as connection:
        await connection.execute(text(f"TRUNCATE {tables} RESTART IDENTITY"))
    await database.dispose()


@pytest.fixture
def database(application: FastAPI) -> Database:
    return application.state.database


@pytest.fixture
async def client(application: FastAPI) -> AsyncIterator[AsyncClient]:
    async with AsyncClient(
        transport=ASGITransport(app=application),
        base_url="http://test",
        headers={"X-Actor": ACTOR},
    ) as client:
        yield client


@pytest.fixture
async def session(database: Database) -> AsyncIterator[AsyncSession]:
    """For checking what was saved."""
    async with database.sessions() as session:
        yield session


@pytest.fixture
def create_contract(database: Database) -> Callable[..., Awaitable[Contract]]:
    async def create(**attributes: Any) -> Contract:
        contract = ContractFactory.build(**attributes)
        async with database.sessions.begin() as session:
            await ContractDatabaseClient().create(session, contract)
        return contract

    return create
