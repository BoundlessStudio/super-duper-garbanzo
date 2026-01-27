"use client";

import { useLiveQuery } from "@tanstack/react-db";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	addComment,
	type Comment,
	commentsCollection,
	createTask,
	TASK_STATUSES,
	type Task,
	type TaskStatus,
	tasksCollection,
} from "@/collections/db";
import { cn } from "@/lib/utils";

type TaskDraft = {
	name: string;
	description: string;
	assignment: string;
	dueDate: string;
	status: TaskStatus;
};

type CommentDraft = {
	activity: string;
	note: string;
	author: string;
};

const statusColors: Record<TaskStatus, string> = {
	"Not Started": "bg-slate-200 text-slate-700 border-slate-300",
	"In Progress": "bg-amber-100 text-amber-800 border-amber-200",
	Blocked: "bg-rose-100 text-rose-800 border-rose-200",
	Done: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const emptyTaskDraft: TaskDraft = {
	name: "",
	description: "",
	assignment: "",
	dueDate: "",
	status: "Not Started",
};

const emptyComment: CommentDraft = {
	activity: "",
	note: "",
	author: "",
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
	const [draft, setDraft] = useState<TaskDraft>(emptyTaskDraft);
	const [commentDrafts, setCommentDrafts] = useState<
		Record<string, CommentDraft>
	>({});
	const [statusFilter, setStatusFilter] = useState<TaskStatus | "All">("All");
	const [search, setSearch] = useState("");
	const seeded = useRef(false);

	const { data: taskRows = [] } = useLiveQuery((q) =>
		q.from({ task: tasksCollection }),
	);
	const { data: commentRows = [] } = useLiveQuery((q) =>
		q.from({ comment: commentsCollection }),
	);

	// Seed a few example tasks/comments on first load
	useEffect(() => {
		if (seeded.current || taskRows.length > 0) return;
		seeded.current = true;

		const today = new Date();
		const plusDays = (days: number) => {
			const next = new Date(today);
			next.setDate(today.getDate() + days);
			return next.toISOString().slice(0, 10);
		};

		const demoTasks: Array<Omit<Task, "id" | "createdAt">> = [
			{
				name: "Design onboarding flow",
				description: "Sketch welcome screens and checklist.",
				assignment: "Alex Kim",
				dueDate: plusDays(2),
				status: "In Progress",
			},
			{
				name: "Ship metrics dashboard",
				description: "Finalize KPI tiles and alerts.",
				assignment: "Sam Lee",
				dueDate: plusDays(7),
				status: "Not Started",
			},
			{
				name: "Resolve billing webhook",
				description: "Investigate 500s on retry path.",
				assignment: "Jordan Patel",
				dueDate: plusDays(1),
				status: "Blocked",
			},
		];

		const created = demoTasks.map((task) =>
			createTask({
				...task,
			}),
		);

		created.forEach((task, index) => {
			addComment({
				taskId: task.id,
				activity: "Note",
				note:
					index === 0
						? "UX reviewed first pass."
						: index === 1
							? "Awaiting stakeholder inputs."
							: "Webhook retries failing after 3rd attempt.",
				author: "System",
			});
		});
	}, [taskRows.length]);

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

	const handleCreateTask = (event: React.FormEvent) => {
		event.preventDefault();
		if (!draft.name.trim() || !draft.assignment.trim() || !draft.dueDate) {
			return;
		}
		createTask({
			...draft,
		});
		setDraft(emptyTaskDraft);
	};

	const handleAddComment = (taskId: string) => {
		const draftForTask = commentDrafts[taskId] ?? emptyComment;
		if (
			!draftForTask.activity.trim() ||
			!draftForTask.note.trim() ||
			!draftForTask.author.trim()
		) {
			return;
		}
		addComment({
			taskId,
			activity: draftForTask.activity,
			note: draftForTask.note,
			author: draftForTask.author,
		});
		setCommentDrafts((prev) => ({ ...prev, [taskId]: emptyComment }));
	};

	const updateStatus = (taskId: string, status: TaskStatus) => {
		tasksCollection.update(taskId, (draftTask) => {
			draftTask.status = status;
		});
	};

	const updateTaskField = (key: keyof TaskDraft, value: string) => {
		setDraft((prev) => ({ ...prev, [key]: value }));
	};

	const updateCommentField = (
		taskId: string,
		key: keyof CommentDraft,
		value: string,
	) => {
		setCommentDrafts((prev) => ({
			...prev,
			[taskId]: { ...(prev[taskId] ?? emptyComment), [key]: value },
		}));
	};

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
				<form
					onSubmit={handleCreateTask}
					className="grid grid-cols-1 gap-3 md:grid-cols-12"
				>
					<input
						value={draft.name}
						onChange={(event) => updateTaskField("name", event.target.value)}
						placeholder="Task name"
						className="md:col-span-3 rounded-lg border border-border/70 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
						required
					/>
					<input
						value={draft.description}
						onChange={(event) =>
							updateTaskField("description", event.target.value)
						}
						placeholder="Description"
						className="md:col-span-3 rounded-lg border border-border/70 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
					/>
					<input
						value={draft.assignment}
						onChange={(event) =>
							updateTaskField("assignment", event.target.value)
						}
						placeholder="Assignee"
						className="md:col-span-2 rounded-lg border border-border/70 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
						required
					/>
					<input
						type="date"
						value={draft.dueDate}
						onChange={(event) =>
							updateTaskField("dueDate", event.target.value)
						}
						className="md:col-span-2 rounded-lg border border-border/70 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
						required
					/>
					<select
						value={draft.status}
						onChange={(event) =>
							updateTaskField("status", event.target.value as TaskStatus)
						}
						className="md:col-span-1 rounded-lg border border-border/70 bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
					>
						{TASK_STATUSES.map((status) => (
							<option key={status} value={status}>
								{status}
							</option>
						))}
					</select>
					<button
						type="submit"
						className="md:col-span-1 inline-flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/60"
					>
						Add
					</button>
				</form>
			</header>

			<div className="flex-1 overflow-auto rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm">
				{tasks.length === 0 ? (
					<div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
						<p>No tasks yet.</p>
						<p>Add one with the form above.</p>
					</div>
				) : (
					<ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						{tasks.map((task) => {
							const groupedComments = commentsByTask[task.id] ?? [];
							const commentDraft = commentDrafts[task.id] ?? emptyComment;
							return (
								<li
									key={task.id}
									className="flex flex-col gap-3 rounded-lg border border-border/60 bg-background/60 p-3 shadow-sm"
								>
									<div className="flex items-start gap-2">
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
										<select
											value={task.status}
											onChange={(event) =>
												updateStatus(task.id, event.target.value as TaskStatus)
											}
											className="ml-auto h-9 rounded-lg border border-border/70 bg-background px-2 text-xs shadow focus:outline-none focus:ring-2 focus:ring-primary/40"
										>
											{TASK_STATUSES.map((status) => (
												<option key={status} value={status}>
													{status}
												</option>
											))}
										</select>
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
										<div className="mt-2 grid grid-cols-3 gap-2 text-xs">
											<input
												value={commentDraft.activity}
												onChange={(event) =>
													updateCommentField(
														task.id,
														"activity",
														event.target.value,
													)
												}
												placeholder="Activity"
												className="col-span-1 rounded-md border border-border/70 bg-background px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/40"
											/>
											<input
												value={commentDraft.note}
												onChange={(event) =>
													updateCommentField(
														task.id,
														"note",
														event.target.value,
													)
												}
												placeholder="Note"
												className="col-span-2 rounded-md border border-border/70 bg-background px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/40"
											/>
											<input
												value={commentDraft.author}
												onChange={(event) =>
													updateCommentField(
														task.id,
														"author",
														event.target.value,
													)
												}
												placeholder="Author"
												className="col-span-2 rounded-md border border-border/70 bg-background px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/40"
											/>
											<button
												type="button"
												onClick={() => handleAddComment(task.id)}
												className="col-span-1 inline-flex items-center justify-center rounded-md bg-primary px-2 py-1 font-medium text-primary-foreground shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/60"
											>
												Add
											</button>
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
	useEffect(() => setIsClient(true), []);
	if (!isClient) return null;
	return <TaskListInner />;
};

export default TaskList;
