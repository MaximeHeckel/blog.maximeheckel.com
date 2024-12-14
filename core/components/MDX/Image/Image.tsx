import { Box, Flex, Text } from '@maximeheckel/design-system';
import * as Dialog from '@radix-ui/react-dialog';
import { loader } from 'lib/next-image-loader';
import { motion, MotionConfig } from 'motion/react';
import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { memo, useId, useState } from 'react';

import { Content, Overlay, Trigger } from './Lightbox';

interface ImageProps extends NextImageProps {}

const RootImage = memo((props: ImageProps) => {
  return (
    <Box
      as={NextImage}
      css={{
        width: '100%',
        height: 'auto',
        objectFit: 'cover',
      }}
      loader={loader}
      {...props}
      quality={90}
      sizes="100vw"
      style={{
        borderRadius: 'var(--border-radius-3)',
      }}
    />
  );
});

RootImage.displayName = 'Image';

const Image = (props: ImageProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const uniqueId = useId();

  const handleDialogTrigger = () => {
    setIsDialogOpen((prev) => !prev);
  };

  const handlePressEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleDialogTrigger();
    }
  };

  return (
    <MotionConfig
      transition={{
        duration: 0.3,
        ease: 'easeInOut',
      }}
    >
      <Dialog.Root open={isDialogOpen}>
        <Flex
          as="figure"
          direction="column"
          css={{ margin: '0', width: '100%' }}
          alignItems="start"
        >
          <Trigger asChild tabIndex={0}>
            <motion.div
              layoutId={`dialog-${uniqueId}`}
              onClick={handleDialogTrigger}
              onKeyDown={handlePressEnter}
              whileTap={{ scale: 0.95 }}
              role="button"
            >
              <RootImage {...props} />
            </motion.div>
          </Trigger>
          <Text
            as="figcaption"
            css={{
              lineHeight: '1.5',
              paddingTop: '10px',
            }}
            size="1"
            variant="tertiary"
            weight="3"
          >
            {props.alt}
          </Text>
        </Flex>
        {isDialogOpen ? (
          <Dialog.Portal key={`portal-${uniqueId}`}>
            <Overlay asChild key={`overlay-${uniqueId}`}>
              <motion.div
                initial={{ background: 'rgba(0, 0, 0, 0)' }}
                animate={{
                  background: 'rgba(0, 0, 0, 0.8)',
                }}
                exit={{ background: 'rgba(0, 0, 0, 0)' }}
              >
                <Content
                  asChild
                  key={`content-${uniqueId}`}
                  onInteractOutside={handleDialogTrigger}
                  onFocusOutside={handleDialogTrigger}
                  onEscapeKeyDown={handleDialogTrigger}
                >
                  <motion.div>
                    <motion.div
                      layoutId={`dialog-${uniqueId}`}
                      onClick={handleDialogTrigger}
                      role="button"
                      whileTap={{ scale: 0.98 }}
                      style={{ outline: 'none' }}
                    >
                      <RootImage {...props} />
                    </motion.div>
                  </motion.div>
                </Content>
              </motion.div>
            </Overlay>
          </Dialog.Portal>
        ) : null}
      </Dialog.Root>
    </MotionConfig>
  );
};

export default Image;
