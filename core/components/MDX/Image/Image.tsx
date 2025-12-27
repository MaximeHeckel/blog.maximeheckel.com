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

import { Backdrop, Popup, Trigger } from './Lightbox';

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
      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Flex
          as="figure"
          direction="column"
          css={{ margin: '0', width: '100%' }}
          alignItems="start"
        >
          <Trigger
            tabIndex={0}
            render={
              <motion.div
                layoutId={`dialog-${uniqueId}`}
                onClick={handleDialogTrigger}
                onKeyDown={handlePressEnter}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                transition={{
                  layout: {
                    type: 'spring',
                    bounce: 0.4,
                  },
                }}
                role="button"
              >
                <RootImage {...props} />
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
        {isDialogOpen ? (
          <Dialog.Portal key={`portal-${uniqueId}`}>
            <Backdrop key={`backdrop-${uniqueId}`}>
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
                      exit={{ opacity: 0 }}
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
                      layoutId={`dialog-${uniqueId}`}
                      onClick={handleDialogTrigger}
                      autoFocus
                      role="button"
                      whileTap={{ scale: 0.98 }}
                      style={{ outline: 'none' }}
                      transition={{
                        layout: {
                          type: 'spring',
                          bounce: 0.4,
                        },
                      }}
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
                }
              />
            </Backdrop>
          </Dialog.Portal>
        ) : null}
      </Dialog.Root>
    </MotionConfig>
  );
};

export default Image;
