# AGENTS.md - AI Agent Guidelines for CustomWare Portal

This document provides guidance for AI agents working on the CustomWare Portal codebase.

## Project Overview

CustomWare Portal is a React-based project management application that allows users to create projects, manage tasks, configure settings, and collaborate via embedded meetings. The application uses modern TanStack libraries for routing and state management.

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | React | 19.x |
| Build Tool | Vite | 7.x |
| Routing | TanStack Router | 1.x |
| Data/State | TanStack DB | 0.5.x |
| Validation | Zod | 4.x |
| Styling | Tailwind CSS | 4.x |
| Icons | Lucide React | 0.562.x |

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ApplicationPreview.tsx   # iframe-based app preview
│   ├── ControlPanel.tsx         # Project settings panel
│   ├── MeetingEmbed.tsx         # Jitsi meeting integration
│   └── TaskList.tsx             # Task management component
├── db/                  # TanStack DB layer
│   ├── schema.ts        # Zod schemas and types
│   ├── collections.ts   # TanStack DB collections
│   ├── hooks.ts         # React hooks for data operations
├── routes/              # TanStack Router file-based routes
│   ├── __root.tsx       # Root layout
│   ├── index.tsx        # / - Projects dashboard
│   ├── new.tsx          # /new - Create project
│   └── $projectId.tsx   # /:projectId - Project detail
├── main.tsx             # Application entry point
├── index.css            # Global styles
└── routeTree.gen.ts     # Auto-generated route tree (DO NOT EDIT)
```

## Key Patterns

### Routing (TanStack Router)

Routes are file-based in `src/routes/`. The router plugin auto-generates `routeTree.gen.ts`.

```typescript
// Creating a route
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/path')({
  component: MyComponent,
})

// Using route params
const { projectId } = Route.useParams()

// Navigation
import { useNavigate, Link } from '@tanstack/react-router'
const navigate = useNavigate()
navigate({ to: '/$projectId', params: { projectId: 'abc' } })
```

### Data Layer (TanStack DB)

Data is managed through collections with localStorage persistence.

**Collections** (`src/db/collections.ts`):
- `projectsCollection` - Project entities
- `tasksCollection` - Task entities (linked to projects via `projectId`)
- `settingsCollection` - Project settings (keyed by `projectId`)

**Hooks** (`src/db/hooks.ts`):
```typescript
// Reading data (live queries - auto-update on changes)
const { data, isLoading } = useProjects()
const { data: project } = useProject(projectId)
const { data: tasks } = useProjectTasks(projectId)
const { data: settings } = useProjectSettings(projectId)

// Mutations (return { mutate } pattern)
const createProject = useCreateProject()
const project = createProject.mutate('Project Name')

const updateProject = useUpdateProject()
updateProject.mutate({ id, updates: { name: 'New Name' } })

const deleteProject = useDeleteProject()
deleteProject.mutate(projectId)
```

### Schema Definitions

All data types are defined with Zod in `src/db/schema.ts`:

```typescript
// Key types
type Project = {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'completed' | 'archived'
  previewUrl: string
  createdAt: string
  updatedAt: string
  owner: string
  teamMembers: string[]
}

type Task = {
  id: string
  projectId: string  // Foreign key to Project
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignee?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
}

type ProjectSettings = {
  projectId: string  // Primary key, matches Project.id
  // Agent settings
  agentEnabled: boolean
  agentModel: string
  // GitHub settings
  githubRepo: string
  githubBranch: string
  // ... more settings
}
```

## Coding Conventions

### TypeScript
- Use strict TypeScript throughout
- Import types from `src/db/schema.ts`
- Use Zod for runtime validation

### React Components
- Functional components only
- Use hooks for state and side effects
- Props interfaces defined inline or in the same file

### Styling
- Tailwind CSS utility classes
- Dark theme (black background, neutral grays)
- Common patterns:
  - Cards: `className="card p-5"` (defined in index.css)
  - Buttons: Use consistent hover states with `transition-colors`
  - Text: `text-white` for primary, `text-neutral-500` for secondary

### File Naming
- Components: PascalCase (`TaskList.tsx`)
- Routes: kebab-case or param-based (`$projectId.tsx`)
- Utilities/hooks: camelCase (`hooks.ts`)

## Important Files

| File | Purpose | Notes |
|------|---------|-------|
| `src/main.tsx` | App entry | Runs migration, sets up router |
| `src/db/collections.ts` | Data stores | localStorage persistence |
| `src/db/hooks.ts` | Data access | All CRUD operations |
| `src/routes/__root.tsx` | Root layout | Header, main wrapper |
| `vite.config.ts` | Build config | TanStack Router plugin |
| `routeTree.gen.ts` | Generated | Never edit manually |

## Common Tasks

### Adding a New Route

1. Create file in `src/routes/` (e.g., `settings.tsx`)
2. Export Route with `createFileRoute`
3. Run `npm run dev` to regenerate route tree

### Adding a New Collection

1. Add Zod schema in `src/db/schema.ts`
2. Create collection in `src/db/collections.ts`
3. Add hooks in `src/db/hooks.ts`
4. Update migration if needed in `src/db/migrate.ts`

### Modifying Data Structure

1. Update Zod schema in `src/db/schema.ts`
2. Update related hooks in `src/db/hooks.ts`
3. Consider migration for existing data

## Build Commands

```bash
npm run dev      # Start development server
npm run build    # Production build (tsc + vite)
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Data Persistence

Data is stored in localStorage under these keys:
- `customware-projects` - Projects collection
- `customware-tasks` - Tasks collection
- `customware-settings` - Settings collection

Legacy Zustand data (`customware-portal-storage`) is automatically migrated on first load.

## Testing Considerations

When testing or developing:
- Clear localStorage to reset data
- Collections sync across browser tabs via storage events
- DevTools available at bottom-right in development

## Gotchas

1. **Route Tree**: Never edit `routeTree.gen.ts` - it's auto-generated
2. **Collection Keys**: Tasks use `id`, Settings use `projectId` as primary key
3. **Mutations**: Hook mutations are synchronous but collections handle persistence
4. **Live Queries**: `useLiveQuery` results auto-update when data changes
5. **Type Safety**: Route params are fully typed - use `Route.useParams()`
