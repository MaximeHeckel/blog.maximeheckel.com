import { Dialog } from '@base-ui/react/dialog';
import { Flex } from '@maximeheckel/design-system';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useRef } from 'react';

import { CustomGlassMaterial } from '../DialogGlass';
import { ScreenReaderOnly } from '../ScreenReaderOnly';
import AIPromptInput from './AIPromptInput';
import AIPromptResultCard from './AIPromptResultCard';
import * as S from './Ask.styles';
import { useAICompletion } from './useAICompletion';

interface Props {
  open?: boolean;
  onClose: () => void;
}

const Ask = (props: Props) => {
  const { onClose, open } = props;

  const resultCardRef = useRef<HTMLDivElement>(null);

  const {
    status,
    query: aiQuery,
    streamData,
    sources,
    error,
    submitQuery,
    reset: resetAI,
  } = useAICompletion();

  const onCloseHandler = useCallback(() => {
    resetAI();
    onClose();
  }, [onClose, resetAI]);

  const getStatusAnnouncement = () => {
    if (status === 'loading') {
      return 'Generating AI response...';
    }
    if (error) {
      return `Error: ${error.statusText}`;
    }
    return '';
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onCloseHandler();
        }
      }}
    >
      <Dialog.Portal>
        <S.Backdrop data-testid="ask-overlay" />
        <S.Popup aria-label="AI Assistant">
          <Dialog.Title render={<ScreenReaderOnly />}>
            AI Assistant
          </Dialog.Title>
          <Dialog.Description render={<ScreenReaderOnly />}>
            Ask AI questions about the blog
          </Dialog.Description>

          <ScreenReaderOnly aria-live="polite" aria-atomic="true">
            {getStatusAnnouncement()}
          </ScreenReaderOnly>

          <Flex
            css={{
              position: 'relative',
              flexDirection: 'column',
              '@media (max-width: 700px)': {
                flexDirection: 'column-reverse',
              },
            }}
            direction="column"
            gap="4"
          >
            <AnimatePresence>
              <AIPromptResultCard
                error={error}
                onQuestionSelect={submitQuery}
                query={aiQuery}
                ref={resultCardRef}
                sources={sources}
                status={status}
                streamData={streamData}
              />
            </AnimatePresence>
            <S.PromptBox
              id="ask-box"
              as={motion.div}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                ease: 'easeOut',
                duration: 0.2,
              }}
            >
              <S.FormWrapper
                data-testid="ask"
                style={{
                  borderBottomLeftRadius: 'var(--border-radius-2)',
                  borderBottomRightRadius: 'var(--border-radius-2)',
                  transition: 'all 0.2s ease-in-out',
                  transform: `scale(${status === 'loading' ? 0.95 : 1})`,
                  opacity: status === 'loading' ? 0.8 : 1,
                }}
              >
                <CustomGlassMaterial />
                <AIPromptInput status={status} onSubmit={submitQuery} />
              </S.FormWrapper>
            </S.PromptBox>
          </Flex>
        </S.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export { Ask };
