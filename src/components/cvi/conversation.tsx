import { DailyCall } from "@daily-co/daily-js"
import { useCallback, useEffect, useRef, useState } from "react"

type ConversationProps = {
	conversationUrl: string
	onLeave?: () => void
}

export function Conversation({ conversationUrl, onLeave }: ConversationProps) {
	const containerRef = useRef<HTMLDivElement | null>(null)
	const callFrameRef = useRef<DailyCall | null>(null)
	const onLeaveRef = useRef(onLeave)
	const [isConnected, setIsConnected] = useState(false)

	useEffect(() => {
		onLeaveRef.current = onLeave
	}, [onLeave])

	useEffect(() => {
		if (!conversationUrl || !containerRef.current) return

		let cancelled = false
		let callFrame: DailyCall | null = null

		const handleJoined = () => {
			setIsConnected(true)
		}

		const handleLeft = () => {
			setIsConnected(false)
			onLeaveRef.current?.()
		}

		const setup = async () => {
			const module = await import("@daily-co/daily-js")
			if (cancelled || !containerRef.current) return

			const DailyIframe = module.default ?? module
			callFrame = DailyIframe.createFrame(containerRef.current, {
				iframeStyle: {
					width: "100%",
					height: "100%",
					border: "0",
				},
			})
			callFrameRef.current = callFrame
			callFrame.on("joined-meeting", handleJoined)
			callFrame.on("participant-left", handleLeft)
			callFrame.on("left-meeting", handleLeft)
			callFrame.join({ url: conversationUrl })
		}

		setup()

		return () => {
			cancelled = true
			if (!callFrame) return
			callFrame.off("joined-meeting", handleJoined)
			callFrame.off("participant-left", handleLeft)
			callFrame.off("left-meeting", handleLeft)
			callFrame.destroy()
			callFrameRef.current = null
		}
	}, [conversationUrl])

	const handleLeaveClick = useCallback(() => {
		const callFrame = callFrameRef.current
		if (callFrame?.leave) {
			callFrame.leave()
		} else {
			callFrame?.destroy()
		}
		setIsConnected(false)
		onLeaveRef.current?.()
	}, [])

	return (
		<div className="relative h-full w-full">
			<div ref={containerRef} className="h-full w-full" />
			{isConnected ? (
				<button
					type="button"
					onClick={handleLeaveClick}
					className="absolute bottom-4 right-4 rounded-full border border-border bg-background/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur transition hover:bg-muted"
				>
					Leave
				</button>
			) : null}
		</div>
	)
}
