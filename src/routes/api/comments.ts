import { createFileRoute } from "@tanstack/react-router";
import { db, comments, type NewComment } from "../../db";
import { eq } from "drizzle-orm";

export const Route = createFileRoute("/api/comments")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const url = new URL(request.url);
				const taskId = url.searchParams.get("taskId");

				if (taskId) {
					const result = await db.select().from(comments).where(eq(comments.taskId, taskId));
					return Response.json(result);
				}

				const allComments = await db.select().from(comments);
				return Response.json(allComments);
			},
			POST: async ({ request }) => {
				const body = (await request.json()) as NewComment;
				const result = await db.insert(comments).values(body).returning();
				return Response.json(result[0], { status: 201 });
			},
		},
	},
});
