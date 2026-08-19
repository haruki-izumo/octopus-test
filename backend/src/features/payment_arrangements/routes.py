from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.common.audit import Actor
from src.common.database import get_session
from src.common.idempotency import idempotent
from src.features.payment_arrangements.controller import PaymentArrangementsController
from src.features.payment_arrangements.schemas import (
    BillingDayChangeResponse,
    CreateBillingDayChangeRequest,
)


def create_router(controller: PaymentArrangementsController) -> APIRouter:
    router = APIRouter(prefix="/billing-day-changes", tags=["Payment arrangements"])

    @router.post("", status_code=201, dependencies=[Depends(idempotent)])
    async def create_billing_day_change(
        request: CreateBillingDayChangeRequest,
        session: Annotated[AsyncSession, Depends(get_session)],
        actor: Actor,
    ) -> BillingDayChangeResponse:
        return await controller.change_billing_day(session, request, actor)

    return router
