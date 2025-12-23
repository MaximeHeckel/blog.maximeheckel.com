import { Slider } from '@base-ui/react/slider';
import {
  Box,
  Flex,
  GlassMaterial,
  Grid,
  styled,
  Text,
} from '@maximeheckel/design-system';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Main } from '@core/components/Main';

const SliderRoot = styled(Slider.Root, {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  userSelect: 'none',
  touchAction: 'none',
  width: '100%',
  height: '48px',
  borderRadius: '12px',
  overflow: 'clip',
  backdropFilter: 'blur(24px)',
  cursor: 'grab',

  '&:active': {
    cursor: 'grabbing',
  },
});

const Control = styled(Slider.Control, {
  position: 'relative',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  height: '48px',
  touchAction: 'none',
  userSelect: 'none',
});

const Track = styled(Slider.Track, {
  position: 'relative',
  flexGrow: 1,
  height: '100%',

  userSelect: 'none',
});

const Indicator = styled(Slider.Indicator, {
  userSelect: 'none',
  position: 'absolute',

  height: '100%',

  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    transition: 'opacity 0.15s ease-in-out',
    opacity: 'var(--thumb-opacity, 1)',
    transform: 'translate(-50%, -50%)',
    right: 'var(--right-offset, auto)',
    left: 'var(--left-offset, auto)',
    width: '2px',
    backgroundColor: 'hsla(0, 0%, 100%, 0.5)',
    borderRadius: '9999px',
    height: '24px',
  },
});

const Thumb = styled(Slider.Thumb, {
  display: 'block',
  opacity: 1,
  backgroundColor: 'rgba(220, 38, 38, 0.0)',
  width: '20px',
  height: '44px',
  borderRadius: '9999px',
  cursor: 'grab',
  position: 'relative',
  zIndex: 1,

  '&:focus': {
    outline: 'none',
  },
  '&:active': {
    cursor: 'grabbing',
  },

  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    left: '50%',
    width: '2px',
    borderRadius: '9999px',
    height: '24px',
  },
});

const SliderLabel = styled(Box, {
  position: 'absolute',
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0 16px',
  top: '50%',
  transform: 'translateY(-50%)',
  fontSize: '12px',
  opacity: 0.9,
  pointerEvents: 'none',
});

const SliderStepsDots = styled(Box, {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  pointerEvents: 'none',
});

type CustomSliderProps = {
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  value: number;
  defaultValue: number;
  disabled?: boolean;
  label?: string;
};

const CustomSlider = (props: CustomSliderProps) => {
  const {
    min,
    max,
    step = 1,
    onChange,
    value,
    defaultValue,
    disabled,
    label,
  } = props;

  const MAX_VALUE = max;
  const MIN_VALUE = min;
  const STEP_SIZE = step;
  // const MIN_STEP_SIZE = 5;
  const MAX_STEPS_COUNT = 25;

  const startPositionRef = useRef(0);
  const isPointerDownRef = useRef(false);
  const sliderElementRef = useRef<HTMLDivElement>(null);
  const continuousValueRef = useRef(50);
  const rangeElementRef = useRef<HTMLDivElement>(null); // Add ref for the range element
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
      id="slider-root"
      ref={sliderElementRef}
      defaultValue={defaultValue}
      min={MIN_VALUE}
      max={MAX_VALUE}
      step={STEP_SIZE}
      value={value}
      disabled={disabled}
      onValueChange={onChange}
      render={
        <motion.div
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerDown={handlePointerDown}
          style={{
            transformOrigin,
            scaleX: springScaleX,
            scaleY: springScaleY,
            x: springTranslateX,
          }}
        />
      }
    >
      <GlassMaterial style={{ '--opacity': 0.205 } as React.CSSProperties} />
      <Control id="slider-control">
        <Track id="slider-track">
          <Indicator
            render={
              <motion.div
                id="slider-indicator"
                ref={rangeElementRef}
                style={{
                  borderRadius: '12px',
                  scaleX: springRangeScaleX,
                  width: springRangeRightPercent,
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
                  style={{ '--opacity': 0.205 } as React.CSSProperties}
                />
              </motion.div>
            }
          />

          <Thumb id="slider-thumb" />
        </Track>
      </Control>
      {shouldRenderStepsDots ? (
        <SliderStepsDots>
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
          <Text size="2" weight="4" variant="primary" ref={leftLabelRef}>
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

const Test = () => {
  const [value, setValue] = useState(50);
  const [value2, setValue2] = useState(180);
  const [value3, setValue3] = useState(1);
  // const [value2, setValue2] = useState(500);
  // const [value3, setValue3] = useState(1);

  return (
    <Main>
      <Grid
        css={{
          position: 'relative',
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          backgroundColor: 'var(--background)',
          paddingTop: 'var(--space-10)',
          borderBottomRightRadius: 4,
          borderBottomLeftRadius: 4,
        }}
        gapX={2}
        templateColumns="1fr minmax(auto, 700px) 1fr"
      >
        <Flex
          alignItems="center"
          as={Grid.Item}
          direction="column"
          col={2}
          gap="5"
        >
          <CustomSlider
            min={0}
            max={100}
            step={1}
            onChange={(value) => setValue(value)}
            value={value}
            defaultValue={500}
            disabled={false}
            label="Quantity"
          />
          <CustomSlider
            min={0}
            max={360}
            step={30}
            onChange={(value) => setValue2(value)}
            value={value2}
            defaultValue={500}
            disabled={false}
            label="Angle"
          />
          <CustomSlider
            min={0}
            max={2}
            step={1}
            onChange={(value) => setValue3(value)}
            value={value3}
            defaultValue={1}
            disabled={false}
            label="Mode"
          />
        </Flex>
      </Grid>
    </Main>
  );
};
export default Test;
