from pydantic_settings import BaseSettings


class Config(BaseSettings):
    database_url: str = (
        "postgresql+asyncpg://lease_contract_service:lease_contract_service"
        "@localhost:5434/lease_contract_service"
    )
