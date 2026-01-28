"use client";

import { useLiveQuery } from "@tanstack/react-db";
import { useEffect, useMemo, useState } from "react";
import {
	type Comment,
	commentsCollection,
	startCollectionSync,
	TASK_STATUSES,
	type Task,
	type TaskStatus,
	tasksCollection,
} from "@/collections/db";
import { cn } from "@/lib/utils";

const statusColors: Record<TaskStatus, string> = {
	"Not Started": "bg-slate-200 text-slate-700 border-slate-300",
	"In Progress": "bg-amber-100 text-amber-800 border-amber-200",
	Blocked: "bg-rose-100 text-rose-800 border-rose-200",
	Done: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const formatDate = (value: string) => {
	if (!value) return "No due date";
	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime())
		? value
		: parsed.toLocaleDateString(undefined, {
				month: "short",
				day: "numeric",
				year: "numeric",
		  });
};

const TaskListInner = () => {
	const [statusFilter, setStatusFilter] = useState<TaskStatus | "All">("All");
	const [search, setSearch] = useState("");
	const [refreshKey, setRefreshKey] = useState(0);

	// Listen for task/comment updates from chat
	useEffect(() => {
		const handleUpdate = () => {
			console.log("[TaskList] Received update event, incrementing refreshKey");
			setRefreshKey((k) => k + 1);
		};
		window.addEventListener("tasks-updated", handleUpdate);
		window.addEventListener("comments-updated", handleUpdate);
		return () => {
			window.removeEventListener("tasks-updated", handleUpdate);
			window.removeEventListener("comments-updated", handleUpdate);
		};
	}, []);

	const { data: taskRows = [] } = useLiveQuery(
		(q) => q.from({ task: tasksCollection }).select(({ task }) => ({ task })),
		[refreshKey],
	);
	const { data: commentRows = [] } = useLiveQuery(
		(q) => q.from({ comment: commentsCollection }).select(({ comment }) => ({ comment })),
		[refreshKey],
	);

	const tasks = useMemo(
		() =>
			taskRows
				.map((row) => row.task)
				.filter((task): task is Task => Boolean(task))
				.filter((task) => {
					const matchesStatus =
						statusFilter === "All" ? true : task.status === statusFilter;
					const haystack =
						`${task.name} ${task.description} ${task.assignment}`.toLowerCase();
					const matchesSearch =
						search.trim().length === 0 ||
						haystack.includes(search.trim().toLowerCase());
					return matchesStatus && matchesSearch;
				})
				.sort((a, b) => {
					if (!a.dueDate) return 1;
					if (!b.dueDate) return -1;
					return a.dueDate.localeCompare(b.dueDate);
				}),
		[taskRows, search, statusFilter],
	);

	const commentsByTask = useMemo(
		() =>
			commentRows.reduce<Record<string, Comment[]>>((acc, row) => {
				const comment = row.comment;
				if (!comment) return acc;
				if (!acc[comment.taskId]) acc[comment.taskId] = [];
				acc[comment.taskId].push(comment);
				return acc;
			}, {}),
		[commentRows],
	);

	return (
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
					<div className="flex items-center gap-2 ml-auto">
						<select
							value={statusFilter}
							onChange={(event) =>
								setStatusFilter(event.target.value as TaskStatus | "All")
							}
							className="h-9 rounded-lg border border-border/70 bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
						>
							<option value="All">All statuses</option>
							{TASK_STATUSES.map((status) => (
								<option key={status} value={status}>
									{status}
								</option>
							))}
						</select>
						<input
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder="Search task..."
							className="h-9 w-44 rounded-lg border border-border/70 bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
						/>
					</div>
				</div>
			</header>

			<div className="flex-1 overflow-auto rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm">
				{tasks.length === 0 ? (
					<div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
						<p>No tasks yet.</p>
						<p>Use the chat to create tasks.</p>
					</div>
				) : (
					<ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						{tasks.map((task) => {
							const groupedComments = commentsByTask[task.id] ?? [];
							return (
								<li
									key={task.id}
									className="flex flex-col gap-3 rounded-lg border border-border/60 bg-background/60 p-3 shadow-sm"
								>
									<div className="flex flex-col gap-1">
										<div className="flex flex-wrap items-center gap-2">
											<h3 className="text-base font-semibold leading-tight">
												{task.name}
											</h3>
											<span
												className={cn(
													"inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-semibold",
													statusColors[task.status],
												)}
											>
												{task.status}
											</span>
										</div>
										<p className="text-sm text-muted-foreground line-clamp-2">
											{task.description || "No description provided."}
										</p>
										<div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
											<span className="rounded-md border border-border/70 bg-card px-2 py-1">
												Assigned to {task.assignment}
											</span>
											<span className="rounded-md border border-border/70 bg-card px-2 py-1">
												Due {formatDate(task.dueDate)}
											</span>
										</div>
									</div>

									<div className="rounded-md border border-dashed border-border/60 bg-muted/40 p-2">
										<div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
											<span>{groupedComments.length} updates</span>
											<span>
												Latest: {groupedComments.at(-1)?.author ?? "—"}
											</span>
										</div>
										<div className="flex flex-col gap-2 max-h-32 overflow-auto pr-1">
											{groupedComments.length === 0 ? (
												<p className="text-xs text-muted-foreground">
													No updates yet.
												</p>
											) : (
												groupedComments.map((comment) => (
													<div
														key={comment.id}
														className="rounded-md border border-border/50 bg-background px-2 py-1"
													>
														<div className="flex items-center justify-between text-[11px] text-muted-foreground">
															<span className="font-medium">
																{comment.activity}
															</span>
															<span>
																{new Date(comment.date).toLocaleDateString()}
															</span>
														</div>
														<p className="text-xs">{comment.note}</p>
														<p className="text-[11px] text-muted-foreground">
															— {comment.author}
														</p>
													</div>
												))
											)}
										</div>
									</div>
								</li>
							);
						})}
					</ul>
				)}
			</div>
		</div>
	);
};

const TaskList = () => {
	// Defer rendering the DB-backed list until after hydration completes
	const [isClient, setIsClient] = useState(false);
	useEffect(() => {
		// Start localStorage sync after hydration
		startCollectionSync();
		setIsClient(true);
	}, []);
	if (!isClient) return null;
	return <TaskListInner />;
};

export default TaskList;
