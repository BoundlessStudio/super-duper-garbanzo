"use client";

import {
	createCollection,
	localOnlyCollectionOptions,
} from "@tanstack/react-db";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { nanoid } from "nanoid";
import { z } from "zod";

export const TASK_STATUSES = [
	"Not Started",
	"In Progress",
	"Blocked",
	"Done",
] as const;

const taskZodSchema = z.object({
	id: z.string(),
	name: z.string().min(1),
	description: z.string().default(""),
	assignment: z.string().min(1),
	dueDate: z.string(),
	status: z.enum(TASK_STATUSES),
	createdAt: z.string(),
});

const commentZodSchema = z.object({
	id: z.string(),
	taskId: z.string(),
	activity: z.string().min(1),
	note: z.string().min(1),
	date: z.string(),
	author: z.string().min(1),
});

export const MEETING_STATUSES = [
	"Scheduled",
	"Active",
	"Completed",
	"Cancelled",
] as const;

const meetingZodSchema = z.object({
	id: z.string(),
	title: z.string().min(1),
	meetingUrl: z.string().min(1),
	conversationId: z.string().optional(),
	status: z.enum(MEETING_STATUSES),
	participants: z.string().default(""),
	duration: z.string().optional(),
	notes: z.string().default(""),
	recordingUrl: z.string().optional(),
	scheduledAt: z.string(),
	createdAt: z.string(),
});

const toStandardSchema = <T extends z.ZodTypeAny>(
	schema: T,
): StandardSchemaV1<z.input<T>, z.output<T>> => ({
	"~standard": {
		version: 1,
		vendor: "zod",
		validate: (value) => {
			const result = schema.safeParse(value);
			return result.success
				? { value: result.data }
				: {
						issues: result.error.issues.map((issue) => ({
							message: issue.message,
							path: issue.path,
						})),
					};
		},
	},
});

const taskSchema = toStandardSchema(taskZodSchema);
const commentSchema = toStandardSchema(commentZodSchema);
const meetingSchema = toStandardSchema(meetingZodSchema);

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type MeetingStatus = (typeof MEETING_STATUSES)[number];
export type Task = z.infer<typeof taskZodSchema>;
export type Comment = z.infer<typeof commentZodSchema>;
export type Meeting = z.infer<typeof meetingZodSchema>;

// Query state for filtering/sorting tasks from chat
export type TaskQueryFilter = {
	status?: TaskStatus[];
	assignment?: string;
	search?: string;
	dueDateFrom?: string;
	dueDateTo?: string;
	overdue?: boolean;
};

export type TaskQuerySort = {
	field: "name" | "dueDate" | "status" | "assignment" | "createdAt";
	order: "asc" | "desc";
};

export type TaskQuery = {
	filter?: TaskQueryFilter;
	sort?: TaskQuerySort;
	limit?: number;
};

// Shared query state with subscription support
let currentTaskQuery: TaskQuery | null = null;
const queryListeners = new Set<(query: TaskQuery | null) => void>();

export const getTaskQuery = () => currentTaskQuery;

export const setTaskQuery = (query: TaskQuery | null) => {
	currentTaskQuery = query;
	queryListeners.forEach((listener) => listener(query));
};

export const clearTaskQuery = () => setTaskQuery(null);

export const subscribeToTaskQuery = (listener: (query: TaskQuery | null) => void) => {
	queryListeners.add(listener);
	return () => {
		queryListeners.delete(listener);
	};
};

// Server sync helper functions
async function fetchTasks(): Promise<Task[]> {
	const response = await fetch("/api/tasks");
	if (!response.ok) throw new Error("Failed to fetch tasks");
	return response.json();
}

async function fetchComments(): Promise<Comment[]> {
	const response = await fetch("/api/comments");
	if (!response.ok) throw new Error("Failed to fetch comments");
	return response.json();
}

async function syncTaskToServer(task: Task, action: "insert" | "update" | "delete"): Promise<void> {
	if (action === "insert") {
		await fetch("/api/tasks", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(task),
		});
	} else if (action === "update") {
		await fetch(`/api/tasks/${task.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(task),
		});
	} else if (action === "delete") {
		await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
	}
}

async function syncCommentToServer(comment: Comment, action: "insert" | "delete"): Promise<void> {
	if (action === "insert") {
		await fetch("/api/comments", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(comment),
		});
	} else if (action === "delete") {
		await fetch(`/api/comments/${comment.id}`, { method: "DELETE" });
	}
}

async function fetchMeetings(): Promise<Meeting[]> {
	const response = await fetch("/api/meetings");
	if (!response.ok) throw new Error("Failed to fetch meetings");
	return response.json();
}

async function syncMeetingToServer(meeting: Meeting, action: "insert" | "update" | "delete"): Promise<void> {
	if (action === "insert") {
		await fetch("/api/meetings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(meeting),
		});
	} else if (action === "update") {
		await fetch(`/api/meetings/${meeting.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(meeting),
		});
	} else if (action === "delete") {
		await fetch(`/api/meetings/${meeting.id}`, { method: "DELETE" });
	}
}

// Use localOnlyCollectionOptions as base, we'll handle sync manually
export const tasksCollection = createCollection(
	localOnlyCollectionOptions<typeof taskSchema>({
		id: "tasks",
		getKey: (task) => task.id,
		schema: taskSchema,
	}),
);

export const commentsCollection = createCollection(
	localOnlyCollectionOptions<typeof commentSchema>({
		id: "comments",
		getKey: (comment) => comment.id,
		schema: commentSchema,
	}),
);

export const meetingsCollection = createCollection(
	localOnlyCollectionOptions<typeof meetingSchema>({
		id: "meetings",
		getKey: (meeting) => meeting.id,
		schema: meetingSchema,
	}),
);

// Initialize collections from server data
let initialized = false;

export const startCollectionSync = async () => {
	if (initialized) return;
	initialized = true;

	try {
		// Fetch initial data from server
		const [serverTasks, serverComments, serverMeetings] = await Promise.all([
			fetchTasks(),
			fetchComments(),
			fetchMeetings(),
		]);

		// Populate collections with server data
		for (const task of serverTasks) {
			tasksCollection.insert(task);
		}
		for (const comment of serverComments) {
			commentsCollection.insert(comment);
		}
		for (const meeting of serverMeetings) {
			meetingsCollection.insert(meeting);
		}
	} catch (error) {
		console.error("Failed to sync with server:", error);
	}
};

// Refetch tasks from server and sync to collection
export const refetchTasks = async () => {
	try {
		const serverTasks = await fetchTasks();
		const serverTaskIds = new Set(serverTasks.map((t) => t.id));

		// Get current local task IDs
		const localTaskIds = new Set(tasksCollection.state.keys());

		// Insert new tasks and update existing ones
		for (const task of serverTasks) {
			const existing = tasksCollection.state.get(task.id);
			if (existing) {
				// Update existing task if different
				if (JSON.stringify(existing) !== JSON.stringify(task)) {
					tasksCollection.update(task.id, (draft) => {
						Object.assign(draft, task);
					});
				}
			} else {
				// Insert new task
				tasksCollection.insert(task);
			}
		}

		// Delete tasks that no longer exist on server
		for (const localId of localTaskIds) {
			if (!serverTaskIds.has(String(localId))) {
				tasksCollection.delete(String(localId));
			}
		}
	} catch (error) {
		console.error("Failed to refetch tasks:", error);
	}
};

// Refetch comments from server and sync to collection
export const refetchComments = async () => {
	try {
		const serverComments = await fetchComments();
		const serverCommentIds = new Set(serverComments.map((c) => c.id));

		// Get current local comment IDs
		const localCommentIds = new Set(commentsCollection.state.keys());

		// Insert new comments and update existing ones
		for (const comment of serverComments) {
			const existing = commentsCollection.state.get(comment.id);
			if (existing) {
				// Update existing comment if different
				if (JSON.stringify(existing) !== JSON.stringify(comment)) {
					commentsCollection.update(comment.id, (draft) => {
						Object.assign(draft, comment);
					});
				}
			} else {
				// Insert new comment
				commentsCollection.insert(comment);
			}
		}

		// Delete comments that no longer exist on server
		for (const localId of localCommentIds) {
			if (!serverCommentIds.has(String(localId))) {
				commentsCollection.delete(String(localId));
			}
		}
	} catch (error) {
		console.error("Failed to refetch comments:", error);
	}
};

export const createTask = async (
	task: Omit<Task, "id" | "createdAt"> & { id?: string },
) => {
	const newTask: Task = {
		...task,
		id: task.id ?? nanoid(),
		createdAt: new Date().toISOString(),
	};

	// Optimistic update
	tasksCollection.insert(newTask);

	// Sync to server
	try {
		await syncTaskToServer(newTask, "insert");
	} catch (error) {
		console.error("Failed to sync task to server:", error);
		// Rollback on error
		tasksCollection.delete(newTask.id);
		throw error;
	}

	return newTask;
};

export const updateTask = async (id: string, updates: Partial<Task>) => {
	const existing = tasksCollection.state.get(id);
	if (!existing) throw new Error("Task not found");

	const updatedTask = { ...existing, ...updates };

	// Optimistic update
	tasksCollection.update(id, (draft) => {
		Object.assign(draft, updates);
	});

	// Sync to server
	try {
		await syncTaskToServer(updatedTask, "update");
	} catch (error) {
		console.error("Failed to sync task update to server:", error);
		// Rollback on error
		tasksCollection.update(id, (draft) => {
			Object.assign(draft, existing);
		});
		throw error;
	}

	return updatedTask;
};

export const deleteTask = async (id: string) => {
	const existing = tasksCollection.state.get(id);
	if (!existing) return;

	// Optimistic delete
	tasksCollection.delete(id);

	// Sync to server
	try {
		await syncTaskToServer(existing, "delete");
	} catch (error) {
		console.error("Failed to sync task deletion to server:", error);
		// Rollback on error
		tasksCollection.insert(existing);
		throw error;
	}
};

export const addComment = async (
	comment: Omit<Comment, "id" | "date"> & { id?: string; date?: string },
) => {
	const newComment: Comment = {
		...comment,
		id: comment.id ?? nanoid(),
		date: comment.date ?? new Date().toISOString(),
	};

	// Optimistic update
	commentsCollection.insert(newComment);

	// Sync to server
	try {
		await syncCommentToServer(newComment, "insert");
	} catch (error) {
		console.error("Failed to sync comment to server:", error);
		// Rollback on error
		commentsCollection.delete(newComment.id);
		throw error;
	}

	return newComment;
};

export const deleteComment = async (id: string) => {
	const existing = commentsCollection.state.get(id);
	if (!existing) return;

	// Optimistic delete
	commentsCollection.delete(id);

	// Sync to server
	try {
		await syncCommentToServer(existing, "delete");
	} catch (error) {
		console.error("Failed to sync comment deletion to server:", error);
		// Rollback on error
		commentsCollection.insert(existing);
		throw error;
	}
};

// Refetch meetings from server and sync to collection
export const refetchMeetings = async () => {
	try {
		const serverMeetings = await fetchMeetings();
		const serverMeetingIds = new Set(serverMeetings.map((m) => m.id));

		const localMeetingIds = new Set(meetingsCollection.state.keys());

		for (const meeting of serverMeetings) {
			const existing = meetingsCollection.state.get(meeting.id);
			if (existing) {
				if (JSON.stringify(existing) !== JSON.stringify(meeting)) {
					meetingsCollection.update(meeting.id, (draft) => {
						Object.assign(draft, meeting);
					});
				}
			} else {
				meetingsCollection.insert(meeting);
			}
		}

		for (const localId of localMeetingIds) {
			if (!serverMeetingIds.has(String(localId))) {
				meetingsCollection.delete(String(localId));
			}
		}
	} catch (error) {
		console.error("Failed to refetch meetings:", error);
	}
};

export const createMeeting = async (options: {
	title?: string;
	conversationalContext?: string;
	maxCallDuration?: number;
}) => {
	// Server handles Tavus API call and DB insert
	const response = await fetch("/api/meetings", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(options),
	});
	if (!response.ok) throw new Error("Failed to create meeting");
	const newMeeting: Meeting = await response.json();

	// Add to local collection
	meetingsCollection.insert(newMeeting);

	return newMeeting;
};

export const updateMeeting = async (id: string, updates: Partial<Meeting>) => {
	const existing = meetingsCollection.state.get(id);
	if (!existing) throw new Error("Meeting not found");

	const updatedMeeting = { ...existing, ...updates };

	meetingsCollection.update(id, (draft) => {
		Object.assign(draft, updates);
	});

	try {
		await syncMeetingToServer(updatedMeeting, "update");
	} catch (error) {
		console.error("Failed to sync meeting update to server:", error);
		meetingsCollection.update(id, (draft) => {
			Object.assign(draft, existing);
		});
		throw error;
	}

	return updatedMeeting;
};

export const deleteMeeting = async (id: string) => {
	const existing = meetingsCollection.state.get(id);
	if (!existing) return;

	meetingsCollection.delete(id);

	try {
		await syncMeetingToServer(existing, "delete");
	} catch (error) {
		console.error("Failed to sync meeting deletion to server:", error);
		meetingsCollection.insert(existing);
		throw error;
	}
};
