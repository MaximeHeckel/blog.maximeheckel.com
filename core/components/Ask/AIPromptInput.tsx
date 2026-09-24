import { Box, Flex, Icon, Text } from '@maximeheckel/design-system';
import { AnimatePresence, motion } from 'motion/react';
import { memo, useEffect, useRef, useState } from 'react';

import * as S from './Ask.styles';
import { Status } from './types';

interface AIPromptInputProps {
  status: Status;
  onSubmit: (question: string) => void;
}

const AIPromptInput = (props: AIPromptInputProps) => {
  const { status, onSubmit } = props;
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!value.trim() || status === 'loading') return;
        onSubmit(value.trim());
        setValue('');
      }}
    >
      <S.AIInput
        css={{ paddingLeft: 'var(--space-3)' }}
        ref={inputRef}
        autoComplete="off"
        disabled={status === 'loading'}
        type="text"
        placeholder="Ask me anything about my blog posts, a topic, or my projects..."
        data-testid="ai-prompt-input"
        aria-label="Ask a question"
        id="ask-input"
        name="question"
        value={value}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          setValue(event.target.value)
        }
      />
      <Box css={{ width: 96 }}>
        <AnimatePresence>
          {value !== '' && status !== 'loading' ? (
            <Flex
              as={motion.button}
              css={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              data-testid="ai-prompt-submit-button"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{
                y: -10,
                opacity: 0,
                transition: {
                  opacity: { duration: 0.2 },
                  y: { duration: 0.2 },
                },
              }}
              gap="2"
              type="submit"
            >
              <Icon.Enter
                style={{ transform: 'scaleX(-1)' }}
                size="4"
                variant="secondary"
              />
              <Text as="span" size="1" weight="3" variant="secondary">
                Send
              </Text>
            </Flex>
          ) : null}
        </AnimatePresence>
      </Box>
    </form>
  );
};

export default memo(AIPromptInput);
