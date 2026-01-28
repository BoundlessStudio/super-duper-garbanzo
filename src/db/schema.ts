import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const TASK_STATUSES = [
	"Not Started",
	"In Progress",
	"Blocked",
	"Done",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const tasks = sqliteTable("tasks", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description").notNull().default(""),
	assignment: text("assignment").notNull(),
	dueDate: text("due_date").notNull(),
	status: text("status", { enum: TASK_STATUSES }).notNull().default("Not Started"),
	createdAt: text("created_at").notNull(),
});

export const comments = sqliteTable("comments", {
	id: text("id").primaryKey(),
	taskId: text("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
	activity: text("activity").notNull(),
	note: text("note").notNull(),
	date: text("date").notNull(),
	author: text("author").notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
