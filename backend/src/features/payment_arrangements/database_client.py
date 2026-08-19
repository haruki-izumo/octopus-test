from sqlalchemy.ext.asyncio import AsyncSession

from src.models import BillingDayChange


class BillingDayChangeDatabaseClient:
    async def create(self, session: AsyncSession, change: BillingDayChange) -> None:
        session.add(change)
        await session.flush()
