import { Icon, IconButton, Text, Tooltip } from '@maximeheckel/design-system';
import type { AskAttachment } from 'lib/askAttachments';
import {
  Fragment,
  useEffect,
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useId,
  useRef,
  useState,
} from 'react';

import CopyToClipboardButton from '../Buttons/CopyToClipboardButton';
import { FloatingWindow, FloatingWindowState } from '../FloatingWindow';
import RGBLensIcon from '../RGBLensIcon';
import { Answer } from './Answer';
import {
  Composer,
  ComposerInput,
  Content,
  EmptyState,
  SendButton,
} from './AskPanel.styles';
import { AttachmentPills } from './AttachmentPills';
import { useAskConversation } from './useAskConversation';

interface AskPanelProps {
  attachments?: AskAttachment[];
  onAttachmentsChange?: (attachments: AskAttachment[]) => void;
  focusRequest?: number;
  state: FloatingWindowState;
  onStateChange: (state: FloatingWindowState) => void;
}

const onRender = () => {};

export const AskPanel = ({
  state,
  onStateChange,
  attachments = [],
  onAttachmentsChange,
  focusRequest,
}: AskPanelProps) => {
  const [draft, setDraft] = useState('');

  const attachmentOverlayHeight = attachments.length
    ? attachments.length === 2
      ? 'calc(2 * var(--space-6) + var(--space-1) + var(--space-2))'
      : 'calc(var(--space-6) + var(--space-2))'
    : '0px';
  const latestQuestionRef = useRef<HTMLQuoteElement>(null);
  const inputId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const {
    messages,
    streamData,
    status,
    error,
    send: sendMessage,
    reset,
    abort,
  } = useAskConversation();

  useEffect(() => {
    if (state === 'open') inputRef.current?.focus({ preventScroll: true });
  }, [focusRequest, state]);

  const send = () => {
    if (!draft.trim() || status === 'loading') return;

    void sendMessage(draft.trim(), attachments);
    onAttachmentsChange?.([]);
    setDraft('');
  };

  return (
    <FloatingWindow
      initialFocusRef={inputRef}
      scrollToBottomRequest={messages.at(-1)?.id}
      scrollBoundaryRef={latestQuestionRef}
      showScrollToLatest
      bottomOverlayHeight={attachmentOverlayHeight}
      state={state}
      onStateChange={onStateChange}
      title="Ask"
      headerActions={
        messages.length ? (
          <Tooltip
            id={`${inputId}-new-conversation`}
            content="New conversation"
          >
            <IconButton
              type="button"
              aria-label="New conversation"
              variant="tertiary"
              size="small"
              rounded
              onClick={() => {
                reset();
                setDraft('');
                onAttachmentsChange?.([]);
                inputRef.current?.focus();
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M8 3v10M3 8h10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </IconButton>
          </Tooltip>
        ) : null
      }
      footer={
        <Composer
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            send();
          }}
        >
          {attachments.length ? (
            <div
              style={{
                position: 'absolute',
                bottom: 'calc(100% + var(--space-2))',
                left: 'var(--space-1)',
                right: 'var(--space-1)',
                zIndex: 1,
                maxHeight: 120,
                overflowY: 'auto',
                borderRadius: 'var(--border-radius-1)',
                background: 'var(--code-snippet-background)',
              }}
            >
              <AttachmentPills
                attachments={attachments}
                onRemoveAll={() => {
                  onAttachmentsChange?.([]);
                  inputRef.current?.focus();
                }}
                onRemove={(id) => {
                  onAttachmentsChange?.(
                    attachments.filter((attachment) => attachment.id !== id)
                  );
                  inputRef.current?.focus();
                }}
              />
            </div>
          ) : null}
          <ComposerInput
            ref={inputRef}
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
            id={`${inputId}-send`}
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
              onClick={status === 'loading' ? abort : undefined}
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
      <Content
        css={
          !messages.length
            ? { minHeight: '100%', display: 'flex', flexDirection: 'column' }
            : {
                // Keep the final line and activity indicator above the fade and floating pills.
                paddingBottom: `calc(${attachmentOverlayHeight} + var(--space-4))`,
              }
        }
      >
        {!messages.length ? (
          <EmptyState>
            <RGBLensIcon size={96} strokeWidth={0.6} animate />
            <Text as="p" size="1" variant="primary">
              Ask questions, find related articles, or simplify a concept.
            </Text>
          </EmptyState>
        ) : null}
        {messages.map((message) =>
          message.role === 'user' ? (
            <Text
              key={message.id}
              ref={message === messages.at(-2) ? latestQuestionRef : undefined}
              as="blockquote"
              size="1"
              variant="secondary"
            >
              <AttachmentPills attachments={message.attachments} inMessage />
              {message.content}
            </Text>
          ) : (
            <Fragment key={message.id}>
              <Answer text={message.content} onRender={onRender} />
              {message === messages.at(-1) && status === 'loading' ? (
                <Text
                  as="p"
                  size="1"
                  variant="tertiary"
                  role="status"
                  css={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                  }}
                >
                  {streamData ? 'Writing…' : 'Thinking…'}
                  {!streamData ? (
                    <span aria-hidden="true" style={{ display: 'inline-flex' }}>
                      <RGBLensIcon size={20} animate />
                    </span>
                  ) : null}
                </Text>
              ) : null}
              <div
                style={{
                  marginTop: 'var(--space-1)',
                  marginLeft: -6,
                  visibility:
                    message === messages.at(-1) &&
                    status === 'done' &&
                    message.content
                      ? 'visible'
                      : 'hidden',
                }}
              >
                <CopyToClipboardButton
                  text={message.content}
                  label="Copy answer as Markdown"
                />
              </div>
            </Fragment>
          )
        )}
        {error ? (
          <Text as="p" size="1" variant="danger" role="alert">
            {error.statusText}. Please try again.
          </Text>
        ) : null}
      </Content>
    </FloatingWindow>
  );
};
