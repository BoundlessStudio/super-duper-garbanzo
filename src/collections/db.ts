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

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type Task = z.infer<typeof taskZodSchema>;
export type Comment = z.infer<typeof commentZodSchema>;

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

// Initialize collections from server data
let initialized = false;

export const startCollectionSync = async () => {
	if (initialized) return;
	initialized = true;

	try {
		// Fetch initial data from server
		const [serverTasks, serverComments] = await Promise.all([
			fetchTasks(),
			fetchComments(),
		]);

		// Populate collections with server data
		for (const task of serverTasks) {
			tasksCollection.insert(task);
		}
		for (const comment of serverComments) {
			commentsCollection.insert(comment);
		}
	} catch (error) {
		console.error("Failed to sync with server:", error);
	}
};

// Refetch tasks from server and sync to collection
export const refetchTasks = async () => {
	console.log("[refetchTasks] Starting refetch...");
	try {
		const serverTasks = await fetchTasks();
		console.log("[refetchTasks] Fetched", serverTasks.length, "tasks from server");

		// Insert all server tasks - collection will handle duplicates
		for (const task of serverTasks) {
			try {
				tasksCollection.insert(task);
				console.log("[refetchTasks] Inserted task:", task.id);
			} catch {
				// Task might already exist, ignore
			}
		}

		// Dispatch event to notify listeners
		if (typeof window !== "undefined") {
			console.log("[refetchTasks] Dispatching tasks-updated event");
			window.dispatchEvent(new CustomEvent("tasks-updated"));
		}
	} catch (error) {
		console.error("Failed to refetch tasks:", error);
	}
};

// Refetch comments from server and sync to collection
export const refetchComments = async () => {
	try {
		const serverComments = await fetchComments();

		// Insert all server comments - collection will handle duplicates
		for (const comment of serverComments) {
			try {
				commentsCollection.insert(comment);
			} catch {
				// Comment might already exist, ignore
			}
		}

		// Dispatch event to notify listeners
		if (typeof window !== "undefined") {
			window.dispatchEvent(new CustomEvent("comments-updated"));
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
