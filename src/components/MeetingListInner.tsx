"use client";

import { useLiveQuery } from "@tanstack/react-db";
import { useMemo } from "react";
import { type Meeting, type MeetingStatus, meetingsCollection } from "@/collections/db";
import { cn } from "@/lib/utils";
import { Calendar, Clock, Users, FileText, ExternalLink } from "lucide-react";

const statusColors: Record<MeetingStatus, string> = {
	Scheduled: "bg-blue-100 text-blue-800 border-blue-200",
	Active: "bg-emerald-100 text-emerald-800 border-emerald-200",
	Completed: "bg-slate-200 text-slate-700 border-slate-300",
	Cancelled: "bg-rose-100 text-rose-800 border-rose-200",
};

const formatDate = (value: string) => {
	if (!value) return "";
	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime())
		? value
		: parsed.toLocaleDateString(undefined, {
				month: "short",
				day: "numeric",
				year: "numeric",
				hour: "numeric",
				minute: "2-digit",
			});
};

const MeetingListInner = () => {
	const { data: meetingRows = [] } = useLiveQuery((q) =>
		q.from({ meeting: meetingsCollection }).select(({ meeting }) => ({ meeting })),
	);

	const meetings = useMemo(() => {
		return meetingRows
			.map((row) => row.meeting)
			.filter((m): m is Meeting => Boolean(m))
			.sort((a, b) => {
				if (a.scheduledAt > b.scheduledAt) return -1;
				if (a.scheduledAt < b.scheduledAt) return 1;
				return 0;
			});
	}, [meetingRows]);

	return (
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
				{meetings.length === 0 ? (
					<div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground p-4">
						<p>No meetings yet.</p>
					</div>
				) : (
					<ul className="divide-y divide-border/60">
						{meetings.map((meeting) => (
							<li
								key={meeting.id}
								className="flex flex-col gap-2 px-4 py-3 hover:bg-muted/30 transition-colors"
							>
								<div className="flex items-center gap-2">
									<h3 className="text-sm font-medium truncate flex-1">
										{meeting.title}
									</h3>
									<span
										className={cn(
											"inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold shrink-0",
											statusColors[meeting.status],
										)}
									>
										{meeting.status}
									</span>
								</div>

								<div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
									<span className="inline-flex items-center gap-1">
										<Calendar className="h-3 w-3" />
										{formatDate(meeting.scheduledAt)}
									</span>
									{meeting.duration && (
										<span className="inline-flex items-center gap-1">
											<Clock className="h-3 w-3" />
											{meeting.duration}
										</span>
									)}
									{meeting.participants && (
										<span className="inline-flex items-center gap-1">
											<Users className="h-3 w-3" />
											{meeting.participants}
										</span>
									)}
								</div>

								{meeting.notes && (
									<p className="text-xs text-muted-foreground truncate flex items-center gap-1">
										<FileText className="h-3 w-3 shrink-0" />
										{meeting.notes}
									</p>
								)}

								{meeting.recordingUrl && (
									<a
										href={meeting.recordingUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1 text-xs text-primary hover:underline w-fit"
									>
										<ExternalLink className="h-3 w-3" />
										View Recording
									</a>
								)}
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
};

export default MeetingListInner;
