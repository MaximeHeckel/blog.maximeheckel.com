import {
  Icon,
  IconButton,
  Text,
  TextArea,
  styled,
} from '@maximeheckel/design-system';
import { FormEvent, useId, useState } from 'react';

import { ReadingPanel, ReadingPanelState } from '../ReadingPanel';
import { Answer } from './Answer';
import { useAICompletion } from './useAICompletion';

interface AskPanelProps {
  state: ReadingPanelState;
  onStateChange: (state: ReadingPanelState) => void;
}

const Composer = styled('form', {
  position: 'relative',
  textarea: {
    boxSizing: 'border-box',
    minHeight: 120,
    paddingBottom: 48,
    '@media (max-width: 600px)': { fontSize: 16 },
  },
});
const SendButton = styled(IconButton, {
  borderRadius: '50%',
  position: 'absolute',
  right: 'var(--space-3)',
  bottom: 'var(--space-3)',
});
const Content = styled('div', {
  fontSize: 'var(--font-size-1)',
  lineHeight: 1.7,
  '> blockquote': {
    margin: '0 0 var(--space-5)',
    padding: 'var(--space-3)',
    borderRadius: 'var(--border-radius-2)',
    background: 'var(--card-background)',
    whiteSpace: 'pre-wrap',
  },
  h3: { fontSize: 'var(--font-size-2)' },
  a: { color: 'var(--text-primary)' },
});
const onRender = () => {};

export const AskPanel = ({ state, onStateChange }: AskPanelProps) => {
  const [draft, setDraft] = useState('');
  const inputId = useId();
  const { query, streamData, status, error, submitQuery, reset } =
    useAICompletion();
  const send = () => {
    if (!draft.trim() || status === 'loading') return;
    void submitQuery(draft.trim());
    setDraft('');
  };

  return (
    <ReadingPanel
      state={state}
      onStateChange={onStateChange}
      title="Ask"
      footer={
        <Composer
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            send();
          }}
        >
          <TextArea
            id={inputId}
            rows={3}
            resize="none"
            aria-label="Ask a question"
            placeholder="What would you like to understand?"
            value={draft}
            onChange={(event) => setDraft(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();
                send();
              }
            }}
          />
          <SendButton
            type={status === 'loading' ? 'button' : 'submit'}
            variant="secondary"
            size="small"
            aria-label={
              status === 'loading' ? 'Cancel response' : 'Send question'
            }
            disabled={status !== 'loading' && !draft.trim()}
            onClick={status === 'loading' ? reset : undefined}
          >
            {status === 'loading' ? (
              <Icon.Pause size="4" />
            ) : (
              <Icon.Arrow size="4" style={{ transform: 'rotate(-90deg)' }} />
            )}
          </SendButton>
        </Composer>
      }
    >
      <Content>
        {query ? (
          <Text as="blockquote" size="1" variant="secondary">
            {query}
          </Text>
        ) : null}
        <Answer text={streamData} onRender={onRender} />
        {error ? (
          <p role="alert">{error.statusText}. Please try again.</p>
        ) : null}
      </Content>
    </ReadingPanel>
  );
};
