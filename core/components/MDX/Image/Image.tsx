import {
  Box,
  Button,
  CSS,
  Flex,
  Icon,
  Text,
} from '@maximeheckel/design-system';
import * as Dialog from '@radix-ui/react-dialog';
import { cloudflareLoader } from 'lib/next-image-loader';
import { motion, MotionConfig } from 'motion/react';
import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { memo, useId, useState } from 'react';

import { Content, Overlay, Trigger } from './Lightbox';

interface ImageProps extends NextImageProps {
  css?: CSS;
}

const RootImage = memo((props: ImageProps) => {
  return (
    <Box
      as={NextImage}
      css={{
        width: '100%',
        height: 'auto',
        objectFit: 'cover',
        border: '2px solid var(--border-color)',
      }}
      loader={cloudflareLoader}
      {...props}
      quality={100}
      sizes="(max-width: 768px) 120vw,
             75vw"
      priority={props.priority}
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
              whileHover={{ scale: 1.02 }}
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
            <Overlay key={`overlay-${uniqueId}`}>
              <Box
                as={motion.div}
                css={{
                  backdropFilter: 'blur(10px)',
                  height: '100%',
                  width: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.3,
                }}
              />
              <Content
                asChild
                key={`content-${uniqueId}`}
                onInteractOutside={handleDialogTrigger}
                onFocusOutside={handleDialogTrigger}
                onEscapeKeyDown={handleDialogTrigger}
              >
                <Flex
                  alignItems="center"
                  justifyContent="center"
                  as={motion.div}
                  direction="column"
                  gap="4"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      delay: 0.2,
                    }}
                  >
                    <Button
                      aria-label="Close"
                      variant="icon"
                      onClick={handleDialogTrigger}
                      icon={<Icon.X />}
                    />
                  </motion.div>
                  <motion.div
                    layoutId={`dialog-${uniqueId}`}
                    onClick={handleDialogTrigger}
                    autoFocus
                    role="button"
                    whileTap={{ scale: 0.98 }}
                    style={{ outline: 'none' }}
                  >
                    <RootImage
                      {...props}
                      css={{
                        objectFit: 'cover',
                        height: 'auto',
                        width: '80dvw',

                        '@media (max-width: 768px)': {
                          width: '97dvw',
                        },
                      }}
                    />
                  </motion.div>
                </Flex>
              </Content>
            </Overlay>
          </Dialog.Portal>
        ) : null}
      </Dialog.Root>
    </MotionConfig>
  );
};

export default Image;
