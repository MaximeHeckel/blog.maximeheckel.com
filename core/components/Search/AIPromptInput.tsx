import { Box, Flex, Icon, Text } from '@maximeheckel/design-system';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Sparkles } from './Icons';
import * as S from './Search.styles';
import { Status } from './types';

const AIPromptInput = (props: { status: Status }) => {
  const { status } = props;
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <>
      <Flex css={{ width: 24, marginLeft: 16 }}>
        <Sparkles
          style={{
            color: 'var(--text-secondary)',
          }}
        />
      </Flex>
      <S.AIInput
        ref={inputRef}
        autoComplete="off"
        disabled={status === 'loading'}
        type="search"
        placeholder="Ask me anything about my blog posts, a topic, or my projects..."
        data-testid="ai-prompt-input"
        id="search-input"
        name="aisearch"
        onChange={(e) => setValue(e.target.value)}
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
    </>
  );
};

export default AIPromptInput;
