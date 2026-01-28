"use client";

import { Link, createFileRoute } from "@tanstack/react-router";

const Home = () => {
	return (
		<div className="flex min-h-[calc(100vh-112px)] flex-col items-center justify-center gap-4 px-4 text-center">
			<div className="max-w-2xl space-y-3">
				<p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
					Workspace overview
				</p>
				<h1 className="text-4xl font-semibold leading-tight text-white">
					Tackle tasks, collaborate with AI, and keep work in sync.
				</h1>
				<p className="text-base text-muted-foreground">
					The Tasks workspace combines your live list with the Task chat assistant. Jump in
					when you're ready to manage assignments, review priorities, and craft replies.
				</p>
			</div>
			<Link
				to="/tasks"
				className="rounded-full border border-border/60 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/20"
			>
				Go to Tasks
			</Link>
		</div>
	);
};

export const Route = createFileRoute("/")({
	component: Home,
});

export default Home;
