from sqlalchemy.ext.asyncio import AsyncSession

from src.events.catalogue import CATALOGUE, Event
from src.models import OutboxMessage


class OutboxWriter:
    def enqueue(self, session: AsyncSession, event: Event) -> None:
        """Adds the event to the current transaction. `relay_outbox` sends it after it commits."""
        if CATALOGUE.get(event.event_type) is not type(event):
            raise ValueError(f"{type(event).__name__} isn't in the event catalogue")
        session.add(
            OutboxMessage(event_type=event.event_type, payload=event.model_dump(mode="json"))
        )
