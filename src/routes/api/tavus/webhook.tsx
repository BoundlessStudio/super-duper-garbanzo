import { createFileRoute } from "@tanstack/react-router"

export type TavusWebhookPayload = {
  properties: Record<string, unknown>
  conversation_id: string
  webhook_url: string
  event_type: string
  message_type: "system" | "application"
  timestamp: string
}

function toJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  })
}

export const Route = createFileRoute("/api/tavus/webhook")({
  component: () => null,
  server: {
    handlers: {
      POST: async ({ request }) => {
        const payload = (await request.json().catch(() => null)) as
          | TavusWebhookPayload
          | null

        if (!payload || typeof payload !== "object") {
          return toJsonResponse({ ok: false, error: "Invalid JSON payload" }, 400)
        }

        if (
          typeof payload.conversation_id !== "string" ||
          typeof payload.event_type !== "string" ||
          typeof payload.message_type !== "string"
        ) {
          return toJsonResponse({ ok: false, error: "Missing required fields" }, 400)
        }

        // TODO: process payload (store events, update state, etc.)
        return toJsonResponse({ ok: true })
      },
    },
  },
})
