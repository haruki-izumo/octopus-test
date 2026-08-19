set working-directory := "backend"

compose := "docker compose --file " + justfile_directory() / "docker-compose.yml"

# Pick a recipe from a list (needs fzf)
[private]
default:
    @just --justfile {{ justfile() }} --choose

# Start everything: Postgres, the API on http://localhost:8080 and the outbox relay
up:
    {{ compose }} up --build --detach --wait

# Follow the logs from every container
tail:
    {{ compose }} logs --follow --tail 100

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
