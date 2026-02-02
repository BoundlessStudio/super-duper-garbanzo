"use client";

import { lazy, Suspense, useState, useEffect } from "react";
import { startCollectionSync } from "@/collections/db";

const MeetingListInner = lazy(() => import("./MeetingListInner"));

const MeetingListSkeleton = () => (
	<div className="flex h-full flex-col gap-4">
		<header className="flex flex-col gap-1">
			<p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
				Previous Meetings
			</p>
			<h2 className="text-xl font-semibold leading-tight">
				Meeting History
			</h2>
		</header>

		<div className="flex-1 overflow-auto rounded-xl bg-card/80">
			<ul className="divide-y divide-border/60">
				{[1, 2, 3].map((i) => (
					<li
						key={i}
						className="flex flex-col gap-2 px-4 py-3 animate-pulse"
					>
						<div className="flex items-center gap-2">
							<div className="h-4 w-40 bg-muted rounded" />
							<div className="h-5 w-20 bg-muted rounded-full" />
						</div>
						<div className="flex items-center gap-3">
							<div className="h-3 w-32 bg-muted rounded" />
							<div className="h-3 w-16 bg-muted rounded" />
							<div className="h-3 w-24 bg-muted rounded" />
						</div>
					</li>
				))}
			</ul>
		</div>
	</div>
);

const MeetingList = () => {
	const [isClient, setIsClient] = useState(false);
	useEffect(() => {
		startCollectionSync();
		setIsClient(true);
	}, []);

	if (!isClient) return <MeetingListSkeleton />;

	return (
		<Suspense fallback={<MeetingListSkeleton />}>
			<MeetingListInner />
		</Suspense>
	);
};

export default MeetingList;
