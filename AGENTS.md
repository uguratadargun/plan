# Repository Guidelines

## Project Structure & Module Organization
The repo has `backend/` (Express + TypeScript API) and `frontend/` (React + Vite UI). Backend sources stay in `backend/src` with `routes/`, `models/`, and `db.ts`; the JSON store sits in `backend/data/db.json`, and builds drop into `backend/dist`. Frontend code lives in `frontend/src`, where `components/` contains React widgets, `services/` wraps HTTP access, `utils/` hosts helpers, and `config.ts` manages `APP_CONFIG` to switch API targets. Dockerfiles, `nginx.conf`, and other deploy manifests live alongside each service.

## Build, Test, and Development Commands
- `cd backend && npm install && npm run dev`: `tsx` watcher that exposes http://localhost:5001.
- `cd backend && npm run build && npm start`: strict type-check, emit JS, then run from `dist/`.
- `cd frontend && npm install && npm run dev`: starts Vite on http://localhost:3000; honor `APP_CONFIG`.
- `cd frontend && npm run build && npm run preview`: confirm the production bundle served by Vite matches nginx.

## Coding Style & Naming Conventions
TypeScript runs in strict mode on both sides, so prefer explicit interfaces and non-null checks. Use two-space indentation, single quotes, semicolons, and keep imports sorted by module depth. React components, contexts, and hooks live in PascalCase files (`WeeklyTable.tsx`); helpers and API wrappers stay camelCase. Backend routers export descriptive names (`personsRouter`) and mount under `/api/<resource>`. Run `npm run build` in both packages before committing to guarantee clean type output.

## Testing Guidelines
No automated suite ships yet. New backend work should include `supertest`-based integration coverage stored under `backend/src/__tests__` and exercise the Express app without binding a port. For the frontend, add Vitest + React Testing Library specs next to the component under test and stub HTTP via the `services/` layer. Name specs `<feature>.test.ts[x]`, keep fixtures deterministic, and document manual steps (import/export, timeline, auth) inside the PR until CI is available.

## Commit & Pull Request Guidelines
History favors short imperative commits (`gantt view`, `resize`); keep following that style and group coherent changes only. Reference issue IDs when they exist, and ensure each commit builds and runs `npm run dev` cleanly. PRs must include: a summary, screenshots or GIFs for UI tweaks, API contract notes if endpoints change, manual test notes, and deployment links when relevant. Request review from maintainers of any folder you touched, especially when editing shared JSON schemas or configuration.
