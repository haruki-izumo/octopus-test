from typing import Annotated

from fastapi import Header
from sqlalchemy.ext.asyncio import AsyncSession

from src.enums import AuditAction
from src.models import AuditEntry, Contract, JsonObject

# Who is making a change, such as an agent's ID, recorded in the audit entry.
Actor = Annotated[str, Header(alias="X-Actor", min_length=1)]


class AuditWriter:
    def record(
        self,
        session: AsyncSession,
        contract: Contract,
        action: AuditAction,
        before: JsonObject | None,
        after: JsonObject,
        actor: str,
    ) -> None:
        """Adds an audit entry to the current transaction."""
        session.add(
            AuditEntry(
                contract_id=contract.id, action=action, before=before, after=after, actor=actor
            )
        )
