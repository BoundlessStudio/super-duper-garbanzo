import { createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const getRouter = () => {

  const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    defaultNotFoundComponent: () => (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center text-gray-200">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
      </div>
    ),
  })

  return router
}
