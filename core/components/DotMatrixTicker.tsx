import { Box, Flex, Text } from '@maximeheckel/design-system';
import { steps, useAnimate } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

const DotMatrixCanvas = ({
  dotSize = 1.75,
  dotSpacing = 1.55,
  dotOpacity = 0.9,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      ctx.scale(dpr, dpr);

      ctx.fillStyle = `rgba(0, 0, 0, ${dotOpacity})`;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Draw transparent dots (holes in the black)
      ctx.globalCompositeOperation = 'destination-out';
      const spacing = dotSize + dotSpacing;
      for (let x = 0; x < rect.width; x += spacing) {
        for (let y = 0; y < rect.height; y += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 1)';
          ctx.fill();
        }
      }

      ctx.globalCompositeOperation = 'source-over';
    };

    draw();

    const resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [dotSize, dotSpacing, dotOpacity]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

const COLORS = [
  'oklch(from var(--green-1100) 1 calc(c * 1.25) h / 1.0)',
  'oklch(from var(--orange-1100) l calc(c * 1.25) h / 1.0)',
  'oklch(from var(--red-1100) calc(l * 1.05) calc(c * 1.25) h / 1.0)',
  'oklch(from var(--blue-700) l calc(c * 1.25) h / 1.0)',
  'oklch(from var(--white) 1 c h / 1.0)',
];

export const DotMatrixTicker = ({
  text,
  speed = 2,
  steps: stepsNumber = 200,
  color,
}: {
  text: string;
  speed?: number;
  steps?: number;
  color?: string;
}) => {
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const TEXT =
    (`${text.toLocaleUpperCase()}` || 'MADE IN NYC - @MAXIMEHECKEL - 2025 -') +
    ' ';
  const REPEAT = 4;

  const [scope, animate] = useAnimate();

  const startAnimation = useCallback(() => {
    if (!scope.current) return;

    const contentWidth = scope.current.scrollWidth;

    const scrollDistance = contentWidth / 2;

    const clampedSpeed = Math.min(Math.max(speed, 0), 10);
    const duration = scrollDistance / (clampedSpeed * 100);

    animate(
      scope.current,
      {
        x: [0, -scrollDistance],
      },
      {
        duration: duration,
        repeat: Infinity,
        ease: steps(stepsNumber),
        repeatType: 'loop',
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate, scope, speed, stepsNumber, text]);

  useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  return (
    <Box
      id="ticker-wrapper"
      role="img"
      aria-label={`Ticker displaying the text: ${text}`}
      onClick={() => {
        if (color) return;
        setCurrentColor((prev) => {
          const index = COLORS.indexOf(prev);
          return COLORS[(index + 1) % COLORS.length];
        });
      }}
      css={{
        width: '100%',
        maxWidth: '100%',
        borderRadius: 'var(--border-radius-2)',
        border: '1px solid var(--border-color)',
        boxShadow:
          'inset 0 0 10px 0 rgba(0, 0, 0, 0.5), 0 2px 10px 1px rgba(0, 0, 0, 0.5)',
        cursor: 'pointer',
        overflowX: 'hidden',
      }}
    >
      <Box
        css={{
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
          maskImage:
            'linear-gradient(to left, transparent -50%, black 50%, transparent 150%)',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `
               linear-gradient(
                 to bottom,
                 rgba(200, 200, 200, 0.25) 0%,
                 rgba(200, 200, 200, 0.05) 15%,
                 transparent 40%,
                 transparent 60%,
                 rgba(200, 200, 200, 0.07) 85%,
                 rgba(200, 200, 200, 0.1) 100%
               )
             `,
            zIndex: 10,
            pointerEvents: 'none',
          },
          '&:after': {
            content: '""',
            position: 'absolute',
            top: '-70%',
            left: '-10%',
            width: '100%',
            height: '200%',
            background:
              'linear-gradient(10deg, transparent 30%, rgba(200, 200, 200, 0.27), transparent 70%)',
            filter: 'blur(10px)',
            transform: 'skewX(-60deg)',
            zIndex: 11,
            pointerEvents: 'none',
          },
        }}
      >
        <Box
          css={{
            position: 'relative',
            filter: 'brightness(1.25) saturate(2.8)',
            transition: 'color 0.3s ease-in-out',
          }}
          style={{
            color: currentColor,
          }}
        >
          <Flex
            ref={scope}
            css={{
              whiteSpace: 'nowrap',
              willChange: 'transform',
            }}
            gap="7"
          >
            {Array.from({ length: REPEAT }).map((_, index) => (
              <Text
                aria-hidden={index !== 0}
                key={`${TEXT}-${index}`}
                family="mono"
                css={{
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 400,
                  textShadow: `
                  0 0 4px currentColor,
                  0 0 8px currentColor,
                  0 0 12px currentColor,
                  0 0 16px currentColor
                `,
                  fontSize: '38px',
                  display: 'inline-block',

                  '& svg': {
                    // nudge icon down to line up with text
                    marginBottom: '-4px',
                    filter: `
                      drop-shadow(0 0 4px currentColor)
                      drop-shadow(0 0 8px currentColor)
                    `,
                  },
                }}
              >
                {TEXT}
              </Text>
            ))}
          </Flex>
          <DotMatrixCanvas dotSize={3.0} dotSpacing={1.0} dotOpacity={1.0} />
        </Box>
      </Box>
    </Box>
  );
};
