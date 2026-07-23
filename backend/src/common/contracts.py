from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.exc import StaleDataError

from src.common.errors import ConflictError, NotFoundError
from src.models import Contract


class ContractDatabaseClient:
    """All reads and writes of the contracts table go through here."""

    async def get_by_uuid(self, session: AsyncSession, contract_uuid: UUID) -> Contract:
        contract = await session.scalar(select(Contract).where(Contract.uuid == contract_uuid))
        if contract is None:
            raise NotFoundError(f"Contract {contract_uuid} not found")
        return contract

    async def create(self, session: AsyncSession, contract: Contract) -> None:
        session.add(contract)
        await session.flush()

    async def update(
        self, session: AsyncSession, contract: Contract, expected_version: int
    ) -> None:
        """Saves changes to a contract, if nobody else has changed it since `expected_version`."""
        conflict = ConflictError(f"Contract {contract.uuid} was changed by another request")
        if contract.version != expected_version:
            raise conflict
        try:
            await session.flush()
        except StaleDataError as error:
            raise conflict from error
