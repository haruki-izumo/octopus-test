set working-directory := "backend"

# Start Postgres
up:
    docker compose --file {{ justfile_directory() }}/docker-compose.yml up --detach --wait

# Run database migrations
migrate:
    uv run alembic upgrade head

# Add example data
seed:
    uv run python -m scripts.seed

# Run the tests with coverage
test *arguments:
    uv run pytest --cov {{ arguments }}

lint:
    uv run ruff check

format:
    uv run ruff format

typecheck:
    uv run ty check

# Lint, format check and type check
check:
    uv run ruff check
    uv run ruff format --check
    uv run ty check
