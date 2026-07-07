from http import HTTPStatus
from typing import ClassVar

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException


class ServiceError(Exception):
    status_code: ClassVar[HTTPStatus]
    code: ClassVar[str]

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


class NotFoundError(ServiceError):
    status_code = HTTPStatus.NOT_FOUND
    code = "NOT_FOUND"


class BusinessRuleError(ServiceError):
    status_code = HTTPStatus.UNPROCESSABLE_CONTENT
    code = "BUSINESS_RULE_BROKEN"


class ConflictError(ServiceError):
    status_code = HTTPStatus.CONFLICT
    code = "CONFLICT"


class IdempotencyKeyReusedError(ServiceError):
    status_code = HTTPStatus.UNPROCESSABLE_CONTENT
    code = "IDEMPOTENCY_KEY_REUSED"


def register_error_handlers(application: FastAPI) -> None:
    """Gives every error response the same body: `{"error": {"code": ..., "message": ...}}`."""

    @application.exception_handler(ServiceError)
    async def handle_service_error(request: Request, error: ServiceError) -> JSONResponse:
        return _error_response(error.status_code, error.code, error.message)

    @application.exception_handler(RequestValidationError)
    async def handle_validation_error(
        request: Request, error: RequestValidationError
    ) -> JSONResponse:
        message = "; ".join(
            f"{'.'.join(str(part) for part in detail['loc'])}: {detail['msg']}"
            for detail in error.errors()
        )
        return _error_response(HTTPStatus.UNPROCESSABLE_CONTENT, "INVALID_REQUEST", message)

    @application.exception_handler(HTTPException)
    async def handle_http_exception(request: Request, error: HTTPException) -> JSONResponse:
        return _error_response(error.status_code, HTTPStatus(error.status_code).name, error.detail)


def _error_response(status_code: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code, content={"error": {"code": code, "message": message}}
    )
