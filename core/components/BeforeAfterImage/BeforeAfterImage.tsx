import { Flex, GlassMaterial, Icon, Text } from '@maximeheckel/design-system';
import { cloudflareLoader } from 'lib/next-image-loader';
import {
  motion,
  MotionValue,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';
import { useState, useRef, useEffect, useId } from 'react';

import { glassBorderShine } from '../GlassBorder.styles';
import * as S from './BeforeAfterImage.styles';
import { BeforeAfterImageProps } from './types';

const MAX_LINE_PULL = 8;

interface SliderProps {
  progress: MotionValue<number>;
  pull: MotionValue<number>;
  clipId: string;
  width: number;
  height: number;
}

const Slider = ({ progress, pull, clipId, width, height }: SliderProps) => {
  const handlePosition = useTransform(progress, (value) => `${value}%`);
  const line = useTransform(() => {
    const center = (progress.get() / 100) * width;
    const displacement = Math.min(
      MAX_LINE_PULL,
      Math.max(-MAX_LINE_PULL, pull.get())
    );
    const edge = Math.min(width, Math.max(0, center - displacement));

    return `M ${edge} 0 C ${edge} ${height * 0.25} ${center} ${height * 0.25} ${center} ${height * 0.5} C ${center} ${height * 0.75} ${edge} ${height * 0.75} ${edge} ${height}`;
  });
  const clip = useTransform(
    line,
    (path) => `${path} L ${width} ${height} L ${width} 0 Z`
  );

  return (
    <>
      <S.Divider
        viewBox={`0 0 ${width || 1} ${height || 1}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <motion.path d={clip} />
          </clipPath>
        </defs>
        <motion.path
          d={line}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
        />
      </S.Divider>
      <Flex
        as={motion.div}
        alignItems="center"
        style={{ left: handlePosition }}
        css={{
          position: 'absolute',
          pointerEvents: 'none',
          top: 0,
          bottom: 0,
          transform: 'translateX(-50%)',
          zIndex: 1,
        }}
        id="slider-line"
      >
        <Flex
          css={{
            ...glassBorderShine,
            '--glass-border-base': 'oklch(from var(--gray-1100) l c h / 8%)',
            width: 32,
            height: 32,
            background: 'transparent',
            zIndex: 2,
            borderRadius: 'var(--border-radius-2)',
            position: 'relative',
            isolation: 'isolate',
          }}
          justifyContent="center"
        >
          <GlassMaterial border={false} />
          <Icon.ChevronUpDown
            size={4}
            style={{ transform: 'rotate(90deg)' }}
            variant="primary"
            aria-hidden="true"
            focusable="false"
          />
        </Flex>
      </Flex>
    </>
  );
};

const Labels = ({ position }: { position: number }) => {
  const labelsRef = useRef<HTMLDivElement>(null);
  const beforeRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({
    width: 0,
    beforeCenter: 0,
    afterCenter: 0,
    beforeFade: 1,
    afterFade: 1,
  });

  useEffect(() => {
    const labels = labelsRef.current!;
    const before = beforeRef.current!;
    const after = afterRef.current!;

    const measure = () => {
      const surface = labels.getBoundingClientRect();
      const beforeRect = before.getBoundingClientRect();
      const afterRect = after.getBoundingClientRect();

      setBounds({
        width: surface.width,
        beforeCenter: beforeRect.left - surface.left + beforeRect.width / 2,
        afterCenter: afterRect.left - surface.left + afterRect.width / 2,
        beforeFade: beforeRect.width / 2 + 16,
        afterFade: afterRect.width / 2 + 16,
      });
    };

    measure();

    const observer = new ResizeObserver(measure);
    [labels, before, after].forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const sliderX = (position / 100) * bounds.width;
  const clampOpacity = (value: number) => Math.min(1, Math.max(0, value));
  const beforeOpacity = bounds.width
    ? clampOpacity((sliderX - bounds.beforeCenter) / bounds.beforeFade)
    : 1;
  const afterOpacity = bounds.width
    ? clampOpacity((bounds.afterCenter - sliderX) / bounds.afterFade)
    : 1;

  return (
    <S.Labels ref={labelsRef} aria-hidden="true">
      <S.Label ref={beforeRef} side="before" style={{ opacity: beforeOpacity }}>
        <GlassMaterial />
        <Text size="1" variant="primary" weight="3">
          Before
        </Text>
      </S.Label>
      <S.Label ref={afterRef} side="after" style={{ opacity: afterOpacity }}>
        <GlassMaterial />
        <Text size="1" variant="primary" weight="3">
          After
        </Text>
      </S.Label>
    </S.Labels>
  );
};

const BeforeAfterImage = (props: BeforeAfterImageProps) => {
  const { alt, defaultSliderPosition, beforeSrc, afterSrc, width, height } =
    props;
  const [sliderPosition, setSliderPosition] = useState(
    defaultSliderPosition ?? 50
  );
  const surfaceRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    originX: number;
    x: number;
    time: number;
  } | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const clipId = useId();
  const reducedMotion = useReducedMotion();

  const wiggleMotion = useMotionValue(sliderPosition);
  const pullTarget = useMotionValue(0);
  const pull = useSpring(pullTarget, {
    stiffness: 380,
    damping: 20,
    mass: 0.45,
  });

  const calculateSliderPosition = (clientX: number) => {
    const rect = surfaceRef.current!.getBoundingClientRect();
    const x = Math.min(rect.width, Math.max(0, clientX - rect.left));
    const sliderPositionPercentage = (x / rect.width) * 100;
    setSliderPosition(sliderPositionPercentage);
    wiggleMotion.set(sliderPositionPercentage);

    return x;
  };

  const releasePull = () => {
    if (settleTimer.current !== null) clearTimeout(settleTimer.current);
    pullTarget.set(0);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0) return;

    releasePull();
    event.currentTarget.setPointerCapture(event.pointerId);
    const x = calculateSliderPosition(event.clientX);
    dragRef.current = {
      pointerId: event.pointerId,
      originX: x,
      x,
      time: event.timeStamp,
    };
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;

    dragRef.current = null;
    releasePull();
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const x = calculateSliderPosition(event.clientX);
    const elapsed = Math.max(8, event.timeStamp - drag.time);
    const velocity = (x - drag.x) / elapsed;
    const distance = Math.min(1, Math.abs(x - drag.originX) / 48);

    dragRef.current = { ...drag, x, time: event.timeStamp };
    if (reducedMotion) return;

    // A short, slow drag barely flexes; fast pulls saturate at eight pixels.
    pullTarget.set(MAX_LINE_PULL * Math.tanh(velocity / 1.2) * distance);

    if (settleTimer.current !== null) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => pullTarget.set(0), 80);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        wiggleMotion.set(Math.max(0, sliderPosition - 5));
        break;
      case 'ArrowRight':
        wiggleMotion.set(Math.min(100, sliderPosition + 5));
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const surface = surfaceRef.current!;
    const measure = () => {
      const { width, height } = surface.getBoundingClientRect();
      setSize({ width, height });
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(surface);

    return () => {
      observer.disconnect();
      if (settleTimer.current !== null) clearTimeout(settleTimer.current);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      pullTarget.set(0);
      pull.jump(0);
    }
  }, [reducedMotion, pull, pullTarget]);

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
          tabIndex={0}
          role="slider"
          aria-label={alt}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={sliderPosition}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerMove={handlePointerMove}
          onPointerCancel={handlePointerUp}
          onLostPointerCapture={handlePointerUp}
          style={{
            // @ts-ignore
            '--progress': `${wiggleMotion.get()}%`,
          }}
        >
          <S.Surface ref={surfaceRef}>
            <S.Image
              alt="Before"
              loading="eager"
              loader={cloudflareLoader}
              src={beforeSrc}
              quality={100}
              width={width}
              height={height}
            />
            <S.Overlay
              style={size.width ? { clipPath: `url(#${clipId})` } : undefined}
            >
              <S.Image
                alt="After"
                loading="eager"
                loader={cloudflareLoader}
                quality={100}
                src={afterSrc}
                width={width}
                height={height}
              />
            </S.Overlay>
            <Labels position={sliderPosition} />
            <Slider
              progress={wiggleMotion}
              pull={pull}
              clipId={clipId}
              {...size}
            />
          </S.Surface>
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
