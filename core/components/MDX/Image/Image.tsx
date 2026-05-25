import { Dialog } from '@base-ui/react/dialog';
import {
  Box,
  CSS,
  Flex,
  Icon,
  IconButton,
  Text,
} from '@maximeheckel/design-system';
import { cloudflareLoader } from 'lib/next-image-loader';
import { motion, MotionConfig } from 'motion/react';
import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { memo, useId, useState } from 'react';
import { flushSync } from 'react-dom';

import { Backdrop, Popup, Trigger } from './Lightbox';

interface ImageProps extends NextImageProps {
  css?: CSS;
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => void;
};

const RootImage = memo((props: ImageProps) => {
  return (
    <Box
      as={NextImage}
      css={{
        width: '100%',
        height: 'auto',
        objectFit: 'cover',
      }}
      loader={cloudflareLoader}
      {...props}
      quality={100}
      sizes="(max-width: 768px) 120vw,
             75vw"
      priority={props.priority}
    />
  );
});

RootImage.displayName = 'Image';

const Image = (props: ImageProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const uniqueId = useId();
  const transitionName = `mdx-image-${uniqueId.replace(/[^a-zA-Z0-9-_]/g, '')}`;

  const handleDialogOpenChange = (open: boolean) => {
    if (open === isDialogOpen) {
      return;
    }

    const transitionDocument = document as ViewTransitionDocument;

    if (!transitionDocument.startViewTransition) {
      setIsDialogOpen(open);
      return;
    }

    transitionDocument.startViewTransition(() => {
      flushSync(() => {
        setIsDialogOpen(open);
      });
    });
  };

  const handleDialogTrigger = () => {
    handleDialogOpenChange(!isDialogOpen);
  };

  return (
    <MotionConfig
      transition={{
        duration: 0.3,
        ease: 'easeInOut',
      }}
    >
      <style>
        {`
          ::view-transition-group(${transitionName}) {
            animation-duration: 300ms;
            animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
          }
        `}
      </style>
      <Dialog.Root open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <Flex
          as="figure"
          direction="column"
          css={{ margin: '0', width: '100%' }}
          alignItems="start"
          gap="0"
        >
          <Trigger
            tabIndex={0}
            render={
              <motion.div
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                style={{ willChange: 'transform' }}
                role="button"
              >
                <RootImage
                  {...props}
                  style={{
                    border: '2px solid var(--border-color)',
                    borderRadius: 'var(--border-radius-3)',
                    viewTransitionName: isDialogOpen ? 'none' : transitionName,
                  }}
                />
              </motion.div>
            }
          />
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
        <Dialog.Portal>
          <Backdrop
            as={motion.div}
            initial={{ '--opacity': 0 }}
            animate={{ '--opacity': 0.8 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            key={`backdrop-${uniqueId}`}
          >
            <Popup
              key={`popup-${uniqueId}`}
              render={
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
                    transition={{
                      delay: 0.2,
                    }}
                  >
                    <IconButton
                      aria-label="Close"
                      variant="secondary"
                      onClick={handleDialogTrigger}
                      rounded
                    >
                      <Icon.X />
                    </IconButton>
                  </motion.div>
                  <motion.div
                    onClick={handleDialogTrigger}
                    autoFocus
                    role="button"
                    whileTap={{ scale: 0.98 }}
                    style={{
                      outline: 'none',
                      viewTransitionName: isDialogOpen ? transitionName : 'none',
                    }}
                  >
                    <RootImage
                      {...props}
                      css={{
                        objectFit: 'cover',
                        height: 'auto',
                        width: '80dvw',
                        borderRadius: 'var(--border-radius-3)',

                        '@media (max-width: 768px)': {
                          width: '97dvw',
                        },
                      }}
                    />
                  </motion.div>
                </Flex>
              }
            />
          </Backdrop>
        </Dialog.Portal>
      </Dialog.Root>
    </MotionConfig>
  );
};

export default Image;
