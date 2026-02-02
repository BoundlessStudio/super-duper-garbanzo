import { createFileRoute } from "@tanstack/react-router";
import { db, meetings, type Meeting } from "../../db";
import { eq } from "drizzle-orm";
import { endTavusConversation, getTavusConversation } from "../../lib/tavus";

export const Route = createFileRoute("/api/meetings/$id")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				const result = await db.select().from(meetings).where(eq(meetings.id, params.id));
				if (result.length === 0) {
					return Response.json({ error: "Meeting not found" }, { status: 404 });
				}

				// If there's a Tavus conversation ID, fetch details from Tavus
				const meeting = result[0];
				if (meeting.conversationId) {
					try {
						const tavusDetail = await getTavusConversation(meeting.conversationId);
						return Response.json({ ...meeting, tavusDetail });
					} catch {
						// If Tavus fetch fails, return meeting without Tavus details
						return Response.json(meeting);
					}
				}

				return Response.json(meeting);
			},
			PUT: async ({ request, params }) => {
				const body = (await request.json()) as Partial<Meeting>;
				const result = await db
					.update(meetings)
					.set(body)
					.where(eq(meetings.id, params.id))
					.returning();
				if (result.length === 0) {
					return Response.json({ error: "Meeting not found" }, { status: 404 });
				}
				return Response.json(result[0]);
			},
			DELETE: async ({ params }) => {
				// Look up the meeting to get the Tavus conversation ID
				const existing = await db.select().from(meetings).where(eq(meetings.id, params.id));
				if (existing.length === 0) {
					return Response.json({ error: "Meeting not found" }, { status: 404 });
				}

				// End the Tavus conversation if it exists
				const meeting = existing[0];
				if (meeting.conversationId) {
					try {
						await endTavusConversation(meeting.conversationId);
					} catch (error) {
						// Log but don't block deletion if Tavus end fails
						console.error("Failed to end Tavus conversation:", error);
					}
				}

				// Update status to Completed instead of deleting
				const result = await db
					.update(meetings)
					.set({ status: "Completed" })
					.where(eq(meetings.id, params.id))
					.returning();

				return Response.json(result[0]);
			},
		},
	},
});
