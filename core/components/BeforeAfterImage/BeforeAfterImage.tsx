import { Flex, GlassMaterial, Icon, Text } from '@maximeheckel/design-system';
import { cloudflareLoader } from 'lib/next-image-loader';
import { useMotionValue } from 'motion/react';
import { useState, useRef, useEffect } from 'react';

import * as S from './BeforeAfterImage.styles';
import { BeforeAfterImageProps } from './types';

const Slider = () => (
  <Flex
    alignItems="center"
    css={{
      position: 'absolute',
      pointerEvents: 'none',
      top: 0,
      bottom: 0,
      transform: 'translateX(-50%)',
      left: 'var(--progress)',
      zIndex: 1,
      '&::before': {
        content: '',
        position: 'absolute',
        left: '50%',
        bottom: 0,
        top: 0,
        width: 1,
        background: 'oklch(from var(--gray-900) l c h / var(--opacity, 0.6))',

        transform: 'translateX(-50%)',
      },
    }}
    id="slider-line"
  >
    <Flex
      css={{
        width: 32,
        height: 32,
        background: 'transparent',
        zIndex: 2,
        borderRadius: 'var(--border-radius-2)',
        gap: '1px',
        position: 'relative',
      }}
      justifyContent="center"
    >
      <GlassMaterial />
      <Icon.Arrow
        size="2"
        style={{ transform: 'rotate(180deg)' }}
        variant="primary"
      />
      <Icon.Arrow size="2" variant="primary" />
    </Flex>
  </Flex>
);

const BeforeAfterImage = (props: BeforeAfterImageProps) => {
  const { alt, defaultSliderPosition, beforeSrc, afterSrc, width, height } =
    props;
  const [sliderPosition, setSliderPosition] = useState(
    defaultSliderPosition || 50
  );
  const [isDragging, setIsDragging] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const wiggleMotion = useMotionValue(sliderPosition);

  const calculateSliderPosition = (clientX: number) => {
    const rect = wrapperRef.current!.getBoundingClientRect();
    const x = clientX - rect.left;
    const sliderPositionPercentage = (x / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(sliderPositionPercentage, 0), 100));
    wiggleMotion.set(sliderPositionPercentage);
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    setIsDragging(true);
    calculateSliderPosition(event.clientX);
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (event.touches.length === 1) {
      calculateSliderPosition(event.touches[0].clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragging) return;

    calculateSliderPosition(event.clientX);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        wiggleMotion.set(Math.max(0, sliderPosition - 5));
        break;
      case 'ArrowRight':
        wiggleMotion.set(Math.max(0, sliderPosition + 5));
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const unsubscribe = wiggleMotion.on('change', (value) => {
      if (value < 0) return;
      if (value > 100) return;
      setSliderPosition(value);
    });

    return () => {
      unsubscribe();
    };
  }, [wiggleMotion]);

  return (
    <figure>
      <Flex alignItems="start" direction="column" gap="1">
        <S.Wrapper
          ref={wrapperRef}
          tabIndex={0}
          role="slider"
          aria-label={alt}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={sliderPosition}
          onKeyDown={handleKeyDown}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          style={{
            // @ts-ignore
            '--progress': `${wiggleMotion.get()}%`,
          }}
        >
          <S.Image
            alt="Before"
            loading="eager"
            loader={cloudflareLoader}
            src={beforeSrc}
            quality={75}
            width={width}
            height={height}
          />
          <S.Overlay>
            <S.Image
              alt="After"
              loading="eager"
              loader={cloudflareLoader}
              quality={75}
              src={afterSrc}
              width={width}
              height={height}
            />
          </S.Overlay>
          <Slider />
        </S.Wrapper>
        <figcaption>
          <Text
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
        </figcaption>
      </Flex>
    </figure>
  );
};

export default BeforeAfterImage;
