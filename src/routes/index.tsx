"use client";

import Chat from "@/components/Chat";
import TaskList from "@/components/TaskList";
import { createFileRoute } from "@tanstack/react-router";

const Home = () => {
	return (
		<div className="p-4">
			<div className="grid h-[calc(100vh-112px)] gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
				<section className="p-4 h-full overflow-hidden rounded-2xl border border-border/70 bg-card/60 shadow-lg">
					<TaskList />
				</section>
				<aside className="flex h-full items-center justify-center rounded-2xl border border-border/70 bg-card/60 shadow-lg p-4 text-sm text-muted-foreground">
					<Chat />
				</aside>
			</div>
		</div>
	);
};

export const Route = createFileRoute("/")({
	component: Home,
});

export default Home;
