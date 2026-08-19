FROM python:3.14-slim AS build

COPY --from=ghcr.io/astral-sh/uv:0.12.18 /uv /usr/local/bin/uv
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never

WORKDIR /app
COPY pyproject.toml uv.lock .python-version ./
RUN uv sync --locked --no-dev


FROM build AS development-build

RUN uv sync --locked


FROM python:3.14-slim AS runtime

RUN useradd --system --no-create-home app
WORKDIR /app
ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1
EXPOSE 8000


# Used by docker-compose.yml, which mounts the source code so changes restart the processes.
FROM runtime AS development

COPY --from=development-build /app/.venv ./.venv
ENV PYTHONDONTWRITEBYTECODE=1
USER app
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--reload-dir", "src"]


FROM runtime AS production

COPY --from=build /app/.venv ./.venv
COPY alembic.ini ./
COPY migrations ./migrations
COPY src ./src
USER app
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
