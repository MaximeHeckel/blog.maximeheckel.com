import {
  Box,
  Card,
  Flex,
  GlassMaterial,
  Shadows,
  Text,
} from '@maximeheckel/design-system';
// import { useInView } from 'motion/react';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import useSound from 'use-sound';

import { HighlightedCodeText } from '@core/components/Code/CodeBlock';
import Fullbleed from '@core/components/Fullbleed';

import { ShaderCanvas, Uniforms } from './ShaderCanvas';

const GRID_SIZE = 12;
const HIDE_DELAY_MS = 250;
const SOUND_THROTTLE_MS = 50;

// Helper function to calculate grid point from mouse position
function calculateGridPoint(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  gridSize: number
): {
  point: { x: number; y: number };
  screenPos: { x: number; y: number };
} {
  const mouseX = (clientX - rect.left) / rect.width;
  const mouseY = (clientY - rect.top) / rect.height;

  // Find closest grid point
  const closestX = Math.round(mouseX * gridSize);
  const closestY = Math.round((1 - mouseY) * gridSize); // Flip Y

  // Clamp to grid bounds
  const x = Math.max(0, Math.min(gridSize, closestX));
  const y = Math.max(0, Math.min(gridSize, closestY));

  // Calculate screen position of the grid point
  const pointScreenX = rect.left + (x / gridSize) * rect.width;
  const pointScreenY = rect.top + (1 - y / gridSize) * rect.height;

  return {
    point: { x, y },
    screenPos: { x: pointScreenX, y: pointScreenY },
  };
}

interface HoverState {
  point: { x: number; y: number };
  screenPos: { x: number; y: number };
}

interface GridLinesProps {
  gridSize: number;
}

const GridLines = memo(({ gridSize }: GridLinesProps) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
  >
    {Array.from({ length: gridSize + 1 }).map((_, i) => (
      <line
        key={`v-${i}`}
        x1={(i / gridSize) * 100}
        y1={0}
        x2={(i / gridSize) * 100}
        y2={100}
        stroke="var(--border-color)"
        strokeOpacity={0.85}
        strokeWidth={1.0}
        vectorEffect="non-scaling-stroke"
      />
    ))}
    {Array.from({ length: gridSize + 1 }).map((_, i) => (
      <line
        key={`h-${i}`}
        x1={0}
        y1={(i / gridSize) * 100}
        x2={100}
        y2={(i / gridSize) * 100}
        stroke="var(--border-color)"
        strokeOpacity={0.85}
        strokeWidth={1.0}
        vectorEffect="non-scaling-stroke"
      />
    ))}
  </svg>
));

GridLines.displayName = 'GridLines';

interface GridOverlayProps {
  gridSize: number;
}

const GridOverlay = ({ gridSize }: GridOverlayProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSoundTimeRef = useRef<number>(0);

  const [hoverState, setHoverState] = useState<HoverState | null>(null);
  const [isFading, setIsFading] = useState(false);
  const [isOutside, setIsOutside] = useState(false);

  const [play] = useSound('/static/sounds/button-2.wav', {
    volume: 0.35,
    interrupt: true,
    soundEnabled: !isOutside,
  });

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const { point, screenPos } = calculateGridPoint(
        e.clientX,
        e.clientY,
        rect,
        gridSize
      );

      setHoverState({ point, screenPos });
    },
    [gridSize]
  );

  const handleMouseEnter = useCallback(() => {
    clearHideTimeout();
    setIsFading(false);
    setIsOutside(false);
  }, [clearHideTimeout]);

  const handleMouseLeave = useCallback(() => {
    setIsOutside(true);
    clearHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        setHoverState(null);
        setIsFading(false);
        setIsOutside(false);
      }, 300);
    }, HIDE_DELAY_MS);
  }, [clearHideTimeout]);

  // Track mouse movement outside the grid
  useEffect(() => {
    if (!isOutside) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const { point, screenPos } = calculateGridPoint(
        e.clientX,
        e.clientY,
        rect,
        gridSize
      );

      setHoverState({ point, screenPos });

      // Reset the hide timer on mouse movement
      clearHideTimeout();
      hideTimeoutRef.current = setTimeout(() => {
        setIsFading(true);
        setTimeout(() => {
          setHoverState(null);
          setIsFading(false);
          setIsOutside(false);
        }, 300);
      }, HIDE_DELAY_MS);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
    };
  }, [isOutside, clearHideTimeout, gridSize]);

  useEffect(() => {
    if (
      hoverState?.point.x !== undefined &&
      hoverState?.point.y !== undefined
    ) {
      const now = Date.now();
      if (now - lastSoundTimeRef.current >= SOUND_THROTTLE_MS) {
        lastSoundTimeRef.current = now;
        play();
      }
    }
  }, [hoverState?.point.x, hoverState?.point.y, play]);

  useEffect(() => {
    return () => {
      clearHideTimeout();
    };
  }, [clearHideTimeout]);

  return (
    <>
      <Box
        ref={containerRef}
        css={{
          position: 'absolute',
          inset: 0,
          cursor: 'crosshair',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
      >
        <GridLines gridSize={gridSize} />
      </Box>
      {hoverState &&
        typeof document !== 'undefined' &&
        createPortal(
          <>
            <Box
              css={{
                position: 'fixed',
                left: 0,
                top: 0,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                zIndex: 9999,
                willChange: 'transform',
                transition: 'transform 0.05s ease-out, opacity 0.3s ease-out',
              }}
              style={{
                transform: `translate3d(calc(${hoverState.screenPos.x}px - 50%), calc(${hoverState.screenPos.y}px - 100% - 12px), 0)`,
                opacity: isFading ? 0 : 1,
              }}
            >
              <Box
                css={{
                  position: 'relative',
                  padding: 'var(--space-0) var(--space-1)',
                  borderRadius: 'var(--border-radius-1)',
                }}
              >
                <GlassMaterial />
                <Text
                  size="1"
                  css={{ fontFamily: 'var(--font-mono)' }}
                  family="mono"
                  variant="primary"
                  weight="2"
                >
                  {(hoverState.point.x / gridSize).toFixed(2)},{' '}
                  {(hoverState.point.y / gridSize).toFixed(2)}
                </Text>
              </Box>
            </Box>
            <Box
              css={{
                position: 'fixed',
                left: 0,
                top: 0,
                pointerEvents: 'none',
                zIndex: 9998,
                willChange: 'transform',
                transition: 'transform 0.05s ease-out, opacity 0.3s ease-out',
              }}
              style={{
                transform: `translate3d(calc(${hoverState.screenPos.x}px - 50%), calc(${hoverState.screenPos.y}px - 50%), 0)`,
                opacity: isFading ? 0 : 1,
              }}
            >
              <Box
                css={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--white)',
                  boxShadow: Shadows[1],
                }}
              />
            </Box>
          </>,
          document.body
        )}
    </>
  );
};

export interface ShaderPlaygroundProps {
  fragmentShader: string;
  uniforms?: Uniforms;
  children?: React.ReactNode;
  showGrid?: boolean;
  showCode?: boolean;
  aspectRatio?: string;
  gridSize?: number;
}

export const ShaderPlayground = (props: ShaderPlaygroundProps) => {
  const {
    fragmentShader,
    uniforms = {},
    children,
    showGrid = false,
    showCode = true,
    aspectRatio = '1 / 1',
    gridSize = GRID_SIZE,
  } = props;

  const hasControls = React.Children.count(children) > 0;
  const ref = useRef<HTMLDivElement>(null);

  // const isInView = useInView(ref);

  return (
    <Fullbleed widthPercent={60}>
      <Card css={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
        <Card.Body
          as={Flex}
          direction="row"
          alignItems="stretch"
          css={{
            padding: 0,
            columnGap: 'var(--space-9)',
            rowGap: 'var(--space-3)',
            '@media (max-width: 900px)': {
              flexDirection: 'column-reverse',
            },
          }}
        >
          {hasControls ? (
            <Flex
              direction="column"
              gap="4"
              alignItems="start"
              justifyContent="start"
              css={{
                flex: 1,
                minWidth: 0,
                padding: 'var(--space-3) var(--space-4)',
              }}
            >
              <Text size="2" weight="4" variant="tertiary">
                Uniforms
              </Text>
              {children}
            </Flex>
          ) : null}
          <Flex
            alignItems="center"
            justifyContent="end"
            css={{
              flex: hasControls ? 2.25 : 1,
              minWidth: 0,
            }}
          >
            <Box
              ref={ref}
              css={{
                position: 'relative',
                width: '100%',
                overflow: 'hidden',
                borderLeft: '1px solid var(--border-color)',
              }}
              style={{ aspectRatio }}
            >
              {/* {isInView ? ( */}
              <ShaderCanvas
                fragmentShader={fragmentShader}
                uniforms={uniforms}
              />
              {/* ) : null} */}
              {showGrid ? <GridOverlay gridSize={gridSize} /> : null}
            </Box>
          </Flex>
        </Card.Body>
        {showCode ? (
          <Box
            css={{
              position: 'relative',
              width: '100%',
              minWidth: 0,
              maxWidth: '100%',
              overflow: 'hidden',
              contain: 'inline-size',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <HighlightedCodeText codeString={fragmentShader} language="glsl" />
          </Box>
        ) : null}
      </Card>
    </Fullbleed>
  );
};
