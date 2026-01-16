import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { migrateFromZustand } from './db/migrate'
import './index.css'

// Create the router instance
const router = createRouter({ routeTree })

// Type registration for full type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Run migration before rendering
migrateFromZustand().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
})
