import { createFileRoute } from "@tanstack/react-router"

export type TavusConversationRequest = {
  persona_id: string
  replica_id?: string
  audio_only?: boolean
  callback_url?: string
  conversation_name?: string
  conversational_context?: string
  custom_greeting?: string
  memory_stores?: string[]
  document_ids?: string[]
  document_tags?: string[]
  document_retrieval_strategy?: "speed" | "quality" | "balanced"
  test_mode?: boolean
  require_auth?: boolean
  max_participants?: number
  properties?: Record<string, unknown>
}

export type TavusConversationResponse = {
  conversation_id: string
  conversation_name: string
  conversation_url: string
  status: "active" | "ended"
  callback_url?: string
  created_at: string
  meeting_token?: string
}

function toJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  })
}

export const Route = createFileRoute("/api/tavus/conversations")({
  component: () => null,
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.TAVUS_API_KEY
        if (!apiKey) {
          return toJsonResponse({ ok: false, error: "TAVUS_API_KEY is not set" }, 500)
        }

        const personaId = process.env.TAVUS_PERSONA_ID
        if (!personaId) {
          return toJsonResponse(
            { ok: false, error: "TAVUS_PERSONA_ID is not set" },
            500,
          )
        }

        const baseUrl = process.env.BASE_URL
        if (!baseUrl) {
          return toJsonResponse({ ok: false, error: "BASE_URL is not set" }, 500)
        }

        const body = (await request.json().catch(() => null)) as
          | TavusConversationRequest
          | null

        if (!body || typeof body !== "object") {
          return toJsonResponse({ ok: false, error: "Invalid JSON payload" }, 400)
        }

        const callbackUrl = new URL("/api/tavus/webhook", baseUrl).toString()

        const payload = {
          ...body,
          persona_id: personaId,
          callback_url: callbackUrl,
        }

        const response = await fetch("https://tavusapi.com/v2/conversations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const errorText = await response.text()
          return toJsonResponse(
            {
              ok: false,
              error: `Tavus API error (${response.status}): ${
                errorText || response.statusText
              }`,
            },
            response.status,
          )
        }

        const data = (await response.json()) as TavusConversationResponse
        return toJsonResponse(data)
      },
    },
  },
})
