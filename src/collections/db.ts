"use client";

import {
	createCollection,
	localStorageCollectionOptions,
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
	dueDate: z.string(), // ISO date string (YYYY-MM-DD)
	status: z.enum(TASK_STATUSES),
	createdAt: z.string(),
});

const commentZodSchema = z.object({
	id: z.string(),
	taskId: z.string(),
	activity: z.string().min(1),
	note: z.string().min(1),
	date: z.string(), // ISO timestamp
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

export const tasksCollection = createCollection(
	localStorageCollectionOptions<typeof taskSchema>({
		id: "tasks",
		storageKey: "tasks",
		getKey: (task) => task.id,
		schema: taskSchema,
	}),
);

export const commentsCollection = createCollection(
	localStorageCollectionOptions<typeof commentSchema>({
		id: "comments",
		storageKey: "comments",
		getKey: (comment) => comment.id,
		schema: commentSchema,
	}),
);

export const createTask = (
	task: Omit<Task, "id" | "createdAt"> & { id?: string },
) => {
	return tasksCollection.insert({
		...task,
		id: task.id ?? nanoid(),
		createdAt: new Date().toISOString(),
	});
};

export const addComment = (
	comment: Omit<Comment, "id" | "date"> & { id?: string; date?: string },
) => {
	return commentsCollection.insert({
		...comment,
		id: comment.id ?? nanoid(),
		date: comment.date ?? new Date().toISOString(),
	});
};
