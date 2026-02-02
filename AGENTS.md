# Repository Guidelines

## Project Structure & Module Organization
- Vite + React + TypeScript with TanStack Router (CSR). Routes live in `src/routes` (`__root.tsx` layout, `index.tsx` home) and are wired in `src/router.tsx`; app entry is `src/main.tsx`.
- Shared UI lives in `src/components` (`ui` for shadcn-style primitives, `ai-elements` for AI-specific widgets, `Header.tsx` for layout chrome). Common utilities sit in `src/lib`.
- Global styles are in `src/styles.css`; assets in `public/` and `src/logo.svg`. Tests sit near code (example: `src/smoke.test.ts`).

## Build, Test, and Development Commands
- `pnpm install` sets up dependencies (pnpm is the expected package manager).
- `pnpm dev` starts the Vite dev server on port 3000; `pnpm preview` serves the production build locally.
- `pnpm build` creates the production bundle.
- `pnpm test` runs Vitest once (`pnpm test --watch` for TDD).
- Quality gates: `pnpm lint`, `pnpm format`, and `pnpm check` use Biome for linting/formatting/type-aware checks.

## Coding Style & Naming Conventions
- Biome enforces tabs for indentation and double quotes; let the formatter run before commits (imports auto-organized).
- Prefer function components in TypeScript; name React components/files in `PascalCase.tsx`, utilities in `camelCase.ts`.
- Route files follow TanStack patterns (`index.tsx`, nested folders for paths). Keep JSX class handling consistent with existing `clsx`/utility patterns.

## Testing Guidelines
- Use Vitest + Testing Library for components and hooks; colocate specs as `*.test.ts`/`*.test.tsx`.
- Cover user-visible behavior (routing loaders, form/AI interactions) and guardrails; mock network/AI calls.
- Aim for small, focused tests; add ARIA labels where needed to support queries.

## Commit & Pull Request Guidelines
- Recent history uses short, imperative summaries (e.g., "reset for meeting to tasks test"); keep commits concise and scoped, preferring multiple commits over mixed changes.
- PRs should include a plain-language summary, linked issues/tasks, and test evidence (`pnpm test`, `pnpm lint`, `pnpm build` if relevant). Attach screenshots for UI changes and note any migrations/config updates.

## Security & Configuration Tips
- Keep secrets (e.g., AI provider keys) in `.env.local` and access via `import.meta.env`; do not commit env files.
- Shadcn/AI components rely on Radix and Tailwind tokens; ensure `src/styles.css` stays loaded in `src/main.tsx`.
