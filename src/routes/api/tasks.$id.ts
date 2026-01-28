import { createFileRoute } from "@tanstack/react-router";
import { db, tasks, type Task } from "../../db";
import { eq } from "drizzle-orm";

export const Route = createFileRoute("/api/tasks/$id")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				const result = await db.select().from(tasks).where(eq(tasks.id, params.id));
				if (result.length === 0) {
					return Response.json({ error: "Task not found" }, { status: 404 });
				}
				return Response.json(result[0]);
			},
			PUT: async ({ request, params }) => {
				const body = (await request.json()) as Partial<Task>;
				const result = await db
					.update(tasks)
					.set(body)
					.where(eq(tasks.id, params.id))
					.returning();
				if (result.length === 0) {
					return Response.json({ error: "Task not found" }, { status: 404 });
				}
				return Response.json(result[0]);
			},
			DELETE: async ({ params }) => {
				const result = await db
					.delete(tasks)
					.where(eq(tasks.id, params.id))
					.returning();
				if (result.length === 0) {
					return Response.json({ error: "Task not found" }, { status: 404 });
				}
				return Response.json({ success: true });
			},
		},
	},
});
