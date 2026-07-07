from fastapi import FastAPI

from src.common.dates import Clock
from src.common.errors import register_error_handlers
from src.config import Config


def create_application(config: Config, clock: Clock) -> FastAPI:
    application = FastAPI(title="Lease Contract Service")
    register_error_handlers(application)

    @application.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    return application
