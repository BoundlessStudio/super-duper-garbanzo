import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import { ThemeToggle } from '@/components/ThemeToggle'
import { CVIProvider } from '@/components/cvi/cvi-provider'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  notFoundComponent: () => (
    <main className="flex min-h-screen w-full items-center justify-center px-6 py-10">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          404
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-card-foreground">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you are looking for doesn’t exist or has been moved.
        </p>
      </div>
    </main>
  ),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground">
        <div className="fixed right-4 top-4 z-50">
          <ThemeToggle />
        </div>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
