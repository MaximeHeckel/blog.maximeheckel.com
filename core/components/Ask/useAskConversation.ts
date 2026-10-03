import type { AskAttachment } from 'lib/askAttachments';
import { AskMessage, boundAskHistory } from 'lib/askConversation';
import { AskPageContext, captureAskPageContext } from 'lib/askPageContext';
import { useId, useRef, useState } from 'react';

import { useAICompletion } from './useAICompletion';

// This owner stays mounted when the FloatingWindow closes or minimizes.
export const useAskConversation = () => {
  const completion = useAICompletion();
  const [history, setHistory] = useState<AskMessage[]>([]);
  const [attachments, setAttachments] = useState<AskAttachment[]>([]);
  const [pageContext, setPageContext] = useState<AskPageContext>();
  const prefix = useId();
  const turn = useRef(0);
  const sending = useRef(false);
  const requestId = useRef(0);
  const current: AskMessage[] = completion.query
    ? [
        {
          id: `${prefix}-${turn.current}-user`,
          role: 'user',
          content: completion.query,
          attachments,
          pageContext,
        },
        {
          id: `${prefix}-${turn.current}-assistant`,
          role: 'assistant',
          content: completion.streamData,
          sources: completion.sources ?? [],
        },
      ]
    : [];
  const messages = [...history, ...current];

  const send = async (query: string, nextAttachments: AskAttachment[]) => {
    if (sending.current || completion.status === 'loading') return;
    sending.current = true;
    const request = ++requestId.current;
    const previous = [...history, ...current];
    const nextPageContext = captureAskPageContext();
    setPageContext(nextPageContext);
    setHistory(previous);
    setAttachments([...nextAttachments]);
    turn.current += 1;
    try {
      const bounded = boundAskHistory(previous);
      await completion.submitQuery(
        query,
        nextAttachments,
        bounded,
        nextPageContext
      );
    } finally {
      if (requestId.current === request) sending.current = false;
    }
  };

  const abort = () => {
    requestId.current += 1;
    sending.current = false;
    completion.abort();
  };

  const reset = () => {
    requestId.current += 1;
    sending.current = false;
    completion.reset();
    setHistory([]);
    setAttachments([]);
    setPageContext(undefined);
  };
  return { ...completion, messages, send, reset, abort };
};
