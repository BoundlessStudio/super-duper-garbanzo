"use client";

import MeetingEmbed from "@/components/MeetingEmbed";
import MeetingList from "@/components/MeetingList";
import { createFileRoute } from "@tanstack/react-router";

const MeetingsPage = () => {
	return (
		<div className="p-4">
			<div className="grid h-[calc(100vh-112px)] gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
				<section className="flex h-full min-h-0 flex-col rounded-2xl border border-border/70 bg-card/60 shadow-lg p-4">
					<MeetingEmbed />
				</section>
				<aside className="flex h-full min-h-0 flex-col rounded-2xl border border-border/70 bg-card/60 shadow-lg p-4">
					<MeetingList />
				</aside>
			</div>
		</div>
	);
};

export const Route = createFileRoute("/meetings")({
	component: MeetingsPage,
});

export default MeetingsPage;
