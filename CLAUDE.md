# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm run dev      # Start Vite development server with HMR
npm run build    # Production build (TypeScript compile + Vite build)
npm run lint     # Run ESLint
npm run preview  # Preview production build locally
```

## Architecture

**CustomWare Portal** is a React 19 SPA for project management with AI agent integration.

### Tech Stack
- **React 19** + **TypeScript** (strict mode)
- **Vite 7** for build/dev server
- **TanStack Router** - file-based routing (auto-generates `routeTree.gen.ts`)
- **TanStack DB** - reactive data layer with localStorage persistence
- **Tailwind CSS 4** - dark theme (black background, green accents)
- **Zod** - schema validation

### Data Layer

Collections are defined in `src/db/collections.ts` with Zod schemas in `src/db/schema.ts`.

**Reading data** (auto-updates on changes):
```typescript
const { data, isLoading } = useProjects()
const { data: project } = useProject(projectId)
const { data: tasks } = useProjectTasks(projectId)
const { data: settings } = useProjectSettings(projectId)
```

**Mutations** (return `{ mutate }` pattern):
```typescript
const createProject = useCreateProject()
createProject.mutate('Project Name')

const updateProject = useUpdateProject()
updateProject.mutate({ id, updates: { name: 'New Name' } })
```

localStorage keys: `customware-projects`, `customware-tasks`, `customware-settings`

### Routing

Routes are file-based in `src/routes/`. The TanStack Router plugin auto-generates `routeTree.gen.ts` - **never edit this file manually**.

```typescript
// Route params are fully typed
const { projectId } = Route.useParams()

// Navigation
navigate({ to: '/$projectId', params: { projectId: 'abc' } })
```

### Key Directories
- `src/routes/` - File-based routes (`__root.tsx` is the layout)
- `src/db/` - Schema, collections, and data hooks
- `src/components/` - Reusable UI components

## Styling Conventions

- Dark theme: black background, `text-white` primary, `text-neutral-500` secondary
- Cards use: `className="card p-5"` (defined in `src/index.css`)
- Green accent color (#22c55e) for interactive elements

## Adding Features

**New route**: Create file in `src/routes/`, export `Route` with `createFileRoute`, run `npm run dev` to regenerate route tree.

**New collection**: Add Zod schema in `schema.ts`, create collection in `collections.ts`, add hooks in `hooks.ts`, update migration if needed.

## Gotchas

- Tasks use `id` as primary key, Settings use `projectId` as primary key
- `useLiveQuery` results auto-update when underlying data changes
- Mutations are synchronous; collections handle persistence
- Clear localStorage to reset all data during development
