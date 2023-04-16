import { Box, Flex, Icon, Text } from '@maximeheckel/design-system';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { Sparkles } from './Icons';
import { AIInput } from './Styles';

const AIPromptInput = (props: any) => {
  const { status } = props;
  const [AIQuery, setAIQuery] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <>
      <Flex css={{ width: 24, marginLeft: 16 }}>
        <Sparkles
          style={{
            color: 'var(--maximeheckel-colors-typeface-secondary)',
          }}
        />
      </Flex>
      <AIInput
        ref={inputRef}
        autoComplete="off"
        disabled={status === 'loading'}
        type="search"
        placeholder="Ask me anything about my blog posts, a topic, or my projects..."
        data-testid="search-input"
        id="search-input"
        name="aisearch"
        onChange={(e) => setAIQuery(e.target.value)}
      />
      <Box css={{ width: 96 }}>
        <AnimatePresence>
          {AIQuery !== '' && status !== 'loading' ? (
            <Flex
              as={motion.button}
              css={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
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
              <Text
                as="span"
                css={{ marginBottom: 0 }}
                size="1"
                weight="3"
                variant="secondary"
              >
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
