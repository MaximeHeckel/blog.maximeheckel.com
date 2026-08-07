import {
  Box,
  Flex,
  Icon,
  IconButton,
  Text,
  useKeyboardShortcut,
} from '@maximeheckel/design-system';
import { motion, useInView } from 'motion/react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const MOTION_MAP_URL =
  'https://cdn.maximeheckel.com/images/blog/motion-map.png';
const GRID_SIZE = 24;
const SEARCH_RADIUS = 0.44;
const SELECTED_SEED_INDEX = 3;
const ACCENT_COLOR = 'oklch(100% 0.02 264)';
const WEIGHT_COLOR = 'oklch(71.73% 0.194 45)';
const CIRCLE_STROKE_WIDTH = 1.5;
const TRANSITION = {
  duration: 0.42,
  ease: [0.22, 1, 0.36, 1] as const,
};

const SEEDS = [
  { x: 0.18, y: 0.2 },
  { x: 0.5, y: 0.18 },
  { x: 0.76, y: 0.28 },
  { x: 0.28, y: 0.7 },
  { x: 0.68, y: 0.72 },
];

const STEPS = [
  'Seed the blob centers',
  'Select a search region',
  'Sample a 5 × 5 grid',
  'Weight samples by motion and distance',
  'Calculate the weighted center',
  'Store the detected blob',
  'Repeat the process for all blobs',
];

interface Point {
  x: number;
  y: number;
}

interface Sample {
  brightness: number;
  falloff: number;
  uv: Point;
  weight: number;
}

interface DetectedBlob {
  center: Point;
  size: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const amount = clamp((value - edge0) / (edge1 - edge0), 0, 1);

  return amount * amount * (3 - 2 * amount);
};

const getBrightness = (imageData: ImageData, uv: Point) => {
  const pixelX = clamp(
    Math.floor(uv.x * imageData.width),
    0,
    imageData.width - 1
  );
  const pixelY = clamp(
    Math.floor(uv.y * imageData.height),
    0,
    imageData.height - 1
  );
  const pixelIndex = (pixelY * imageData.width + pixelX) * 4;

  return (
    (imageData.data[pixelIndex] * 0.299 +
      imageData.data[pixelIndex + 1] * 0.587 +
      imageData.data[pixelIndex + 2] * 0.114) /
    255
  );
};

const getSamples = (
  imageData: ImageData,
  seed: Point,
  previousBlobs: DetectedBlob[] = []
): Sample[] =>
  Array.from({ length: 25 }, (_, index) => {
    const sx = (index % 5) / 4 - 0.5;
    const sy = Math.floor(index / 5) / 4 - 0.5;
    const uv = {
      x: clamp(seed.x + sx * SEARCH_RADIUS, 0, 1),
      y: clamp(seed.y + sy * SEARCH_RADIUS, 0, 1),
    };
    const brightness = getBrightness(imageData, uv);
    const falloff = Math.max(0, 1 - Math.hypot(sx, sy) * 1.25);
    const exclusion = previousBlobs.reduce((result, blob) => {
      const distance = Math.hypot(uv.x - blob.center.x, uv.y - blob.center.y);

      return result * smoothstep(0.035, 0.13, distance);
    }, 1);

    return {
      brightness,
      falloff,
      uv,
      weight: brightness * falloff * exclusion,
    };
  });

const detectBlob = (samples: Sample[]): DetectedBlob | null => {
  const weightSum = samples.reduce((sum, sample) => sum + sample.weight, 0);
  const activity = samples.reduce(
    (maximum, sample) => Math.max(maximum, sample.brightness),
    0
  );

  if (activity <= 0.05 || weightSum <= 0.004) return null;

  const center = samples.reduce(
    (result, sample) => ({
      x: result.x + sample.uv.x * sample.weight,
      y: result.y + sample.uv.y * sample.weight,
    }),
    { x: 0, y: 0 }
  );
  center.x /= weightSum;
  center.y /= weightSum;

  const secondMoment = samples.reduce(
    (result, sample) => ({
      x: result.x + sample.uv.x * sample.uv.x * sample.weight,
      y: result.y + sample.uv.y * sample.uv.y * sample.weight,
    }),
    { x: 0, y: 0 }
  );
  const variance = {
    x: Math.max(secondMoment.x / weightSum - center.x ** 2, 0),
    y: Math.max(secondMoment.y / weightSum - center.y ** 2, 0),
  };

  return {
    center,
    size: clamp(Math.sqrt(Math.max(variance.x, variance.y)) * 0.85, 0.02, 0.82),
  };
};

interface CrosshairProps {
  center: Point;
  opacity: number;
  width: number;
  height: number;
}

const Crosshair = ({ center, opacity, width, height }: CrosshairProps) => {
  const x = center.x * width;
  const y = center.y * height;
  const radius = Math.min(width, height) * 0.014;

  return (
    <motion.g animate={{ opacity }} transition={TRANSITION}>
      <motion.line
        animate={{ x1: x - radius, x2: x + radius, y1: y, y2: y }}
        stroke={ACCENT_COLOR}
        strokeWidth={2.0}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        transition={TRANSITION}
      />
      <motion.line
        animate={{ x1: x, x2: x, y1: y - radius, y2: y + radius }}
        stroke={ACCENT_COLOR}
        strokeWidth={2.0}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        transition={TRANSITION}
      />
    </motion.g>
  );
};

interface BlobBoxProps {
  blob: DetectedBlob;
  opacity: number;
  width: number;
  height: number;
}

const BlobBox = ({ blob, opacity, width, height }: BlobBoxProps) => (
  <motion.rect
    animate={{
      x: (blob.center.x - blob.size) * width,
      y: (blob.center.y - blob.size) * height,
      width: blob.size * 2 * width,
      height: blob.size * 2 * height,
      opacity,
    }}
    fill="none"
    rx={Math.min(width, height) * 0.005}
    stroke={ACCENT_COLOR}
    strokeWidth={2.0}
    vectorEffect="non-scaling-stroke"
    transition={TRANSITION}
  />
);

export const BlobTracking = () => {
  const [step, setStep] = useState(0);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [overlaySize, setOverlaySize] = useState({ width: 1, height: 1 });
  const imageRef = useRef<HTMLImageElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(widgetRef);

  useKeyboardShortcut('ArrowLeft', () => {
    if (!isInView) return;

    setStep((current) => Math.max(0, current - 1));
  });

  useKeyboardShortcut('ArrowRight', () => {
    if (!isInView) return;

    setStep((current) => Math.min(STEPS.length - 1, current + 1));
  });

  const prepareImageData = useCallback(() => {
    const image = imageRef.current;

    if (!image || image.naturalWidth === 0) return;

    const samplingCanvas = document.createElement('canvas');
    samplingCanvas.width = image.naturalWidth;
    samplingCanvas.height = image.naturalHeight;

    const samplingContext = samplingCanvas.getContext('2d', {
      willReadFrequently: true,
    });

    if (!samplingContext) return;

    samplingContext.drawImage(image, 0, 0);
    setImageData(
      samplingContext.getImageData(
        0,
        0,
        samplingCanvas.width,
        samplingCanvas.height
      )
    );
  }, []);

  useEffect(() => {
    if (imageRef.current?.complete) {
      prepareImageData();
    }
  }, [prepareImageData]);

  useEffect(() => {
    const image = imageRef.current;

    if (!image) return;

    const updateOverlaySize = () => {
      const bounds = image.getBoundingClientRect();

      setOverlaySize({ width: bounds.width, height: bounds.height });
    };
    const observer = new ResizeObserver(updateOverlaySize);

    updateOverlaySize();
    observer.observe(image);

    return () => observer.disconnect();
  }, []);

  const selectedSeed = SEEDS[SELECTED_SEED_INDEX];
  const samples = useMemo(
    () => (imageData ? getSamples(imageData, selectedSeed) : []),
    [imageData, selectedSeed]
  );
  const selectedBlob = useMemo(() => detectBlob(samples), [samples]);
  const blobs = useMemo(() => {
    if (!imageData) return [];

    const detectedBlobs: DetectedBlob[] = [];
    const orderedSeeds = [
      selectedSeed,
      ...SEEDS.filter((_, index) => index !== SELECTED_SEED_INDEX),
    ];

    orderedSeeds.forEach((seed) => {
      const blob = detectBlob(getSamples(imageData, seed, detectedBlobs));

      if (blob) detectedBlobs.push(blob);
    });

    return detectedBlobs;
  }, [imageData, selectedSeed]);
  const maximumWeight = Math.max(
    ...samples.map((sample) => sample.weight),
    0.0001
  );
  const normalizedSelectedSampleWeight =
    (samples[12]?.weight ?? 0) / maximumWeight;
  const { width: overlayWidth, height: overlayHeight } = overlaySize;
  const overlayScale = Math.min(overlayWidth, overlayHeight);
  const gridCellSize = overlayWidth / GRID_SIZE;
  const gridRows = Math.ceil(overlayHeight / gridCellSize);

  return (
    <Flex ref={widgetRef} direction="column" gap="3" css={{ width: '100%' }}>
      <Box
        css={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          borderRadius: 'var(--border-radius-2)',
          backgroundColor: '#2282EF',
        }}
      >
        <Box
          as="img"
          ref={imageRef}
          alt="Black and white motion map"
          crossOrigin="anonymous"
          src={MOTION_MAP_URL}
          onLoad={prepareImageData}
          css={{
            display: 'block',
            width: '100%',
            height: 'auto',
            mixBlendMode: 'screen',
            opacity: 0.68,
          }}
        />

        <svg
          aria-hidden="true"
          width="100%"
          height="100%"
          viewBox={`0 0 ${overlayWidth} ${overlayHeight}`}
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        >
          {Array.from({ length: GRID_SIZE + 1 }, (_, index) => (
            <line
              key={`vertical-${index}`}
              x1={(index / GRID_SIZE) * overlayWidth}
              y1={0}
              x2={(index / GRID_SIZE) * overlayWidth}
              y2={overlayHeight}
              stroke="var(--white)"
              strokeOpacity={0.1}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {Array.from({ length: gridRows + 1 }, (_, index) => (
            <line
              key={`horizontal-${index}`}
              x1={0}
              y1={index * gridCellSize}
              x2={overlayWidth}
              y2={index * gridCellSize}
              stroke="var(--white)"
              strokeOpacity={0.1}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        <svg
          aria-hidden="true"
          width="100%"
          height="100%"
          viewBox={`0 0 ${overlayWidth} ${overlayHeight}`}
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        >
          {SEEDS.map((seed, index) => {
            const isSelected = index === SELECTED_SEED_INDEX;
            const visible = step === 0 || (isSelected && step <= 4);
            const selected = isSelected && step > 0;
            const weighted = selected && step >= 3;

            return (
              <motion.circle
                key={`seed-${index}`}
                animate={{
                  cx: seed.x * overlayWidth,
                  cy: seed.y * overlayHeight,
                  r: weighted
                    ? overlayScale *
                      (0.003 + normalizedSelectedSampleWeight * 0.015)
                    : overlayScale * (selected ? 0.012 : 0.009),
                  opacity: visible
                    ? weighted && normalizedSelectedSampleWeight <= 0.05
                      ? 0.6
                      : 1
                    : 0,
                }}
                fill={WEIGHT_COLOR}
                stroke={ACCENT_COLOR}
                strokeWidth={CIRCLE_STROKE_WIDTH}
                vectorEffect="non-scaling-stroke"
                transition={TRANSITION}
              />
            );
          })}

          <motion.rect
            animate={{
              x: (selectedSeed.x - SEARCH_RADIUS * 0.5) * overlayWidth,
              y: (selectedSeed.y - SEARCH_RADIUS * 0.5) * overlayHeight,
              width: SEARCH_RADIUS * overlayWidth,
              height: SEARCH_RADIUS * overlayHeight,
              opacity: step === 1 ? 1 : 0,
            }}
            fill="none"
            stroke={ACCENT_COLOR}
            strokeWidth={2}
            strokeDasharray="8 8"
            vectorEffect="non-scaling-stroke"
            transition={TRANSITION}
          />

          {samples.map((sample, index) => {
            const weighted = step >= 3;
            const normalizedWeight = sample.weight / maximumWeight;
            const visible = step >= 2 && step <= 4 && index !== 12;

            return (
              <motion.circle
                key={`sample-${index}`}
                animate={{
                  cx: sample.uv.x * overlayWidth,
                  cy: sample.uv.y * overlayHeight,
                  r: weighted
                    ? overlayScale * (0.003 + normalizedWeight * 0.015)
                    : index === 12
                      ? overlayScale * 0.012
                      : overlayScale * 0.005,
                  opacity: visible
                    ? weighted
                      ? normalizedWeight > 0.05
                        ? 1
                        : 0.6
                      : 1
                    : 0,
                  fill:
                    (weighted && normalizedWeight > 0.05) ||
                    (index === 12 && step === 2)
                      ? WEIGHT_COLOR
                      : ACCENT_COLOR,
                  stroke: ACCENT_COLOR,
                }}
                strokeWidth={CIRCLE_STROKE_WIDTH}
                vectorEffect="non-scaling-stroke"
                transition={TRANSITION}
              />
            );
          })}

          {selectedBlob ? (
            <>
              <Crosshair
                center={selectedBlob.center}
                opacity={step >= 4 ? 1 : 0}
                width={overlayWidth}
                height={overlayHeight}
              />
              <BlobBox
                blob={selectedBlob}
                opacity={step >= 5 ? 1 : 0}
                width={overlayWidth}
                height={overlayHeight}
              />
            </>
          ) : null}

          {blobs.slice(1).map((blob, index) => (
            <motion.g
              key={`blob-${index + 1}`}
              animate={{
                opacity: step === 6 ? 1 : 0,
                scale: step === 6 ? 1 : 0.82,
              }}
              style={{
                transformBox: 'fill-box',
                transformOrigin: 'center',
              }}
              transition={TRANSITION}
            >
              <BlobBox
                blob={blob}
                opacity={1}
                width={overlayWidth}
                height={overlayHeight}
              />
              <Crosshair
                center={blob.center}
                opacity={1}
                width={overlayWidth}
                height={overlayHeight}
              />
            </motion.g>
          ))}
        </svg>
      </Box>

      <Flex
        alignItems="center"
        css={{ width: '100%' }}
        justifyContent="space-between"
        gap="3"
      >
        <Text
          aria-live="polite"
          css={{ fontVariantNumeric: 'tabular-nums' }}
          size="1"
          variant="tertiary"
        >
          {step + 1} / {STEPS.length} · {STEPS[step]}
        </Text>

        <Flex alignItems="center" gap="3">
          <IconButton
            aria-label="Previous step"
            disabled={step === 0}
            onClick={() => setStep((current) => Math.max(0, current - 1))}
            rounded
            size="small"
            variant="tertiary"
          >
            <Icon.Arrow size="5" style={{ transform: 'rotate(180deg)' }} />
          </IconButton>
          <IconButton
            aria-label="Next step"
            disabled={step === STEPS.length - 1}
            onClick={() =>
              setStep((current) => Math.min(STEPS.length - 1, current + 1))
            }
            rounded
            size="small"
            variant="tertiary"
          >
            <Icon.Arrow size="5" />
          </IconButton>
        </Flex>
      </Flex>
    </Flex>
  );
};
