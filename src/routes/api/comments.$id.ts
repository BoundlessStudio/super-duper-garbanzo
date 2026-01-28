import { createFileRoute } from "@tanstack/react-router";
import { db, comments } from "../../db";
import { eq } from "drizzle-orm";

export const Route = createFileRoute("/api/comments/$id")({
	server: {
		handlers: {
			DELETE: async ({ params }) => {
				const result = await db
					.delete(comments)
					.where(eq(comments.id, params.id))
					.returning();
				if (result.length === 0) {
					return Response.json({ error: "Comment not found" }, { status: 404 });
				}
				return Response.json({ success: true });
			},
		},
	},
});
