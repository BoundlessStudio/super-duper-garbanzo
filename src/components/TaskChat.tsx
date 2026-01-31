"use client";

import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { CopyIcon, RefreshCcwIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { refetchTasks, refetchComments, setTaskQuery, type TaskQuery } from "@/collections/db";
import {
	Attachment,
	AttachmentPreview,
	AttachmentRemove,
	Attachments,
} from "@/components/ai-elements/attachments";
import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import {
	Message,
	MessageAction,
	MessageActions,
	MessageContent,
	MessageResponse,
} from "@/components/ai-elements/message";
import {
	PromptInput,
	PromptInputActionAddAttachments,
	PromptInputActionMenu,
	PromptInputActionMenuContent,
	PromptInputActionMenuTrigger,
	PromptInputBody,
	PromptInputFooter,
	PromptInputHeader,
	type PromptInputMessage,
	PromptInputSelect,
	PromptInputSelectContent,
	PromptInputSelectItem,
	PromptInputSelectTrigger,
	PromptInputSelectValue,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputTools,
	usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";
import {
	Reasoning,
	ReasoningContent,
	ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
	Source,
	Sources,
	SourcesContent,
	SourcesTrigger,
} from "@/components/ai-elements/sources";
import {
	Tool,
	ToolContent,
	ToolHeader,
	ToolInput,
	ToolOutput,
} from "@/components/ai-elements/tool";

const PromptInputAttachmentsDisplay = () => {
	const attachments = usePromptInputAttachments();
	if (attachments.files.length === 0) {
		return null;
	}
	return (
		<Attachments variant="inline">
			{attachments.files.map((attachment) => (
				<Attachment
					data={attachment}
					key={attachment.id}
					onRemove={() => attachments.remove(attachment.id)}
				>
					<AttachmentPreview />
					<AttachmentRemove />
				</Attachment>
			))}
		</Attachments>
	);
};

const models = [
	{
		name: "GPT-5.2",
		value: "gpt-5.2",
	},
	{
		name: "GPT-5.2 Codex",
		value: "gpt-5.2-codex",
	},
];


const getToolTitle = (toolName: string): string => {
	const titles: Record<string, string> = {
		createTask: "Create Task",
		updateTask: "Update Task",
		removeTask: "Remove Task",
		listTasks: "List Tasks",
		filterTaskList: "Filter Task List",
		addComment: "Add Comment",
	};
	return titles[toolName] || toolName;
};

const hasTaskQueryCriteria = (query?: TaskQuery | null): query is TaskQuery => {
	if (!query) {
		return false;
	}
	if (query.limit && query.limit > 0) {
		return true;
	}
	if (query.sort) {
		return true;
	}
	const filter = query.filter;
	if (!filter) {
		return false;
	}
	if (filter.status && filter.status.length > 0) {
		return true;
	}
	if (filter.assignment?.trim()) {
		return true;
	}
	if (filter.search?.trim()) {
		return true;
	}
	if (filter.dueDateFrom) {
		return true;
	}
	if (filter.dueDateTo) {
		return true;
	}
	if (filter.overdue !== undefined) {
		return true;
	}
	return false;
};

const TaskChat = () => {
	const [input, setInput] = useState("");
	const [model, setModel] = useState<string>(models[0].value);
	const chatTransport = useMemo(
		() => new DefaultChatTransport({ api: "/api/chat/task" }),
		[],
	);
	const { messages, sendMessage, status, regenerate, addToolOutput } = useChat({
		transport: chatTransport,
		onToolCall: async ({ toolCall }) => {
			if (toolCall.toolName === "filterTaskList") {
				const query = toolCall.input as TaskQuery | undefined;
				const normalizedQuery = hasTaskQueryCriteria(query) ? query : null;
				setTaskQuery(normalizedQuery);
				const isClear = normalizedQuery === null;
				console.log("[TaskChat] filterTaskList called with:", normalizedQuery);
				const output = isClear
					? {
							success: true,
							action: "clear",
							message: "Task filter cleared. Showing all tasks.",
					  }
					: {
							success: true,
							message: "Task filter applied on client.",
							query: normalizedQuery,
					  };
				addToolOutput({
					toolCallId: toolCall.toolCallId,
					tool: "filterTaskList",
					output,
				});
				return;
			}
		},
	});
	const lastRefreshedCount = useRef(0);

	// Refetch tasks and comments when messages change and we're not streaming
	useEffect(() => {
		console.log("[TaskChat] useEffect triggered - status:", status, "messages:", messages.length);
		// Only refresh when not actively streaming and messages have changed
		if (status !== "streaming" && status !== "submitted") {
			const messageCount = messages.length;
			if (messageCount > lastRefreshedCount.current) {
				console.log("[TaskChat] Triggering refetch - count changed from", lastRefreshedCount.current, "to", messageCount);
				lastRefreshedCount.current = messageCount;
				refetchTasks();
				refetchComments();
			}
		}
	}, [messages, status]);

	const handleSubmit = (message: PromptInputMessage) => {
		const hasText = Boolean(message.text);
		const hasAttachments = Boolean(message.files?.length);
		if (!(hasText || hasAttachments)) {
			return;
		}
		sendMessage(
			{
				text: message.text || "Sent with attachments",
				files: message.files,
			},
			{
				body: {
					model: model,
				},
			},
		);
		setInput("");
	};

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-4 min-h-0">
			<Conversation className="flex-1 min-h-0">
				<ConversationContent>
						{messages.map((message) => (
							<div key={message.id}>
								{message.role === "assistant" &&
									message.parts.filter((part) => part.type === "source-url")
										.length > 0 && (
										<Sources>
											<SourcesTrigger
												count={
													message.parts.filter(
														(part) => part.type === "source-url",
													).length
												}
											/>
											{message.parts
												.filter((part) => part.type === "source-url")
												.map((part, i) => (
													<SourcesContent key={`${message.id}-${i}`}>
														<Source
															key={`${message.id}-${i}`}
															href={part.url}
															title={part.url}
														/>
													</SourcesContent>
												))}
										</Sources>
									)}
								{message.parts.map((part, i) => {
									// Handle tool parts (type starts with "tool-")
									if (part.type.startsWith("tool-")) {
										const toolPart = part as {
											type: string;
											toolCallId: string;
											state: "input-streaming" | "input-available" | "output-available" | "output-error";
											input: unknown;
											output?: unknown;
											errorText?: string;
										};
										const toolName = part.type.replace("tool-", "");
										return (
											<Tool key={`${message.id}-${i}`}>
												<ToolHeader
													title={getToolTitle(toolName)}
													type={toolPart.type as `tool-${string}`}
													state={toolPart.state}
												/>
												<ToolContent>
													<ToolInput input={toolPart.input} />
													{(toolPart.state === "output-available" || toolPart.state === "output-error") && (
														<ToolOutput
															output={toolPart.output}
															errorText={toolPart.errorText}
														/>
													)}
												</ToolContent>
											</Tool>
										);
									}

									switch (part.type) {
										case "text":
											return (
												<Message key={`${message.id}-${i}`} from={message.role}>
													<MessageContent>
														<MessageResponse>{part.text}</MessageResponse>
													</MessageContent>
													{message.role === "assistant" &&
														i === messages.length - 1 && (
															<MessageActions>
																<MessageAction
																	onClick={() => regenerate()}
																	label="Retry"
																>
																	<RefreshCcwIcon className="size-3" />
																</MessageAction>
																<MessageAction
																	onClick={() =>
																		navigator.clipboard.writeText(part.text)
																	}
																	label="Copy"
																>
																	<CopyIcon className="size-3" />
																</MessageAction>
															</MessageActions>
														)}
												</Message>
											);
										case "reasoning":
											return (
												<Reasoning
													key={`${message.id}-${i}`}
													className="w-full"
													isStreaming={
														status === "streaming" &&
														i === message.parts.length - 1 &&
														message.id === messages.at(-1)?.id
													}
												>
													<ReasoningTrigger />
													<ReasoningContent>{part.text}</ReasoningContent>
												</Reasoning>
											);
										default:
											return null;
									}
								})}
							</div>
						))}
						{status === "submitted" && <Loader />}
					</ConversationContent>
				<ConversationScrollButton />
			</Conversation>
			<PromptInput
				onSubmit={handleSubmit}
				className="flex-shrink-0"
				globalDrop
				multiple
			>
				<PromptInputHeader>
					<PromptInputAttachmentsDisplay />
				</PromptInputHeader>
				<PromptInputBody>
					<PromptInputTextarea
						onChange={(e) => setInput(e.target.value)}
						value={input}
					/>
				</PromptInputBody>
				<PromptInputFooter>
					<PromptInputTools>
						<PromptInputActionMenu>
							<PromptInputActionMenuTrigger />
							<PromptInputActionMenuContent>
								<PromptInputActionAddAttachments />
							</PromptInputActionMenuContent>
						</PromptInputActionMenu>
						<PromptInputSelect
							onValueChange={(value) => {
								setModel(value);
							}}
							value={model}
						>
							<PromptInputSelectTrigger>
								<PromptInputSelectValue />
							</PromptInputSelectTrigger>
							<PromptInputSelectContent>
								{models.map((modelOption) => (
									<PromptInputSelectItem
										key={modelOption.value}
										value={modelOption.value}
									>
										{modelOption.name}
									</PromptInputSelectItem>
								))}
							</PromptInputSelectContent>
						</PromptInputSelect>
					</PromptInputTools>
					<PromptInputSubmit disabled={!input && !status} status={status} />
				</PromptInputFooter>
			</PromptInput>
		</div>
	);
};

export default TaskChat;
