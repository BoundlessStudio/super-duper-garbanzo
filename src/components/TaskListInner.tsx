"use client";

import { useLiveQuery } from "@tanstack/react-db";
import { useMemo, useState, useEffect } from "react";
import {
	type Comment,
	commentsCollection,
	type Task,
	type TaskStatus,
	type TaskQuery,
	tasksCollection,
	subscribeToTaskQuery,
	getTaskQuery,
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
	const [chatQuery, setChatQuery] = useState<TaskQuery | null>(getTaskQuery);

	// Subscribe to chat query changes
	useEffect(() => {
		return subscribeToTaskQuery((query) => {
			setChatQuery(query);
		});
	}, []);

	// useLiveQuery automatically subscribes to collection changes
	const { data: taskRows = [] } = useLiveQuery((q) =>
		q.from({ task: tasksCollection }).select(({ task }) => ({ task })),
	);
	const { data: commentRows = [] } = useLiveQuery((q) =>
		q.from({ comment: commentsCollection }).select(({ comment }) => ({ comment })),
	);

	const tasks = useMemo(() => {
		const today = new Date().toISOString().split("T")[0];
		let result = taskRows
			.map((row) => row.task)
			.filter((task): task is Task => Boolean(task));

		// Apply chat query filters if active
		if (chatQuery?.filter) {
			const f = chatQuery.filter;

			if (f.status && f.status.length > 0) {
				result = result.filter((t) => f.status!.includes(t.status));
			}

			if (f.assignment) {
				const assignmentLower = f.assignment.toLowerCase();
				result = result.filter((t) =>
					t.assignment.toLowerCase().includes(assignmentLower),
				);
			}

			if (f.search) {
				const searchLower = f.search.toLowerCase();
				result = result.filter(
					(t) =>
						t.name.toLowerCase().includes(searchLower) ||
						t.description?.toLowerCase().includes(searchLower),
				);
			}

			if (f.dueDateFrom) {
				result = result.filter((t) => t.dueDate && t.dueDate >= f.dueDateFrom!);
			}

			if (f.dueDateTo) {
				result = result.filter((t) => t.dueDate && t.dueDate <= f.dueDateTo!);
			}

			if (f.overdue) {
				result = result.filter(
					(t) => t.dueDate && t.dueDate < today && t.status !== "Done",
				);
			}
		}

		// Apply sorting
		const sortField = chatQuery?.sort?.field || "dueDate";
		const sortOrder = chatQuery?.sort?.order || "asc";

		result.sort((a, b) => {
			let aVal: string | number = a[sortField] ?? "";
			let bVal: string | number = b[sortField] ?? "";

			// Handle status sorting by priority
			if (sortField === "status") {
				const statusOrder: Record<string, number> = {
					Blocked: 0,
					"In Progress": 1,
					"Not Started": 2,
					Done: 3,
				};
				aVal = statusOrder[aVal as string] ?? 99;
				bVal = statusOrder[bVal as string] ?? 99;
			}

			if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
			if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
			return 0;
		});

		// Apply limit
		if (chatQuery?.limit && chatQuery.limit > 0) {
			result = result.slice(0, chatQuery.limit);
		}

		return result;
	}, [taskRows, chatQuery]);

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
			<header className="flex flex-col gap-3 ">
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

			<div className="flex-1 overflow-auto rounded-xl bg-card/80">
				{tasks.length === 0 ? (
					<div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground p-4">
						<p>No tasks yet.</p>
						<p>Use the chat to create tasks.</p>
					</div>
				) : (
					<ul className="divide-y divide-border/60">
						{tasks.map((task) => {
							const groupedComments = commentsByTask[task.id] ?? [];
							return (
								<li
									key={task.id}
									className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors"
								>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<h3 className="text-sm font-medium truncate">
												{task.name}
											</h3>
											<span
												className={cn(
													"inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold shrink-0",
													statusColors[task.status],
												)}
											>
												{task.status}
											</span>
										</div>
										{task.description && (
											<p className="text-xs text-muted-foreground truncate mt-0.5">
												{task.description}
											</p>
										)}
									</div>
									<div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
										<span className="hidden sm:inline">{task.assignment}</span>
										<span className="w-24 text-right">{formatDate(task.dueDate)}</span>
										<span className="w-16 text-right">{groupedComments.length} updates</span>
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

export default TaskListInner;
