import { createFileRoute } from "@tanstack/react-router";
import { nanoid } from "nanoid";
import { db, meetings } from "../../db";
import { createTavusConversation } from "../../lib/tavus";

export const Route = createFileRoute("/api/meetings")({
	server: {
		handlers: {
			GET: async () => {
				const allMeetings = await db.select().from(meetings);
				return Response.json(allMeetings);
			},
			POST: async ({ request }) => {
				const body = await request.json();
				const { title, conversationalContext, maxCallDuration } = body as {
					title?: string;
					conversationalContext?: string;
					maxCallDuration?: number;
				};

				const meetingTitle = title || "Meeting";

				// Create conversation via Tavus API
				const tavusConversation = await createTavusConversation({
					conversationName: meetingTitle,
					conversationalContext,
					maxCallDuration,
				});

				// Save meeting to database
				const id = nanoid();
				const now = new Date().toISOString();
				const result = await db
					.insert(meetings)
					.values({
						id,
						title: meetingTitle,
						meetingUrl: tavusConversation.conversation_url,
						conversationId: tavusConversation.conversation_id,
						status: "Active",
						participants: "",
						notes: "",
						scheduledAt: now,
						createdAt: now,
					})
					.returning();

				return Response.json(result[0], { status: 201 });
			},
		},
	},
});
