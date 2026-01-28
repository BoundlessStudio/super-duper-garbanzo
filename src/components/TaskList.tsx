"use client";

import { lazy, Suspense, useState, useEffect } from "react";
import { startCollectionSync } from "@/collections/db";

// Lazily import the inner component to avoid SSR issues with @tanstack/react-db
const TaskListInner = lazy(() => import("./TaskListInner"));

const TaskListSkeleton = () => (
	<div className="flex h-full flex-col gap-4">
		<header className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/70 p-4 shadow-sm">
			<div className="flex flex-wrap items-center gap-3">
				<div>
					<p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
						Task List
					</p>
					<h2 className="text-xl font-semibold leading-tight">
						Plan, assign, and track work
					</h2>
				</div>
			</div>
		</header>

		<div className="flex-1 overflow-auto rounded-xl border border-border/60 bg-card/80 shadow-sm">
			<ul className="divide-y divide-border/60">
				{[1, 2, 3, 4, 5].map((i) => (
					<li
						key={i}
						className="flex items-center gap-4 px-4 py-3 animate-pulse"
					>
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2">
								<div className="h-4 w-32 bg-muted rounded" />
								<div className="h-5 w-20 bg-muted rounded-full" />
							</div>
							<div className="h-3 w-48 bg-muted rounded mt-1.5" />
						</div>
						<div className="flex items-center gap-4 shrink-0">
							<div className="h-3 w-16 bg-muted rounded hidden sm:block" />
							<div className="h-3 w-24 bg-muted rounded" />
							<div className="h-3 w-16 bg-muted rounded" />
						</div>
					</li>
				))}
			</ul>
		</div>
	</div>
);

const TaskList = () => {
	// Defer rendering the DB-backed list until after hydration completes
	const [isClient, setIsClient] = useState(false);
	useEffect(() => {
		// Start localStorage sync after hydration
		startCollectionSync();
		setIsClient(true);
	}, []);

	if (!isClient) return <TaskListSkeleton />;

	return (
		<Suspense fallback={<TaskListSkeleton />}>
			<TaskListInner />
		</Suspense>
	);
};

export default TaskList;
