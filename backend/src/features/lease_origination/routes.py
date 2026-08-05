from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.common.audit import Actor
from src.common.database import get_session
from src.common.idempotency import idempotent
from src.features.lease_origination.controller import LeaseOriginationController
from src.features.lease_origination.schemas import ContractResponse, CreateContractRequest


def create_router(controller: LeaseOriginationController) -> APIRouter:
    router = APIRouter(prefix="/contracts", tags=["Contracts"])

    @router.post("", status_code=201, dependencies=[Depends(idempotent)])
    async def create_contract(
        request: CreateContractRequest,
        session: Annotated[AsyncSession, Depends(get_session)],
        actor: Actor,
    ) -> ContractResponse:
        return await controller.create_contract(session, request, actor)

    @router.get("/{contract_uuid}")
    async def get_contract(
        contract_uuid: UUID, session: Annotated[AsyncSession, Depends(get_session)]
    ) -> ContractResponse:
        return await controller.get_contract(session, contract_uuid)

    return router
