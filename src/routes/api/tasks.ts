import { createFileRoute } from "@tanstack/react-router";
import { db, tasks, type NewTask } from "../../db";
import { eq } from "drizzle-orm";

export const Route = createFileRoute("/api/tasks")({
	server: {
		handlers: {
			GET: async () => {
				const allTasks = await db.select().from(tasks);
				return Response.json(allTasks);
			},
			POST: async ({ request }) => {
				const body = (await request.json()) as NewTask;
				const result = await db.insert(tasks).values(body).returning();
				return Response.json(result[0], { status: 201 });
			},
		},
	},
});
