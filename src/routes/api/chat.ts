import {
	streamText,
	convertToModelMessages,
	stepCountIs,
	tool,
	zodSchema,
	type UIMessage,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db, tasks, comments, TASK_STATUSES, type Task, type Comment } from "../../db";
import { eq } from "drizzle-orm";

type TaskStatus = (typeof TASK_STATUSES)[number];

// Tool parameter schemas
const createTaskSchema = z.object({
	name: z.string().describe("The name/title of the task"),
	description: z
		.string()
		.optional()
		.describe("A detailed description of the task"),
	assignment: z.string().describe("The person assigned to this task"),
	dueDate: z.string().describe("The due date in YYYY-MM-DD format"),
	status: z
		.enum(TASK_STATUSES)
		.default("Not Started")
		.describe("The initial status of the task"),
});

const updateTaskSchema = z.object({
	taskId: z.string().describe("The ID of the task to update"),
	name: z.string().optional().describe("New name for the task"),
	description: z.string().optional().describe("New description for the task"),
	assignment: z.string().optional().describe("New assignee for the task"),
	dueDate: z.string().optional().describe("New due date in YYYY-MM-DD format"),
	status: z.enum(TASK_STATUSES).optional().describe("New status for the task"),
});

const addCommentSchema = z.object({
	taskId: z.string().describe("The ID of the task to add a comment to"),
	note: z.string().describe("The comment text"),
	author: z.string().describe("The name of the person adding the comment"),
	activity: z
		.string()
		.default("Note")
		.describe('The type of activity (e.g., "Note", "Status Update")'),
});

export const Route = createFileRoute("/api/chat")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const {
					messages,
					model,
				}: {
					messages: UIMessage[];
					model: string;
				} = await request.json();

				const result = streamText({
					model: openai(model),
					messages: await convertToModelMessages(messages),
					system: `You are a helpful assistant that can answer questions and help with tasks.

You have access to tools for managing tasks:
- createTask: Create a new task with name, description, assignee, due date, and status
- updateTask: Update an existing task's fields (status, description, etc.)
- listTasks: Get all current tasks to see what exists

When users ask you to create or update tasks, use the appropriate tools. Always confirm what you've done after using a tool.`,
					stopWhen: stepCountIs(50),
					tools: {
						createTask: tool({
							description: "Create a new task in the task list",
							inputSchema: zodSchema(createTaskSchema),
							execute: async (params) => {
								const { name, description, assignment, dueDate, status } = params;
								const newTask = {
									id: nanoid(),
									name,
									description: description || "",
									assignment,
									dueDate,
									status: status || "Not Started",
									createdAt: new Date().toISOString(),
								};
								const result = await db.insert(tasks).values(newTask).returning();
								const task = result[0];
								return {
									success: true,
									task: {
										id: task.id,
										name: task.name,
										assignment: task.assignment,
										dueDate: task.dueDate,
										status: task.status,
									},
									message: `Created task "${name}" assigned to ${assignment}`,
								};
							},
						}),
						updateTask: tool({
							description:
								"Update an existing task. Use listTasks first to find the task ID.",
							inputSchema: zodSchema(updateTaskSchema),
							execute: async (params) => {
								const { taskId, name, description, assignment, dueDate, status } =
									params;
								const existing = await db
									.select()
									.from(tasks)
									.where(eq(tasks.id, taskId));
								if (existing.length === 0) {
									return { success: false, error: `Task with ID ${taskId} not found` };
								}
								const updates: Partial<Task> = {};
								if (name !== undefined) updates.name = name;
								if (description !== undefined) updates.description = description;
								if (assignment !== undefined) updates.assignment = assignment;
								if (dueDate !== undefined) updates.dueDate = dueDate;
								if (status !== undefined) updates.status = status;

								const result = await db
									.update(tasks)
									.set(updates)
									.where(eq(tasks.id, taskId))
									.returning();
								const updatedTask = result[0];
								return {
									success: true,
									task: updatedTask,
									message: `Updated task "${updatedTask.name}"`,
								};
							},
						}),
						listTasks: tool({
							description:
								"Get all tasks from the task list. Use this to see what tasks exist before updating them.",
							inputSchema: zodSchema(z.object({})),
							execute: async () => {
								const allTasks = await db.select().from(tasks);
								return {
									success: true,
									tasks: allTasks.map((t) => ({
										id: t.id,
										name: t.name,
										description: t.description,
										assignment: t.assignment,
										dueDate: t.dueDate,
										status: t.status,
									})),
									count: allTasks.length,
								};
							},
						}),
						addComment: tool({
							description: "Add a comment/note to a task",
							inputSchema: zodSchema(addCommentSchema),
							execute: async (params) => {
								const { taskId, note, author, activity } = params;
								const task = await db
									.select()
									.from(tasks)
									.where(eq(tasks.id, taskId));
								if (task.length === 0) {
									return { success: false, error: `Task with ID ${taskId} not found` };
								}
								const newComment = {
									id: nanoid(),
									taskId,
									activity: activity || "Note",
									note,
									date: new Date().toISOString(),
									author,
								};
								const result = await db.insert(comments).values(newComment).returning();
								const comment = result[0];
								return {
									success: true,
									comment: { id: comment.id, taskId, note, author },
									message: `Added comment to task "${task[0].name}"`,
								};
							},
						}),
					},
				});

				// send sources and reasoning back to the client
				return result.toUIMessageStreamResponse({
					sendSources: true,
					sendReasoning: true,
				});
			},
		},
	},
});
