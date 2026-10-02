import { Icon, IconButton, Tooltip } from '@maximeheckel/design-system';
import { useId } from 'react';

import { useOptionalAsk } from './AskContext';

interface SendToAskButtonProps {
  code: string;
  language: string;
  title?: string;
}

export const SendToAskButton = ({
  code,
  language,
  title,
}: SendToAskButtonProps) => {
  const openAsk = useOptionalAsk();
  const id = useId();
  if (!openAsk || !code?.trim()) return null;

  return (
    <Tooltip id={id} content="Send to Ask">
      <IconButton
        type="button"
        variant="tertiary"
        rounded
        size="small"
        aria-label="Send to Ask"
        css={{ position: 'relative', zIndex: 3 }}
        onClick={() =>
          openAsk({
            id: `${window.location.pathname}:${id}`,
            kind: 'code',
            code,
            language,
            title,
            sourceUrl: window.location.href,
          })
        }
      >
        <Icon.Arrow size="4" style={{ transform: 'rotate(-45deg)' }} />
      </IconButton>
    </Tooltip>
  );
};
