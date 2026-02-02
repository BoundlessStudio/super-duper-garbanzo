import { createFileRoute } from "@tanstack/react-router"
import { Meeting } from "@/components/Meeting"

export const Route = createFileRoute("/")({
  component: () => (
    <main className="flex min-h-screen w-full items-center justify-center px-6 py-10">
      <Meeting />
    </main>
  ),
})
