import { useState } from "react"

import { Conversation } from "@/components/cvi/conversation"

type CreateConversationResponse = {
  conversation_url: string
}

export function Meeting() {
  const [conversationUrl, setConversationUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showOverlay, setShowOverlay] = useState(true)

  const createMeeting = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/tavus/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_name: "Meeting",
        }),
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || "Failed to create meeting")
      }

      const data = (await response.json()) as CreateConversationResponse
      if (!data.conversation_url) {
        throw new Error("Conversation URL not returned")
      }

      setConversationUrl(data.conversation_url)
      setShowOverlay(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const overlayVisible = !conversationUrl || showOverlay
  const showConversation = !!conversationUrl && !showOverlay

  return (
    <section className="container mx-auto rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-4">
        <header className="space-y-1">
          <h2 className="text-xl font-semibold text-card-foreground">
            Customware
          </h2>
          <p className="text-sm text-muted-foreground">
            Create a meeting with your AI consultant.
          </p>
        </header>

        <div className="relative h-[520px] w-full overflow-hidden rounded-xl border border-border bg-muted">
          {showConversation ? (
            <Conversation
              conversationUrl={conversationUrl}
              onLeave={() => {
                setShowOverlay(true)
              }}
            />
          ) : null}

          {overlayVisible ? (
            <div className="absolute inset-0 grid place-items-center bg-background/85 p-4 backdrop-blur">
              <button
                type="button"
                onClick={createMeeting}
                disabled={isLoading}
                className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? "Creating..." : "Create Meeting"}
              </button>
            </div>
          ) : null}
        </div>

        {error ? <p className="text-sm text-destructive">Error: {error}</p> : null}
      </div>
    </section>
  )
}
