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
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { memo, useId, useRef, useState } from 'react';

import { Backdrop, ImageFrame, Popup, Trigger } from './Lightbox';

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

const MotionImageFrame = motion.create(ImageFrame);

const Image = (props: ImageProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const dialogActionsRef = useRef<Dialog.Root.Actions>(null!);

  const uniqueId = useId();
  const layoutId = `mdx-image-${uniqueId.replace(/[^a-zA-Z0-9-_]/g, '')}`;

  const staticImage =
    typeof props.src === 'object'
      ? 'default' in props.src
        ? props.src.default
        : props.src
      : undefined;

  const imageWidth = Number(props.width ?? staticImage?.width);
  const imageHeight = Number(props.height ?? staticImage?.height);

  const imageAspectRatio =
    Number.isFinite(imageWidth) &&
    Number.isFinite(imageHeight) &&
    imageWidth > 0 &&
    imageHeight > 0
      ? imageWidth / imageHeight
      : undefined;

  const expandedFrameWidth = imageAspectRatio
    ? `min(80dvw, calc(80dvh * ${imageAspectRatio}))`
    : '80dvw';

  const framedImageCSS: CSS = {
    width: '100%',
    height: imageAspectRatio ? '100%' : 'auto',
    objectFit: 'cover',
  };

  const handleDialogOpenChange = (
    open: boolean,
    eventDetails: Dialog.Root.ChangeEventDetails
  ) => {
    if (open === isDialogOpen) {
      return;
    }

    if (!open) {
      eventDetails.preventUnmountOnClose();
    }

    setIsDialogOpen(open);
  };

  const handleDialogClose = () => {
    dialogActionsRef.current?.close();
  };

  const handleDialogExitComplete = () => {
    dialogActionsRef.current?.unmount();
  };

  return (
    <MotionConfig
      transition={{
        duration: 0.3,
        ease: 'easeInOut',
      }}
    >
      <Dialog.Root
        actionsRef={dialogActionsRef}
        open={isDialogOpen}
        onOpenChange={handleDialogOpenChange}
      >
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
              <div role="button">
                <MotionImageFrame
                  css={{ width: '100%' }}
                  layoutId={layoutId}
                  style={{
                    aspectRatio: imageAspectRatio,
                    borderRadius: 'var(--border-radius-3)',
                  }}
                  transition={{
                    layout: {
                      type: 'spring',
                      visualDuration: 0.15,
                      bounce: 0.1,
                    },
                  }}
                >
                  <RootImage {...props} css={framedImageCSS} />
                </MotionImageFrame>
              </div>
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
            key={`backdrop-${uniqueId}`}
            render={<motion.div layoutRoot />}
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
                  <AnimatePresence onExitComplete={handleDialogExitComplete}>
                    {isDialogOpen ? (
                      <motion.div
                        key="close-button"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{
                          opacity: 0,
                          transition: {
                            delay: 0,
                            duration: 0.15,
                            ease: 'easeOut',
                          },
                        }}
                        transition={{
                          delay: 0.04,
                          duration: 0.1,
                        }}
                        style={{
                          position: 'fixed',
                          top: 'var(--space-4)',
                          right: 'var(--space-4)',
                        }}
                      >
                        <IconButton
                          aria-label="Close"
                          variant="secondary"
                          onClick={handleDialogClose}
                          rounded
                        >
                          <Icon.X />
                        </IconButton>
                      </motion.div>
                    ) : null}
                    {isDialogOpen ? (
                      <MotionImageFrame
                        key="expanded-image"
                        autoFocus
                        css={{
                          width: expandedFrameWidth,

                          '@media (max-width: 768px)': {
                            width: imageAspectRatio
                              ? `min(97dvw, calc(80dvh * ${imageAspectRatio}))`
                              : '97dvw',
                          },
                        }}
                        layoutId={layoutId}
                        onClick={handleDialogClose}
                        role="button"
                        style={{
                          aspectRatio: imageAspectRatio,
                          borderRadius: 'var(--border-radius-3)',
                          outline: 'none',
                        }}
                        transition={{
                          layout: {
                            type: 'spring',
                            visualDuration: 0.3,
                            bounce: 0.2,
                          },
                        }}
                      >
                        <RootImage {...props} css={framedImageCSS} />
                      </MotionImageFrame>
                    ) : null}
                  </AnimatePresence>
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
