# Repository Guidelines

## Project Structure & Module Organization

This repository contains a LINE LIFF travel discovery app. The frontend is a Vite + React + TypeScript app in `src/`: UI components live in `src/components`, LIFF state in `src/hooks`, API clients in `src/services`, seed/mock data in `src/data`, shared types in `src/types`, and utility logic in `src/utils`.

Backend implementations are split by stack: `backend/` is FastAPI + SQLAlchemy, `server/` is another Python API layout organized by `routes/`, `models/`, and `services/`, and `go-backend/` is Gin + GORM.

## Build, Test, and Development Commands

- `npm install`: install frontend dependencies from `package-lock.json`.
- `npm run dev`: start the Vite development server.
- `npm run build`: run TypeScript checks and build the frontend into `dist/`.
- `npm run preview`: serve the production build locally.
- `cd backend && pip install -r requirements.txt`: install Python backend dependencies.
- `cd backend && python seed_data.py`: seed the SQLite database.
- `cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000`: run FastAPI.
- `cd go-backend && go mod tidy && go run .`: prepare and run the Go backend on port `8000`.

## Coding Style & Naming Conventions

Use TypeScript with React function components. Name components in PascalCase, hooks as `useSomething`, services/utilities in camelCase, and domain types in PascalCase. Match the current style: two-space indentation, focused components, Tailwind classes in JSX, and explicit interfaces.

For Python, use snake_case modules and functions. For Go, run `gofmt` and keep the existing package organization.

## Testing Guidelines

No dedicated test script is currently configured. Before opening a PR, run `npm run build` at minimum. For backend changes, smoke test the relevant API locally through `/docs`, `/api/health`, or representative endpoints. If adding tests, colocate frontend tests near the code they cover, using names such as `TinderCard.test.tsx`.

## Commit & Pull Request Guidelines

Recent history uses short commits such as `add: go-backend and upgrade`, `fix gitignore`, and `Update README.md`. Prefer concise imperative messages with an optional prefix (`add:`, `fix:`, `update:`).

Pull requests should include a short summary, affected areas, linked issues when applicable, and screenshots or recordings for visible UI changes. Note required environment variables such as `VITE_LIFF_ID` and `VITE_API_URL`, plus any database seed steps.

## Security & Configuration Tips

Do not commit `.env`, LIFF IDs, API secrets, generated SQLite databases, or uploaded user content. Keep local configuration in `.env` and document new variables in the relevant README.
