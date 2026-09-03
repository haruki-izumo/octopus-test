set working-directory := "backend"

compose := "docker compose --file " + justfile_directory() / "docker-compose.yml"
# Run from frontend/ so pnpm switches to the version in its package.json.
pnpm := "cd " + justfile_directory() / "frontend" + " && pnpm"

# Pick a recipe from a list (needs fzf)
[private]
default:
    @just --justfile {{ justfile() }} --choose

# Install the backend and front-end dependencies
install:
    uv sync
    {{ pnpm }} install

# Start the backend: Postgres, the API on http://localhost:8080 and the outbox relay
up:
    {{ compose }} up --build --detach --wait

# Start everything, with the customer portal on http://localhost:3000 (Ctrl+C stops the portal)
dev: up migrate
    {{ pnpm }} turbo run dev --filter=customer-portal --ui=stream

# Stop the backend
down:
    {{ compose }} down

# Follow the logs from api and relay
tail:
    {{ compose }} logs api relay --follow --tail 100

# Run database migrations
migrate:
    uv run alembic upgrade head

# Add example data
seed:
    uv run python -m scripts.seed

# Run all the tests
test: test-backend test-frontend

# Run the backend tests with coverage
test-backend *arguments:
    uv run pytest --cov {{ arguments }}

# Run the front-end tests
test-frontend:
    {{ pnpm }} test

lint:
    uv run ruff check
    {{ pnpm }} lint

format:
    uv run ruff format
    {{ pnpm }} format

typecheck:
    uv run ty check
    {{ pnpm }} typecheck

# Lint, format check and type check everything
check: check-backend check-frontend

check-backend:
    uv run ruff check
    uv run ruff format --check
    uv run ty check

# Biome checks formatting as part of linting
check-frontend:
    {{ pnpm }} lint
    {{ pnpm }} typecheck
