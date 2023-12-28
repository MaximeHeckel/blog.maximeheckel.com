import { Flex, Icon, Text } from '@maximeheckel/design-system';
import { useMotionValue, animate } from 'framer-motion';
import { useState, useRef, useCallback, useEffect } from 'react';
import { BeforeAfterImageProps } from './types';
import * as S from './BeforeAfterImage.styles';
import { loader } from 'lib/next-image-loader';

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
        width: 3,
        background: 'var(--foreground)',
        transform: 'translateX(-50%)',
      },
    }}
    id="slider-line"
  >
    <Flex
      css={{
        width: 48,
        height: 48,
        background: 'var(--foreground)',
        backdropFilter: 'blur(8px)',
        zIndex: 2,
        borderRadius: 'var(--border-radius-2)',
        border: '3px solid var(--border-color)',
      }}
      justifyContent="center"
    >
      <Icon.Arrow
        size="4"
        style={{ transform: 'rotate(180deg)' }}
        variant="tertiary"
      />
      <Icon.Arrow size="4" variant="tertiary" />
    </Flex>
  </Flex>
);

const BeforeAfterImage = (props: BeforeAfterImageProps) => {
  const {
    alt,
    defaultSliderPosition,
    beforeSrc,
    afterSrc,
    width,
    height,
  } = props;
  const [sliderPosition, setSliderPosition] = useState(
    defaultSliderPosition || 50
  );
  const [isDragging, setIsDragging] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const wiggleMotion = useMotionValue(sliderPosition);
  let hoverTimer = null as NodeJS.Timer | null;

  const calculateSliderPosition = (clientX: number) => {
    if (hoverTimer) clearTimeout(hoverTimer);
    const rect = wrapperRef.current!.getBoundingClientRect();
    const x = clientX - rect.left;
    const sliderPositionPercentage = (x / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(sliderPositionPercentage, 0), 100));
    wiggleMotion.set(sliderPositionPercentage);
  };

  const initiateWiggle = useCallback(() => {
    animate(
      wiggleMotion,
      [
        sliderPosition,
        sliderPosition - 1.5,
        sliderPosition + 1.5,
        sliderPosition - 1.5,
        sliderPosition + 1.5,
        sliderPosition,
      ],
      {
        type: 'spring',
      }
    );
  }, [sliderPosition, wiggleMotion]);

  const handleMouseDown = (event: React.MouseEvent) => {
    if (hoverTimer) clearTimeout(hoverTimer);
    setIsDragging(true);
    calculateSliderPosition(event.clientX);
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (event.touches.length === 1) {
      calculateSliderPosition(event.touches[0].clientX);
    }
  };

  const handleMouseUp = () => {
    if (hoverTimer) clearTimeout(hoverTimer);
    setIsDragging(false);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragging) return;
    if (hoverTimer) clearTimeout(hoverTimer);
    calculateSliderPosition(event.clientX);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (hoverTimer) clearTimeout(hoverTimer);
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

  const handleMouseEnter = () => {
    hoverTimer = setTimeout(initiateWiggle, 1200);
  };

  const handleMouseLeave = () => {
    if (hoverTimer) clearTimeout(hoverTimer);
    handleMouseUp();
  };

  useEffect(() => {
    const unsubscribe = wiggleMotion.onChange((value) => {
      if (value < 0) return;
      if (value > 100) return;
      setSliderPosition(value);
    });

    return () => {
      if (hoverTimer) clearTimeout(hoverTimer);
      unsubscribe();
    };
  }, [hoverTimer, wiggleMotion]);

  return (
    <Flex as="figure" alignItems="start" direction="column" gap="1">
      <S.Wrapper
        ref={wrapperRef}
        tabIndex={0}
        role="slider"
        aria-label={alt}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={sliderPosition}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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
          loader={loader}
          src={beforeSrc}
          quality={75}
          width={width}
          height={height}
        />
        <S.Overlay>
          <S.Image
            alt="After"
            loading="eager"
            loader={loader}
            quality={75}
            src={afterSrc}
            width={width}
            height={height}
          />
        </S.Overlay>
        <Slider />
      </S.Wrapper>
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
  );
};

export default BeforeAfterImage;
