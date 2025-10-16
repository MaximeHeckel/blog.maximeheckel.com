import {
  Box,
  Flex,
  GlassMaterial,
  Grid,
  styled,
  Text,
} from '@maximeheckel/design-system';
import { useDebouncedValue } from '@maximeheckel/design-system';
import * as Slider from '@radix-ui/react-slider';
import { motion, useMotionValue, useSpring } from 'motion/react';
import React from 'react';

// import { GrayscaleHalftone } from '@core/components/Halftone';
import { ColorBlending } from '@core/components/ColorBlending';
import { CMYKHalftone } from '@core/components/Halftone/CMYKHalftone';
import { Main } from '@core/components/Main';
import Seo from '@core/components/Seo';

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

  '&:active': {
    cursor: 'grabbing',
  },
});

const SliderTrack = styled(Slider.Track, {
  position: 'relative',
  flexGrow: 1,
  height: '100%',
});

const SliderRange = styled(Slider.Range, {
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

const SliderThumb = styled(Slider.Thumb, {
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

  const startPositionRef = React.useRef(0);
  const isPointerDownRef = React.useRef(false);
  const sliderElementRef = React.useRef<HTMLDivElement>(null);
  const continuousValueRef = React.useRef(50);
  const rangeElementRef = React.useRef<HTMLDivElement>(null); // Add ref for the range element

  const leftLabelRef = React.useRef<HTMLSpanElement>(null);
  const rightLabelRef = React.useRef<HTMLSpanElement>(null);

  const labelBoundsRef = React.useRef<{
    left: DOMRect | null;
    right: DOMRect | null;
  }>({
    left: null,
    right: null,
  });

  React.useEffect(() => {
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
    stiffness: 500,
    damping: 40,
    mass: 0.5,
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    startPositionRef.current = e.clientX;
    isPointerDownRef.current = true;
  };

  const shouldRenderStepsDots = React.useMemo(() => {
    return (
      MAX_STEPS_COUNT >= Math.floor((MAX_VALUE - MIN_VALUE) / STEP_SIZE) + 1
    );
  }, [MAX_STEPS_COUNT, MAX_VALUE, MIN_VALUE, STEP_SIZE]);

  const handlePointerMove = React.useCallback(
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

          // Calculate stretch based on difference between continuous and actual DOM position
          const stepDifference = Math.abs(continuousValue - steppedPosition);

          // Define a constant target stretch in pixels (not percentage!)
          const TARGET_STRETCH_PX = 16; // Always try to stretch by ~8 pixels
          const maxStretchProgress = Math.min(stepDifference / STEP_SIZE, 1);
          const targetStretchPixels = maxStretchProgress * TARGET_STRETCH_PX;

          // Current width in pixels
          const currentWidthPx = rangeRect.width;

          // Convert pixel stretch to scale factor
          // scale = (currentWidth + targetStretch) / currentWidth
          // To avoid division by zero, use a minimum width
          const effectiveWidth = Math.max(currentWidthPx, 16); // Use minWidth as fallback
          const stretchAmount = Math.min(
            targetStretchPixels / effectiveWidth,
            0.5
          );

          // Apply stretch based on direction
          if (continuousValue > steppedPosition && delta > 0) {
            rangeScaleX.set(1 + stretchAmount);
          } else if (continuousValue < steppedPosition && delta < 0) {
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
        if (currentPercentage >= 99 && delta > 0) {
          overdrag = Math.min(delta * 0.1, 50);
        }
        // At min: range width should be ~0% of container
        else if (currentPercentage <= 1 && delta < 0) {
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
      STEP_SIZE,
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

  const PADDING_OPACITY = 16;

  const isValueIntersectsLeftLabel = React.useMemo(() => {
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

  const isValueIntersectsRightLabel = React.useMemo(() => {
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

  const handleValueChange = (value: [number]) => {
    onChange(value[0]);
  };

  // Add effect to track value changes and update the right motion value
  React.useEffect(() => {
    if (sliderElementRef.current) {
      const containerWidth =
        sliderElementRef.current.getBoundingClientRect().width;
      const percentage = (value - MIN_VALUE) / (MAX_VALUE - MIN_VALUE);
      // Calculate the right offset (distance from right edge)
      const rightOffset = (1 - percentage) * containerWidth;
      rangeRight.set(rightOffset);
    }
  }, [value, MAX_VALUE, MIN_VALUE, rangeRight]);

  return (
    <SliderRoot
      ref={sliderElementRef}
      asChild
      disabled={disabled}
      defaultValue={[defaultValue]}
      value={[value]}
      min={MIN_VALUE}
      max={MAX_VALUE}
      step={STEP_SIZE}
      onValueChange={handleValueChange}
    >
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
      >
        <GlassMaterial style={{ '--opacity': 0.205 } as React.CSSProperties} />
        <SliderTrack id="slider-track">
          <SliderRange asChild>
            <motion.div
              id="range"
              ref={rangeElementRef}
              style={{
                // @ts-ignore
                '--thumb-opacity':
                  isValueIntersectsLeftLabel || isValueIntersectsRightLabel
                    ? 0
                    : 1,
                '--left-offset': value === 0 ? '8px' : 'auto',
                '--right-offset': value === 0 ? 'auto' : '8px',
                scaleX: springRangeScaleX,
                right: springRangeRight,
                borderRadius: '12px',
                transformOrigin: 'left center',
                minWidth: value === 0 ? '1px' : 'auto',
              }}
            >
              <GlassMaterial
                style={{ '--opacity': 0.075 } as React.CSSProperties}
              />
            </motion.div>
          </SliderRange>
        </SliderTrack>
        <SliderThumb aria-label="Test" />
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
      </motion.div>
    </SliderRoot>
  );
};

export default function Test() {
  // UI state (updates immediately)
  const [dotSize, setDotSize] = React.useState(8);
  const [cyanAngle, setCyanAngle] = React.useState(15);
  const [magentaAngle, setMagentaAngle] = React.useState(75);
  const [yellowAngle, setYellowAngle] = React.useState(0);
  const [blackAngle, setBlackAngle] = React.useState(45);

  const [value, setValue] = React.useState(500);
  const [value2, setValue2] = React.useState(150);
  const [value3, setValue3] = React.useState(1);
  // Debounced values for expensive canvas rendering
  const debouncedDotSize = useDebouncedValue(dotSize, 100);
  const debouncedCyanAngle = useDebouncedValue(cyanAngle, 100);
  const debouncedMagentaAngle = useDebouncedValue(magentaAngle, 100);
  const debouncedYellowAngle = useDebouncedValue(yellowAngle, 100);
  const debouncedBlackAngle = useDebouncedValue(blackAngle, 100);

  const imageUrl = '/static/images/sample3.jpg';

  return (
    <Main>
      <Seo title="Color Blending Test" />
      <Grid
        css={{
          position: 'relative',
          minHeight: '100vh',
          width: '100%',
          backgroundColor: 'var(--background)',
          padding: '40px 20px',
        }}
        gapX={2}
        templateColumns="1fr minmax(auto, 700px) 1fr"
      >
        <Flex
          as={Grid.Item}
          direction="column"
          justifyContent="center"
          col={2}
          gap="4"
        >
          <CMYKHalftone
            imageUrl={imageUrl}
            dotSize={debouncedDotSize}
            width={800}
            height={800}
            cyanAngle={debouncedCyanAngle}
            magentaAngle={debouncedMagentaAngle}
            yellowAngle={debouncedYellowAngle}
            blackAngle={debouncedBlackAngle}
            style={{
              border: '2px solid var(--gray-300)',
              overflow: 'hidden',
              borderRadius: '16px',
              backgroundColor: 'white',
            }}
          />
          <Flex
            direction="column"
            gap="2"
            css={{
              marginBottom: '20px',
              width: '100%',

              borderRadius: '16px',
            }}
          >
            <CustomSlider
              min={3}
              max={20}
              step={1}
              onChange={(value) => setDotSize(value)}
              value={dotSize}
              defaultValue={8}
              label="Dot Size"
            />
            <CustomSlider
              min={0}
              max={90}
              onChange={(value) => setCyanAngle(value)}
              value={cyanAngle}
              defaultValue={8}
              label="Cyan Angle"
            />
            <CustomSlider
              min={0}
              max={90}
              onChange={(value) => setMagentaAngle(value)}
              value={magentaAngle}
              defaultValue={8}
              label="Magenta Angle"
            />
            <CustomSlider
              min={0}
              max={90}
              onChange={(value) => setYellowAngle(value)}
              value={yellowAngle}
              defaultValue={8}
              label="Yellow Angle"
            />
            <CustomSlider
              min={0}
              max={90}
              onChange={(value) => setBlackAngle(value)}
              value={blackAngle}
              defaultValue={8}
              label="Black Angle"
            />
          </Flex>

          <ColorBlending
            mode="RGB"
            width={600}
            height={400}
            style={{
              borderRadius: '16px',
            }}
          />
          <br />
          <br />
          <br />
          <br />
          <Flex
            /**
           * const color1 = vec3(0.01, 0.22, 0.98);
      const color2 = vec3(0.36, 0.68, 1.0);
           */
            css={{
              backgroundImage: 'url(/static/images/background-3.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              padding: '156px',
              borderRadius: '16px',
              border: '2px solid var(--border-color)',
              height: '600px',
              width: '1200px',
            }}
            direction="column"
            justifyContent="center"
            gap="2"
          >
            <CustomSlider
              min={0}
              max={1000}
              step={1}
              onChange={(value) => setValue(value)}
              value={value}
              defaultValue={500}
              disabled={false}
              label="Quantity"
            />
            <br />

            <CustomSlider
              min={0}
              max={360}
              step={90}
              onChange={(value) => setValue2(value)}
              value={value2}
              defaultValue={500}
              disabled={false}
              label="Angle"
            />
            <br />

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
          <br />
          <br />
          <br />
          <br />
          <ColorBlending
            mode="CMY"
            width={600}
            height={400}
            style={{
              borderRadius: '16px',
            }}
          />
        </Flex>
      </Grid>
    </Main>
  );
}
