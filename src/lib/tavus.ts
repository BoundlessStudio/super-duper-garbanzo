const TAVUS_BASE = "https://tavusapi.com/v2";

function getApiKey(): string {
	const key = process.env.TAVUS_API_KEY;
	if (!key) throw new Error("TAVUS_API_KEY environment variable is not set");
	return key;
}

function getPersonaId(): string {
	const id = process.env.TAVUS_PERSONA_ID;
	if (!id) throw new Error("TAVUS_PERSONA_ID environment variable is not set");
	return id;
}

function getReplicaId(): string {
	const id = process.env.TAVUS_REPLICA_ID;
	if (!id) throw new Error("TAVUS_REPLICA_ID environment variable is not set");
	return id;
}

export type TavusConversation = {
	conversation_id: string;
	conversation_name: string;
	conversation_url: string;
	status: string;
	created_at: string;
};

export type TavusConversationDetail = TavusConversation & {
	shutdown_reason?: string;
	transcript?: unknown;
};

export async function createTavusConversation(options?: {
	conversationName?: string;
	conversationalContext?: string;
	maxCallDuration?: number;
}): Promise<TavusConversation> {
	const response = await fetch(`${TAVUS_BASE}/conversations`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": getApiKey(),
		},
		body: JSON.stringify({
			persona_id: getPersonaId(),
			replica_id: getReplicaId(),
			...(options?.conversationName && { conversation_name: options.conversationName }),
			...(options?.conversationalContext && { conversational_context: options.conversationalContext }),
			...(options?.maxCallDuration && {
				properties: { max_call_duration: options.maxCallDuration },
			}),
		}),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Tavus API error (${response.status}): ${error}`);
	}

	return response.json();
}

export async function listTavusConversations(): Promise<TavusConversation[]> {
	const response = await fetch(`${TAVUS_BASE}/conversations`, {
		headers: { "x-api-key": getApiKey() },
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Tavus API error (${response.status}): ${error}`);
	}

	const data = await response.json();
	return data.data ?? data;
}

export async function getTavusConversation(conversationId: string): Promise<TavusConversationDetail> {
	const response = await fetch(`${TAVUS_BASE}/conversations/${conversationId}?verbose=true`, {
		headers: { "x-api-key": getApiKey() },
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Tavus API error (${response.status}): ${error}`);
	}

	return response.json();
}

export async function endTavusConversation(conversationId: string): Promise<void> {
	const response = await fetch(`${TAVUS_BASE}/conversations/${conversationId}/end`, {
		method: "POST",
		headers: { "x-api-key": getApiKey() },
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Tavus API error (${response.status}): ${error}`);
	}
}
