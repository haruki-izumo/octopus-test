from collections.abc import AsyncIterator

from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine


class Database:
    def __init__(self, url: str) -> None:
        self.engine = create_async_engine(url)
        self.sessions = async_sessionmaker(self.engine, expire_on_commit=False)

    async def dispose(self) -> None:
        await self.engine.dispose()


async def get_session(request: Request) -> AsyncIterator[AsyncSession]:
    """A FastAPI dependency that gives each request its own session."""
    database: Database = request.app.state.database
    async with database.sessions() as session:
        yield session
