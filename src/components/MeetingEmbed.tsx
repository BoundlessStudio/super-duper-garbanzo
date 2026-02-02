"use client";

import { useState } from "react";
import { Video, Loader2 } from "lucide-react";
import { refetchMeetings } from "@/collections/db";

type ActiveMeeting = {
	id: string;
	meetingUrl: string;
};

const MeetingEmbed = () => {
	const [activeMeeting, setActiveMeeting] = useState<ActiveMeeting | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleStart = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch("/api/meetings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title: "Meeting" }),
			});
			if (!response.ok) {
				const data = await response.json().catch(() => ({}));
				throw new Error(data.error || `Failed to create meeting (${response.status})`);
			}
			const meeting = await response.json();
			setActiveMeeting({
				id: meeting.id,
				meetingUrl: meeting.meetingUrl,
			});
			await refetchMeetings();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to start meeting");
		} finally {
			setLoading(false);
		}
	};

	const handleEnd = async () => {
		if (!activeMeeting) return;
		setLoading(true);
		try {
			await fetch(`/api/meetings/${activeMeeting.id}`, { method: "DELETE" });
			await refetchMeetings();
		} catch (err) {
			console.error("Failed to end meeting:", err);
		} finally {
			setActiveMeeting(null);
			setLoading(false);
		}
	};

	return (
		<div className="flex h-full flex-col gap-3">
			<header className="flex flex-col gap-2">
				<p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
					Meeting Room
				</p>
				{!activeMeeting ? (
					<div className="flex flex-col gap-2">
						<button
							type="button"
							onClick={handleStart}
							disabled={loading}
							className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none self-start"
						>
							{loading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Video className="h-4 w-4" />
							)}
							{loading ? "Starting..." : "Start Meeting"}
						</button>
						{error && (
							<p className="text-xs text-destructive">{error}</p>
						)}
					</div>
				) : (
					<div className="flex items-center justify-between">
						<button
							type="button"
							onClick={handleEnd}
							disabled={loading}
							className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
						>
							{loading ? (
								<Loader2 className="h-3 w-3 animate-spin" />
							) : null}
							End Meeting
						</button>
					</div>
				)}
			</header>

			<div className="flex-1 min-h-0 rounded-lg overflow-hidden bg-black/20">
				{activeMeeting ? (
					<iframe
						src={activeMeeting.meetingUrl}
						allow="camera; microphone; fullscreen; display-capture"
						className="h-full w-full border-none"
						title="Tavus Meeting"
					/>
				) : (
					<div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
						<Video className="h-12 w-12 opacity-30" />
						<p className="text-sm">Click "Start Meeting" to begin a Tavus conversation</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default MeetingEmbed;
