import { Icon, IconButton, styled } from '@maximeheckel/design-system';
import type { AskAttachment } from 'lib/askAttachments';
import { Highlight } from 'prism-react-renderer';

import { createDiffHighlighter } from '../Code/diff';
import { syntaxTheme, syntaxTokenStyles } from '../Code/syntaxTheme';

const Pill = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-2)',
  minWidth: 0,
  boxSizing: 'border-box',
  border: '1px solid oklch(from var(--text-primary) l c h / 5%)',
  borderRadius: 'var(--border-radius-1)',
  background: 'var(--code-snippet-background)',
  padding: '0 var(--space-2)',
  height: 'var(--space-6)',
  color: 'var(--text-secondary)',
  '> svg': { flexShrink: 0 },
});

const Preview = styled('span', {
  ...syntaxTheme,
  ...syntaxTokenStyles,
  minWidth: 0,
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  fontSize: '13px',
  '& code': { fontFamily: 'var(--font-mono-code)', color: 'var(--token-text)' },
});

const RemoveButton = styled(IconButton, {
  flexShrink: 0,
  width: 22,
  height: 22,
  maxWidth: 22,
  maxHeight: 22,
  padding: 0,
  borderRadius: '50%',
});

const attachmentLabels: Record<AskAttachment['kind'], [string, string]> = {
  code: ['code snippet', 'code snippets'],
  selection: ['highlight', 'highlights'],
};

const listFormatter = new Intl.ListFormat('en', { type: 'conjunction' });

interface AttachmentPillsProps {
  attachments: AskAttachment[];
  inMessage?: boolean;
  onRemove?: (id: string) => void;
  onRemoveAll?: () => void;
}

export const AttachmentPills = ({
  attachments,
  inMessage = false,
  onRemove,
  onRemoveAll,
}: AttachmentPillsProps) => {
  if (!attachments.length) return null;
  const collapsed = attachments.length > 2;
  const summary = collapsed
    ? listFormatter.format(
        Object.entries(attachmentLabels).flatMap(([kind, labels]) => {
          const count = attachments.filter((item) => item.kind === kind).length;
          return count ? [`${count} ${labels[count === 1 ? 0 : 1]}`] : [];
        })
      )
    : '';
  return (
    <div
      aria-label="Attached context"
      style={{
        display: 'grid',
        gap: 'var(--space-1)',
        minWidth: 0,
        // Leave a 4px inset within the bubble, with the icon aligned to its text.
        margin: inMessage
          ? 'calc(-1 * var(--space-1)) calc(-1 * var(--space-2)) var(--space-1)'
          : undefined,
      }}
    >
      {collapsed ? (
        <Pill
          css={onRemoveAll ? { paddingRight: 'var(--space-1)' } : undefined}
        >
          {attachments.some((attachment) => attachment.kind === 'code') ? (
            <Icon.Code size="3" />
          ) : (
            <span aria-hidden="true">“</span>
          )}
          <Preview title={summary} css={{ color: 'var(--text-primary)' }}>
            {summary}
          </Preview>
          {onRemoveAll ? (
            <RemoveButton
              type="button"
              variant="tertiary"
              size="small"
              aria-label="Remove all attachments"
              onClick={onRemoveAll}
            >
              <span aria-hidden="true">×</span>
            </RemoveButton>
          ) : null}
        </Pill>
      ) : (
        attachments.map((attachment) => (
          <Pill
            key={attachment.id}
            css={onRemove ? { paddingRight: 'var(--space-1)' } : undefined}
          >
            {attachment.kind === 'code' ? (
              <Icon.Code size="3" />
            ) : (
              <span aria-hidden="true">“</span>
            )}
            <Preview
              title={
                attachment.title ??
                (attachment.kind === 'code'
                  ? attachment.language
                  : 'Selected passage')
              }
            >
              {attachment.kind === 'code' ? (
                <Highlight
                  prism={createDiffHighlighter(attachment.language).prism}
                  theme={{ plain: {}, styles: [] }}
                  code={attachment.code.trim().split(/\r\n|\r|\n/, 1)[0]}
                  language={attachment.language}
                >
                  {({ tokens, getTokenProps }) => (
                    <code>
                      {tokens[0]?.map((token, index) => {
                        const { key: _key, ...props } = getTokenProps({
                          token,
                        });
                        return (
                          <span
                            key={index}
                            {...props}
                            data-arrow={
                              (token.types.includes('operator') &&
                                token.content === '=>') ||
                              undefined
                            }
                          />
                        );
                      })}
                      {/\r|\n/.test(attachment.code.trim()) ? ' …' : null}
                    </code>
                  )}
                </Highlight>
              ) : (
                attachment.text.replace(/\s+/g, ' ').trim()
              )}
            </Preview>
            {onRemove ? (
              <RemoveButton
                type="button"
                variant="tertiary"
                size="small"
                aria-label={`Remove ${attachment.title || (attachment.kind === 'code' ? 'code attachment' : 'selected passage')}`}
                onClick={() => onRemove(attachment.id)}
              >
                <span aria-hidden="true">×</span>
              </RemoveButton>
            ) : null}
          </Pill>
        ))
      )}
    </div>
  );
};
