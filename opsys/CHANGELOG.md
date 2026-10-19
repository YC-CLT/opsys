# Changelog

## 2026-10-19 — TS Build Fix

### Fixed
- **R3F `<bufferAttribute>` types**: R3F v9 requires `args` prop on `<bufferAttribute>`. Switched to imperative `useMemo` creating `THREE.BufferGeometry`/`THREE.Line` objects, rendered via `<primitive>`.
- **R3F `<line>` SVG conflict**: `<line>` in JSX resolves to SVG `line` element, not R3F `line`. Switched to `THREE.Line` + `<primitive>`.
- **Next.js prerender**: `useParams()` in Client Component blocked static generation. Wrapped quiz page in `<Suspense>` boundary.

### Changed
- `frontend/components/StarMap.tsx` — `ConnectionLines` and `StarField` now use imperative geometry creation
- `frontend/components/visual/ConceptScene.tsx` — `OSEvolution` and `PentagonRadar` line rendering via `useMemo` + `<primitive>`
- `frontend/app/quiz/[level]/page.tsx` — Split into `QuizPageContent` + `Suspense` wrapper

## 2026-10-18~19 — Initial Implementation (Tasks 0-10)

### Added
- Monorepo scaffold (pnpm workspace, Next.js frontend + Hono backend)
- Backend: SQLite schema, seed from quiz-bank.json, auth/quiz/teacher routes
- Frontend: login pages (student/teacher), student star map, quiz page (3 types), teacher dashboard
- 3D: R3F StarMap (6 levels), ConceptScene (6 concepts)
- Static mode: SHA-256 hashed quiz bank, localStorage progress engine, conditional static export
- Docker: separate Dockerfiles for frontend/backend, docker-compose
- CI: GitHub Actions workflow