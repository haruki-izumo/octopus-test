from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from src.common.audit import AuditWriter
from src.common.contracts import ContractDatabaseClient
from src.common.database import Database
from src.common.dates import Clock
from src.common.errors import register_error_handlers
from src.common.idempotency import register_idempotency
from src.common.outbox import OutboxWriter
from src.config import Config
from src.features.lease_origination import routes as lease_origination
from src.features.lease_origination.controller import LeaseOriginationController
from src.features.payment_arrangements import routes as payment_arrangements
from src.features.payment_arrangements.controller import PaymentArrangementsController
from src.features.payment_arrangements.database_client import BillingDayChangeDatabaseClient


def create_application(config: Config, clock: Clock) -> FastAPI:
    database = Database(config.database_url)

    @asynccontextmanager
    async def lifespan(application: FastAPI) -> AsyncIterator[None]:
        yield
        await database.dispose()

    application = FastAPI(title="Lease Contract Service", lifespan=lifespan)
    application.state.database = database
    register_error_handlers(application)
    register_idempotency(application, database)

    contracts = ContractDatabaseClient()
    audit = AuditWriter()
    outbox = OutboxWriter()
    application.include_router(
        lease_origination.create_router(
            LeaseOriginationController(
                contracts=contracts,
                audit=audit,
                outbox=outbox,
                rate_card=config.rate_card,
                clock=clock,
            )
        )
    )
    application.include_router(
        payment_arrangements.create_router(
            PaymentArrangementsController(
                contracts=contracts,
                billing_day_changes=BillingDayChangeDatabaseClient(),
                audit=audit,
                outbox=outbox,
                clock=clock,
            )
        )
    )

    @application.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    return application
