import {
  Box,
  Flex,
  Icon,
  useKeyboardShortcut,
} from '@maximeheckel/design-system';
import { cloudflareLoader } from 'lib/next-image-loader';
import { AnimatePresence, motion, useInView } from 'motion/react';
import NextImage from 'next/image';
import React, { CSSProperties, useRef, useState } from 'react';

import * as S from './Slideshow.styles';

interface SlideshowProps {
  images: string[];
  width?: number;
  height?: number;
  alt?: string;
  aspectRatio?: CSSProperties['aspectRatio'];
}

const TranslucideButton = (props: React.ComponentPropsWithoutRef<'button'>) => {
  return (
    <Box
      css={{
        '--thickness': '1.5px',
        backgroundColor: 'oklch(from var(--gray-1000) l c h / 30%)',
        borderRadius: 'calc(var(--border-radius-3) + var(--thickness))',
        padding: 'var(--thickness)',
        overflow: 'hidden',
        backdropFilter: 'blur(2px)',
        width: 'max-content',
      }}
    >
      <Box
        as="button"
        css={{
          '--thickness': '1.5px',
          display: 'flex',
          height: 32,
          width: 32,
          backgroundColor: 'var(--gray-500)',
          borderRadius: 'calc(var(--border-radius-3) + var(--thickness))',
          padding: 'var(--thickness)',
          overflow: 'hidden',
          backdropFilter: 'blur(2px)',
          color: 'var(--gray-900)',
          zIndex: 1,
          boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
          border: 'none',
          cursor: 'pointer',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none',

          '& > svg': {
            transition: 'opacity 0.3s ease',
            opacity: 0.5,
          },

          '&:focus': {
            '& > svg': {
              opacity: 1,
            },
          },

          '&:hover': {
            '& > svg': {
              opacity: 1,
            },
          },
        }}
        {...props}
      >
        {props.children}
      </Box>
    </Box>
  );
};

export const Slideshow = ({
  images,
  width = 700,
  height = 400,
  alt = 'Image',
  aspectRatio = 16 / 9,
}: SlideshowProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [longTransition, setLongTransition] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(galleryRef);

  const next = () => {
    setCurrentIndex((prev) => {
      if (prev === images.length - 1) return prev;
      return prev + 1;
    });
  };

  const previous = () => {
    setCurrentIndex((prev) => {
      if (prev === 0) return prev;
      return prev - 1;
    });
  };

  useKeyboardShortcut('ArrowRight', () => {
    if (!isInView) return;

    next();
  });

  useKeyboardShortcut('ArrowLeft', () => {
    if (!isInView) return;

    previous();
  });

  const delay = (time: number) =>
    new Promise((resolve) => setTimeout(resolve, time));

  const handleIndicatorClick = async (index: number) => {
    const current = currentIndex;
    const diff = Math.abs(index - current);

    if (diff > 1) {
      setLongTransition(true);
    }

    for (let i = 0; i < diff; i++) {
      setCurrentIndex((prev) => prev + (index > prev ? 1 : -1));
      await delay(400);
    }

    setLongTransition(false);
  };

  const calculateTranslation = (index: number): number => {
    if (!galleryRef.current) return 0;

    const gapPercentage = ((16 * index) / galleryRef.current.offsetWidth) * 100;
    return -index * 100 - gapPercentage;
  };

  return (
    <Flex css={{ width: '100%' }} direction="column" gap="5">
      <S.GalleryContainer
        ref={galleryRef}
        style={{
          aspectRatio,
        }}
      >
        <S.ImageTrack
          as={motion.div}
          initial={{
            x: `0%`,
          }}
          animate={{
            x: `${calculateTranslation(currentIndex)}%`,
          }}
          transition={{
            duration: 0.4,
            ease: longTransition ? 'linear' : undefined,
          }}
        >
          {images.map((src, index) => (
            <S.ImageSlide
              tabIndex={index === currentIndex ? 0 : -1}
              key={index}
              data-current={index === currentIndex}
              onClick={() => handleIndicatorClick(index)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <NextImage
                loader={cloudflareLoader}
                src={src}
                alt={alt}
                width={width}
                height={height}
                style={{
                  aspectRatio,
                  height: 'auto',
                }}
              />
            </S.ImageSlide>
          ))}
        </S.ImageTrack>
      </S.GalleryContainer>

      <Flex alignItems="center" gap="4">
        <AnimatePresence>
          {currentIndex > 0 && (
            <motion.div
              key="previous"
              initial={{ opacity: 0, x: 20, scale: 0.77 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.77 }}
              layout
              transition={{
                duration: 0.3,
                ease: 'easeInOut',
              }}
            >
              <TranslucideButton onClick={previous}>
                <Icon.Arrow size="5" style={{ transform: 'rotate(180deg)' }} />
              </TranslucideButton>
            </motion.div>
          )}
          <motion.div key="indicator" layout>
            <S.IndicatorWrapper>
              <S.IndicatorContainer>
                {images.map((_, index) => (
                  <S.Indicator
                    key={index}
                    active={index === currentIndex}
                    onClick={() => handleIndicatorClick(index)}
                  />
                ))}
              </S.IndicatorContainer>
            </S.IndicatorWrapper>
          </motion.div>
          {currentIndex < images.length - 1 && (
            <motion.div
              key="next"
              initial={{ opacity: 0, x: -20, scale: 0.77 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.77 }}
              layout
              transition={{
                duration: 0.3,
                ease: 'easeInOut',
              }}
            >
              <TranslucideButton onClick={next}>
                <Icon.Arrow size="5" />
              </TranslucideButton>
            </motion.div>
          )}
        </AnimatePresence>
      </Flex>
    </Flex>
  );
};
