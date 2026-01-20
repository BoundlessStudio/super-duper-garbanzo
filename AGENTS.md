# Agents Guide

This project is a React 19 + TypeScript SPA (CustomWare Portal) with TanStack Router, TanStack DB, and Tailwind CSS. Use this guide when making changes or automating tasks.

## Quick Commands

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Architecture Notes

- Routes are file-based in `src/routes/` and generated into `src/routeTree.gen.ts` (do not edit the generated file).
- Data lives in TanStack DB collections in `src/db/collections.ts`, with schemas in `src/db/schema.ts`.
- Use data hooks from `src/db/hooks.ts` (`useProjects`, `useProject`, `useProjectTasks`, `useProjectSettings`).
- Mutations follow `{ mutate }` and are synchronous.

## Styling Conventions

- Dark theme with black background, green accents (#22c55e).
- Primary text: `text-white`, secondary: `text-neutral-500`.
- Use the shared card class: `className="card p-5"` (from `src/index.css`).

## Local Storage Keys

- `customware-projects`
- `customware-tasks`
- `customware-settings`

## Gotchas

- Tasks use `id` as primary key.
- Settings use `projectId` as primary key.
- Clear localStorage during development to reset all data.
