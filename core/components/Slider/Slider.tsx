import { Box, GlassMaterial, Text } from '@maximeheckel/design-system';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';
import { useCallback, useEffect, useId, useMemo, useRef } from 'react';

import {
  Control,
  Indicator,
  SliderLabel,
  SliderRoot,
  SliderStepsDots,
  Thumb,
  Track,
} from './Slider.styles';
import { SliderProps } from './types';

const Slider = (props: SliderProps) => {
  const {
    id,
    min,
    max,
    step = 1,
    onChange,
    value,
    defaultValue,
    disabled,
    label,
    size = 'md',
  } = props;

  const shouldReduceMotion = useReducedMotion();
  const generatedId = useId();
  const sliderId = id || generatedId;

  const MAX_VALUE = max;
  const MIN_VALUE = min;
  const STEP_SIZE = step;
  const MAX_STEPS_COUNT = 25;

  const startPositionRef = useRef(0);
  const isPointerDownRef = useRef(false);
  const sliderElementRef = useRef<HTMLDivElement>(null);
  const continuousValueRef = useRef(50);
  const rangeElementRef = useRef<HTMLDivElement>(null);
  const isFirstRenderRef = useRef(true);

  const leftLabelRef = useRef<HTMLSpanElement>(null);
  const rightLabelRef = useRef<HTMLSpanElement>(null);

  const labelBoundsRef = useRef<{
    left: DOMRect | null;
    right: DOMRect | null;
  }>({
    left: null,
    right: null,
  });

  // Motion values for transforms
  const scaleX = useMotionValue(1);
  const scaleY = useMotionValue(1);
  const translateX = useMotionValue(0);
  const transformOrigin = useMotionValue('left center');

  const rangeScaleX = useMotionValue(1);

  const rangeRight = useMotionValue(0);

  const springScaleX = useSpring(scaleX, {
    stiffness: 700,
    damping: 20,
    mass: 1.2,
  });
  const springScaleY = useSpring(scaleY, {
    stiffness: 700,
    damping: 20,
    mass: 1.2,
  });
  const springTranslateX = useSpring(translateX, {
    stiffness: 700,
    damping: 20,
    mass: 1.2,
  });
  const springRangeScaleX = useSpring(rangeScaleX, {
    stiffness: 500,
    damping: 40,
    mass: 0.5,
  });

  const springRangeRight = useSpring(rangeRight, {
    stiffness: 300,
    damping: 20,
    mass: 0.5,
  });

  const springRangeRightPercent = useTransform(
    springRangeRight,
    (v) => `${v}%`
  );

  const rangeRightPercent = useTransform(rangeRight, (v) => `${v}%`);

  const handlePointerDown = (e: React.PointerEvent) => {
    startPositionRef.current = e.clientX;
    isPointerDownRef.current = true;
  };

  const shouldRenderStepsDots = useMemo(() => {
    return (
      MAX_STEPS_COUNT >= Math.floor((MAX_VALUE - MIN_VALUE) / STEP_SIZE) + 1
    );
  }, [MAX_STEPS_COUNT, MAX_VALUE, MIN_VALUE, STEP_SIZE]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPointerDownRef.current || !sliderElementRef.current) return;
      const delta = e.clientX - startPositionRef.current;

      if (shouldRenderStepsDots) {
        // Calculate continuous value based on pointer position
        const rect = sliderElementRef.current.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
        const continuousValue = percentage * 100;
        continuousValueRef.current = continuousValue;

        // Get the actual current position from the DOM (the stepped position)
        if (rangeElementRef.current) {
          const rangeRect = rangeElementRef.current.getBoundingClientRect();
          const containerRect =
            sliderElementRef.current.getBoundingClientRect();

          // Calculate the stepped position as a percentage
          const steppedPosition = (rangeRect.width / containerRect.width) * 100;

          // Define a constant target stretch in pixels (not percentage!)
          const TARGET_STRETCH_PX = 8; // Always try to stretch by ~8 pixels

          // Current width in pixels
          const currentWidthPx = rangeRect.width;

          // Convert pixel stretch to scale factor
          // scale = (currentWidth + targetStretch) / currentWidth
          // To avoid division by zero, use a minimum width
          const effectiveWidth = Math.max(currentWidthPx, 16); // Use minWidth as fallback
          const stretchAmount = Math.min(
            TARGET_STRETCH_PX / effectiveWidth,
            0.5
          );

          // Apply stretch based on direction
          if (
            continuousValue <= 100 &&
            continuousValue > steppedPosition &&
            delta > 0
          ) {
            rangeScaleX.set(1 + stretchAmount);
          } else if (
            continuousValue >= 0 &&
            continuousValue < steppedPosition &&
            delta < 0
          ) {
            rangeScaleX.set(1 - stretchAmount);
          } else {
            rangeScaleX.set(1);
          }
        }
      }

      // For overdrag, also calculate from DOM position instead of value
      if (rangeElementRef.current && sliderElementRef.current) {
        const rangeRect = rangeElementRef.current.getBoundingClientRect();
        const containerRect = sliderElementRef.current.getBoundingClientRect();
        const currentPercentage = (rangeRect.width / containerRect.width) * 100;

        let overdrag = 0;
        // At max: range width should be ~100% of container
        if (currentPercentage >= 99.9 && delta > 0) {
          overdrag = Math.min(delta * 0.1, 50);
        }
        // At min: range width should be ~0% of container
        else if (currentPercentage <= 0.5 && delta < 0) {
          overdrag = Math.max(delta * 0.1, -50);
        }

        if (overdrag !== 0) {
          const progress = Math.abs(overdrag) / 50;
          const newScaleX = 1 + progress * 0.02;
          const newScaleY = 1 - progress * 0.03;
          const newTranslateX =
            overdrag > 0
              ? Math.min(progress * 3, 2)
              : Math.max(progress * -2, -2);

          scaleX.set(newScaleX);
          scaleY.set(newScaleY);
          translateX.set(newTranslateX);
          transformOrigin.set(overdrag > 0 ? 'left center' : 'right center');
        } else {
          scaleX.set(1);
          scaleY.set(1);
          translateX.set(0);
          transformOrigin.set('left center');
        }
      }
    },
    [
      shouldRenderStepsDots,
      rangeScaleX,
      scaleX,
      scaleY,
      translateX,
      transformOrigin,
    ]
  );

  const handlePointerUp = () => {
    scaleX.set(1);
    scaleY.set(1);
    translateX.set(0);
    rangeScaleX.set(1);
    isPointerDownRef.current = false;
  };

  useEffect(() => {
    const calculateBounds = () => {
      if (
        leftLabelRef.current &&
        rightLabelRef.current &&
        sliderElementRef.current
      ) {
        const containerRect = sliderElementRef.current.getBoundingClientRect();
        const leftRect = leftLabelRef.current.getBoundingClientRect();
        const rightRect = rightLabelRef.current.getBoundingClientRect();

        labelBoundsRef.current = {
          left: {
            ...leftRect,
            left: leftRect.left - containerRect.left,
            right: leftRect.right - containerRect.left,
            width: leftRect.width,
          } as DOMRect,
          right: {
            ...rightRect,
            left: rightRect.left - containerRect.left,
            right: rightRect.right - containerRect.left,
            width: rightRect.width,
          } as DOMRect,
        };
      }
    };

    // Calculate immediately
    calculateBounds();

    // Recalculate on window resize
    window.addEventListener('resize', calculateBounds);

    return () => {
      window.removeEventListener('resize', calculateBounds);
    };
  }, []);

  // Add effect to track value changes and update the right motion value
  useEffect(() => {
    const percentage = ((value - MIN_VALUE) / (MAX_VALUE - MIN_VALUE)) * 100;

    // Skip animation on first render by jumping directly on the spring
    if (isFirstRenderRef.current) {
      springRangeRight.jump(percentage);
      isFirstRenderRef.current = false;
    } else {
      rangeRight.set(percentage);
    }
  }, [value, MAX_VALUE, MIN_VALUE, rangeRight, springRangeRight]);

  const PADDING_OPACITY = 16;

  const isValueIntersectsLeftLabel = useMemo(() => {
    if (!labelBoundsRef.current.left) return false;
    if (!sliderElementRef.current) return false;
    const valueToPositionInPixel =
      ((value - MIN_VALUE) / (MAX_VALUE - MIN_VALUE)) *
      sliderElementRef.current.getBoundingClientRect().width;

    return (
      valueToPositionInPixel >
        labelBoundsRef.current.left.left - PADDING_OPACITY &&
      valueToPositionInPixel <
        labelBoundsRef.current.left.right + PADDING_OPACITY
    );
  }, [MAX_VALUE, MIN_VALUE, value]);

  const isValueIntersectsRightLabel = useMemo(() => {
    if (!labelBoundsRef.current.right) return false;
    if (!sliderElementRef.current) return false;
    const valueToPositionInPixel =
      ((value - MIN_VALUE) / (MAX_VALUE - MIN_VALUE)) *
      sliderElementRef.current.getBoundingClientRect().width;

    return (
      valueToPositionInPixel <
        labelBoundsRef.current.right.right + PADDING_OPACITY &&
      valueToPositionInPixel >
        labelBoundsRef.current.right.left - PADDING_OPACITY
    );
  }, [MAX_VALUE, MIN_VALUE, value]);

  return (
    <SliderRoot
      id={sliderId}
      aria-label={label}
      aria-valuemin={MIN_VALUE}
      aria-valuemax={MAX_VALUE}
      aria-valuenow={value}
      aria-disabled={disabled}
      aria-valuetext={`${label}: ${value}`}
      ref={sliderElementRef}
      defaultValue={defaultValue}
      min={MIN_VALUE}
      max={MAX_VALUE}
      step={STEP_SIZE}
      value={value}
      disabled={disabled}
      onValueChange={onChange}
      size={size}
      render={
        <motion.div
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerDown={handlePointerDown}
          style={{
            opacity: disabled ? 0.4 : 1,
            transformOrigin,
            scaleX: shouldReduceMotion ? scaleX : springScaleX,
            scaleY: shouldReduceMotion ? scaleY : springScaleY,
            x: shouldReduceMotion ? translateX : springTranslateX,
          }}
        />
      }
    >
      <GlassMaterial style={{ '--opacity': 0.205 } as React.CSSProperties} />
      <Control size={size}>
        <Track>
          <Indicator
            render={
              <motion.div
                ref={rangeElementRef}
                style={{
                  borderRadius: size === 'sm' ? '8px' : '12px',
                  scaleX: shouldReduceMotion ? rangeScaleX : springRangeScaleX,
                  width: shouldReduceMotion
                    ? rangeRightPercent
                    : springRangeRightPercent,
                  // @ts-ignore
                  '--left-offset': value === 0 ? '8px' : 'auto',
                  '--right-offset': value === 0 ? 'auto' : '8px',
                  '--thumb-opacity':
                    isValueIntersectsLeftLabel || isValueIntersectsRightLabel
                      ? 0
                      : 1,
                  transformOrigin: 'left center',
                  minWidth: value === 0 ? '1px' : 'auto',
                }}
              >
                <GlassMaterial
                  border={false}
                  style={{ '--opacity': 0.205 } as React.CSSProperties}
                />
              </motion.div>
            }
          />

          <Thumb />
        </Track>
      </Control>
      {shouldRenderStepsDots ? (
        <SliderStepsDots aria-hidden="true">
          {Array.from({
            length: Math.floor((MAX_VALUE - MIN_VALUE) / STEP_SIZE) + 1,
          }).map((_, index) => {
            const stepValue = MIN_VALUE + index * STEP_SIZE;
            const position =
              ((stepValue - MIN_VALUE) / (MAX_VALUE - MIN_VALUE)) * 100;

            return (
              <Box
                key={index}
                css={{
                  position: 'absolute',
                  left: `calc(${position}% - 10px)`,
                  transform: 'translateX(-50%)',
                  width: '4px',
                  height: '4px',
                  backgroundColor: 'hsla(0, 0%, 100%, 0.3)',
                  borderRadius: '9999px',
                  transition: 'opacity 0.15s ease-in-out',
                  willChange: 'opacity',
                }}
                style={{
                  opacity:
                    stepValue === value ||
                    stepValue < MIN_VALUE + 0.15 * (MAX_VALUE - MIN_VALUE) ||
                    stepValue > MIN_VALUE + 0.9 * (MAX_VALUE - MIN_VALUE)
                      ? 0
                      : 1,
                }}
              />
            );
          })}
        </SliderStepsDots>
      ) : null}
      <SliderLabel>
        {label ? (
          <Text
            id={`${sliderId}-label`}
            as="label"
            htmlFor={sliderId}
            size="2"
            weight="4"
            variant="primary"
            ref={leftLabelRef}
          >
            {label}
          </Text>
        ) : null}
        <Text
          variant="primary"
          size="2"
          style={{ fontVariantNumeric: 'tabular-nums' }}
          weight="4"
          ref={rightLabelRef}
        >
          {value}
        </Text>
      </SliderLabel>
    </SliderRoot>
  );
};

export default Slider;
