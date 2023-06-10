import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from 'eventsource-parser';

import { mockStreamData } from './mockStreamData';

type OpenAIPayload = {
  max_tokens: number;
  temperature?: number;
  model: string;
  messages: Array<{ role: string; content: string }>;
  stream: boolean;
};

const OPEN_AI_API_KEY = process.env.OPEN_AI_API_KEY;

export const OpenAIMockStream = async () => {
  // eslint-disable-next-line no-console
  console.info('=== MOCK STREAM ===');
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === 'event') {
          const data = event.data;
          const lines = data.split('\n').map((line) => line.trim());

          for (const line of lines) {
            if (line == '[DONE]') {
              controller.close();
              return;
            } else {
              let token;
              try {
                token = JSON.parse(line).choices[0].delta.content;
                const queue = encoder.encode(token);
                controller.enqueue(queue);
              } catch (error) {
                controller.error(error);
                controller.close();
              }
            }
          }
        }
      }

      async function sendMockMessages() {
        // Simulate delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        for (const message of mockStreamData) {
          await new Promise((resolve) => setTimeout(resolve, 75));
          const event: {
            type: 'event';
            data: string;
          } = { type: 'event', data: message };

          onParse(event);
        }
      }

      sendMockMessages().catch((error) => {
        controller.error(error);
      });
    },
  });

  return stream;
};

const OpenAIStream = async (payload: OpenAIPayload, sources: string[]) => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const URL = 'https://api.openai.com/v1/chat/completions';

  const res: Response = await fetch(URL, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPEN_AI_API_KEY ?? ''}`,
    },
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const stream = new ReadableStream({
    async start(controller) {
      function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === 'event') {
          const data = event.data;
          const lines = data.split('\n').map((line) => line.trim());
          // eslint-disable-next-line no-console
          for (const line of lines) {
            if (line == '[DONE]') {
              for (const sourceToken of sources) {
                const queue = encoder.encode(sourceToken);
                controller.enqueue(queue);
              }
              controller.close();
              return;
            } else {
              let token;
              try {
                token = JSON.parse(line).choices[0].delta?.content;
                // eslint-disable-next-line no-console
                if (typeof token !== 'undefined') {
                  const queue = encoder.encode(token);
                  controller.enqueue(queue);
                }
              } catch (error) {
                controller.error(error);
                controller.close();
              }
            }
          }
        }
      }

      // stream response (SSE) from OpenAI may be fragmented into multiple chunks
      // this ensures we properly read chunks & invoke an event for each SSE event stream
      const parser = createParser(onParse);

      //   // https://web.dev/streams/#asynchronous-iteration
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
};

export default OpenAIStream;
