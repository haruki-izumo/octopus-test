"""Makes it safe for clients to retry requests that create or change data.

Clients send a unique `Idempotency-Key` header with each action. The first
request with a key claims it, and its response is saved once it succeeds. A
retry with the same key and body gets the saved response back, without the
work being done again.
"""

import hashlib
import json
from typing import Annotated, Any

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy import delete, select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from src.common.database import Database, get_session
from src.common.errors import ConflictError, IdempotencyKeyReusedError
from src.models import IdempotencyKey

HEADER = "Idempotency-Key"


class _AlreadyHandledError(Exception):
    def __init__(self, status_code: int, body: Any) -> None:
        super().__init__(status_code)
        self.status_code = status_code
        self.body = body


async def idempotent(
    request: Request, session: Annotated[AsyncSession, Depends(get_session)]
) -> None:
    """A dependency for every endpoint that creates or changes data."""
    key = request.headers.get(HEADER)
    if not key:
        raise HTTPException(status_code=400, detail=f"The {HEADER} header is required")
    request_hash = hashlib.sha256(
        f"{request.method} {request.url.path}\n".encode() + await request.body()
    ).hexdigest()

    async with session.begin():
        claimed = await session.scalar(
            insert(IdempotencyKey)
            .values(key=key, request_hash=request_hash)
            .on_conflict_do_nothing(index_elements=[IdempotencyKey.key])
            .returning(IdempotencyKey.id)
        )
        existing = (
            None
            if claimed
            else await session.scalar(select(IdempotencyKey).where(IdempotencyKey.key == key))
        )

    if claimed:
        request.state.idempotency_key = key
    elif existing is None or existing.response_status is None:
        raise ConflictError(f"A request with this {HEADER} is still being handled")
    elif existing.request_hash != request_hash:
        raise IdempotencyKeyReusedError(f"This {HEADER} was already used for a different request")
    else:
        raise _AlreadyHandledError(existing.response_status, existing.response_body)


class IdempotencyMiddleware:
    """Saves the response to a request that claimed a key, or releases the key if it failed."""

    def __init__(self, app: ASGIApp, database: Database) -> None:
        self.app = app
        self.database = database

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        response_start: Message = {}
        body = bytearray()

        async def send_after_saving(message: Message) -> None:
            key = scope.get("state", {}).get("idempotency_key")
            if key is None:
                await send(message)
                return
            if message["type"] == "http.response.start":
                response_start.update(message)
                return
            body.extend(message.get("body", b""))
            if message.get("more_body", False):
                return
            await self._finish(key, response_start["status"], bytes(body))
            await send(response_start)
            await send({"type": "http.response.body", "body": bytes(body)})

        try:
            await self.app(scope, receive, send_after_saving)
        except Exception:
            key = scope.get("state", {}).get("idempotency_key")
            if key is not None:
                await self._finish(key, 500, b"")
            raise

    async def _finish(self, key: str, status_code: int, body: bytes) -> None:
        async with self.database.sessions.begin() as session:
            if 200 <= status_code < 300:
                await session.execute(
                    update(IdempotencyKey)
                    .where(IdempotencyKey.key == key)
                    .values(response_status=status_code, response_body=json.loads(body))
                )
            else:
                # Nothing was saved, so the client can safely retry with the same key.
                await session.execute(delete(IdempotencyKey).where(IdempotencyKey.key == key))


def register_idempotency(application: FastAPI, database: Database) -> None:
    application.add_middleware(IdempotencyMiddleware, database=database)

    @application.exception_handler(_AlreadyHandledError)
    async def replay_saved_response(request: Request, error: _AlreadyHandledError) -> JSONResponse:
        return JSONResponse(status_code=error.status_code, content=error.body)
