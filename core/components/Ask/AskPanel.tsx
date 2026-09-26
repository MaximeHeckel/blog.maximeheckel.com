import {
  Icon,
  IconButton,
  Text,
  Tooltip,
  styled,
} from '@maximeheckel/design-system';
import { ChangeEvent, FormEvent, KeyboardEvent, useId, useState } from 'react';

import CopyToClipboardButton from '../Buttons/CopyToClipboardButton';
import { FloatingWindow, FloatingWindowState } from '../FloatingWindow';
import { Answer } from './Answer';
import { useAICompletion } from './useAICompletion';

interface AskPanelProps {
  state: FloatingWindowState;
  onStateChange: (state: FloatingWindowState) => void;
}

const Composer = styled('form', {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  // Window radius (22px) minus its footer inset (12px).
  borderRadius: 10,
  background:
    'linear-gradient(oklch(100% 0 0 / 4%), transparent), oklch(from var(--gray-300) calc(l + 0.035) c h)',
  border: '1px solid oklch(from var(--text-primary) l c h / 8%)',
  borderTopColor: 'oklch(from var(--gray-300) calc(l + 0.12) c h)',
  boxShadow:
    '0 2px 2px oklch(0% 0 0 / 12%), 0 8px 20px -6px oklch(0% 0 0 / 24%)',
});

// Keep the design-system textarea's typography and native input behavior,
// with the shared composer surface providing its elevation.
const ComposerInput = styled('textarea', {
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  display: 'block',
  boxSizing: 'border-box',
  width: '100%',
  minHeight: 58,
  maxHeight: 164,
  fieldSizing: 'content',
  overflowY: 'auto',
  margin: 0,
  padding: 'var(--space-2) var(--space-3)',
  resize: 'none',
  border: 'none',
  borderRadius: 'inherit',
  outline: 'none',
  background: 'transparent',
  fontFamily: 'inherit',
  fontFeatureSettings: 'inherit',
  fontSize: 'var(--font-size-1)',
  fontWeight: 'var(--font-weight-400)',
  letterSpacing: '0.15px',
  lineHeight: '26px',
  color: 'var(--text-primary)',
  '&::placeholder': { color: 'var(--text-tertiary)', opacity: 0.8 },
  '&:disabled': { cursor: 'not-allowed', opacity: 0.4 },
  '@media (max-width: 600px)': { fontSize: 16 },
});

const SendButton = styled(IconButton, {
  borderRadius: '50%',
  alignSelf: 'flex-end',
  flexShrink: 0,
  margin: '0 var(--space-3) var(--space-3) 0',
  background: 'oklch(from var(--text-primary) l c h / 8%)',
});

const Content = styled('div', {
  fontSize: 'var(--font-size-1)',
  lineHeight: 1.7,
  '> blockquote': {
    boxSizing: 'border-box',
    width: 'fit-content',
    maxWidth: '85%',
    margin: '0 0 var(--space-5) auto',
    padding: 'var(--space-2)',
    borderRadius: 'var(--border-radius-2)',
    background: 'oklch(from var(--gray-200) calc(l + 0.035) c h)',
    border: '1px solid var(--border-color)',
    boxShadow: '0 3px 8px -2px oklch(0% 0 0 / 18%)',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    textAlign: 'left',
  },
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
    <FloatingWindow
      state={state}
      onStateChange={(nextState) => {
        if (nextState === 'closed') {
          reset();
          setDraft('');
        }
        onStateChange(nextState);
      }}
      title="Ask"
      footer={
        <Composer
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            send();
          }}
        >
          <ComposerInput
            id={inputId}
            rows={1}
            aria-label="Ask a question"
            placeholder="What would you like to understand?"
            value={draft}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              setDraft(event.currentTarget.value)
            }
            onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
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
          <Tooltip
            id="ask-tooltip"
            content={status === 'loading' ? 'Cancel response' : 'Send question'}
          >
            <SendButton
              type={status === 'loading' ? 'button' : 'submit'}
              variant="tertiary"
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
          </Tooltip>
        </Composer>
      }
    >
      <Content>
        {!query ? (
          <Text as="p" size="1" variant="secondary">
            What would you like to understand? Ask a question about an article,
            a technique, or an idea.
          </Text>
        ) : null}
        {query ? (
          <Text as="blockquote" size="1" variant="secondary">
            {query}
          </Text>
        ) : null}
        <Answer text={streamData} onRender={onRender} />
        {status === 'done' && streamData ? (
          <div style={{ marginTop: 'var(--space-1)', marginLeft: -6 }}>
            <Tooltip id="ask-tooltip" content="Copy answer as Markdown">
              <CopyToClipboardButton
                text={streamData}
                label="Copy answer as Markdown"
              />
            </Tooltip>
          </div>
        ) : null}
        {status === 'loading' ? (
          <Text as="p" size="1" variant="tertiary" role="status">
            {streamData ? 'Writing…' : 'Thinking…'}
          </Text>
        ) : null}
        {error ? (
          <Text as="p" size="1" variant="danger" role="alert">
            {error.statusText}. Please try again.
          </Text>
        ) : null}
      </Content>
    </FloatingWindow>
  );
};
