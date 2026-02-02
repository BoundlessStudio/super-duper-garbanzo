import { Meeting } from "@/components/Meeting"

export function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Boundless AI
        </p>
        <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
          Build calm, focused workflows.
        </h1>
        <p className="text-lg text-muted-foreground">
          This is the starting point for the app. Replace this content with the
          experience you want to ship.
        </p>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="rounded-full border border-border px-3 py-1">
            TanStack Router
          </span>
          <span className="rounded-full border border-border px-3 py-1">
            React 19
          </span>
          <span className="rounded-full border border-border px-3 py-1">
            Tailwind CSS
          </span>
        </div>
      </section>
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 pb-20">
        <Meeting />
      </section>
    </main>
  )
}
