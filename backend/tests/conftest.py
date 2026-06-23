from collections.abc import AsyncIterator
from datetime import UTC, datetime

import pytest
from httpx import ASGITransport, AsyncClient

from src.application import create_application
from src.common.dates import FixedClock
from src.config import Config


@pytest.fixture
def clock() -> FixedClock:
    return FixedClock(datetime(2026, 3, 10, 9, 30, tzinfo=UTC))


@pytest.fixture
async def client(clock: FixedClock) -> AsyncIterator[AsyncClient]:
    application = create_application(Config(), clock)
    async with AsyncClient(
        transport=ASGITransport(app=application), base_url="http://test"
    ) as client:
        yield client
