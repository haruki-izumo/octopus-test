"""Sends saved events to other services.

Run it with `uv run python -m src.cli.relay_outbox`.
"""

import asyncio
import logging

from sqlalchemy import select

from src.common.database import Database
from src.common.dates import Clock, SystemClock
from src.config import Config
from src.models import JsonObject, OutboxMessage

logger = logging.getLogger(__name__)

BATCH_SIZE = 100
SECONDS_BETWEEN_CHECKS = 1


class LoggingPublisher:
    """Publishes events by writing them to the log."""

    def publish(self, event_type: str, payload: JsonObject) -> None:
        logger.info("Published %s %s", event_type, payload)


async def relay_batch(database: Database, publisher: LoggingPublisher, clock: Clock) -> int:
    """Sends up to one batch of unsent messages, oldest first. Returns how many were sent."""
    async with database.sessions.begin() as session:
        result = await session.scalars(
            select(OutboxMessage)
            .where(OutboxMessage.sent_at.is_(None))
            .order_by(OutboxMessage.id)
            .limit(BATCH_SIZE)
            # Lets more than one relay run without sending the same message twice.
            .with_for_update(skip_locked=True)
        )
        messages = result.all()
        for message in messages:
            publisher.publish(message.event_type, message.payload)
            message.sent_at = clock.now()
    return len(messages)


async def main() -> None:
    database = Database(Config().database_url)
    publisher = LoggingPublisher()
    clock = SystemClock()
    try:
        while True:
            if await relay_batch(database, publisher, clock) == 0:
                await asyncio.sleep(SECONDS_BETWEEN_CHECKS)
    finally:
        await database.dispose()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
