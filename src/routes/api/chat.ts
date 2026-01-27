import {
  streamText,
  convertToModelMessages,
  stepCountIs,
  type UIMessage,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/chat')({
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
          system: 'You are a helpful assistant that can answer questions and help with tasks',
          stopWhen: stepCountIs(50),
        });

        // send sources and reasoning back to the client
        return result.toUIMessageStreamResponse({
          sendSources: true,
          sendReasoning: true
        });
      },
    },
  },
});
