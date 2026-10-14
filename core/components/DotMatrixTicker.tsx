import { Box, Text } from '@maximeheckel/design-system';
import { useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

const COLORS = [
  'var(--green-1100)',
  'var(--orange-1100)',
  'oklch(75% 0.2 25)',
  'oklch(84% 0.12 220)',
  'var(--white)',
];
const HEIGHT = 64;
const PITCH = 3;
const SCROLL_STEP = PITCH * 3;

interface DotMatrixTickerProps {
  text: string;
  speed?: number;
  color?: string;
}

export const DotMatrixTicker = ({
  text,
  speed = 2,
  color,
}: DotMatrixTickerProps) => {
  const [colorIndex, setColorIndex] = useState(3);
  const [ready, setReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const offsetRef = useRef(0);
  const reducedMotion = useReducedMotion();
  const displayText = text.trim() || 'THANK YOU FOR YOUR SUPPORT';
  const activeColor = color ?? COLORS[colorIndex];

  useEffect(() => {
    const canvas = canvasRef.current;
    const label = textRef.current;
    const context = canvas?.getContext('2d');
    const bloomCanvas = document.createElement('canvas');
    const bloomContext = bloomCanvas.getContext('2d');

    if (!canvas || !label || !context || !bloomCanvas || !bloomContext) return;

    // Rasterize at full size, then average coverage across each display cell.
    const mask = document.createElement('canvas');
    const maskContext = mask.getContext('2d', { willReadFrequently: true });
    const pixels = document.createElement('canvas');
    const pixelContext = pixels.getContext('2d');

    if (!maskContext || !pixelContext) return;

    let frame = 0;
    let disposed = false;
    let width = 0;
    let offset = offsetRef.current;
    let previousTime = 0;
    let inView = true;
    let font = '';
    let repeatWidth = 0;
    let ink = '';
    const velocity = Math.min(Math.max(speed, 0), 10) * 30;
    const message = `${displayText.toLocaleUpperCase()}   •   `;

    const draw = (time: number) => {
      const delta = previousTime ? Math.min(time - previousTime, 50) : 0;
      previousTime = time;

      if (!reducedMotion)
        offset = (offset + (delta * velocity) / 1000) % repeatWidth;

      offsetRef.current = offset;

      // Advance by three display columns while retaining elapsed-time precision.
      const displayOffset = Math.floor(offset / SCROLL_STEP) * SCROLL_STEP;

      maskContext.clearRect(0, 0, mask.width, mask.height);
      maskContext.font = font;
      maskContext.textBaseline = 'alphabetic';
      maskContext.fillStyle = 'white';
      const metrics = maskContext.measureText(message);
      const baseline =
        (HEIGHT +
          metrics.actualBoundingBoxAscent -
          metrics.actualBoundingBoxDescent) /
        2;

      for (let x = -displayOffset; x < width; x += repeatWidth) {
        maskContext.fillText(message, x, baseline);
      }

      const samples = maskContext.getImageData(
        0,
        0,
        mask.width,
        mask.height
      ).data;
      pixelContext.clearRect(0, 0, width, HEIGHT);
      pixelContext.fillStyle = ink;

      for (let row = 0; row < mask.height / PITCH; row++) {
        for (let column = 0; column < mask.width / PITCH; column++) {
          // Area sampling preserves thin strokes as they cross cell boundaries.
          // Drawing the font at cell resolution makes font hinting snap instead.
          let alpha = 0;

          for (let y = 0; y < PITCH; y++) {
            for (let x = 0; x < PITCH; x++) {
              const index =
                ((row * PITCH + y) * mask.width + column * PITCH + x) * 4 + 3;
              alpha += samples[index];
            }
          }

          const coverage = alpha / (255 * PITCH * PITCH);
          if (coverage === 0) continue;

          pixelContext.globalAlpha = Math.pow(coverage, 0.55);
          pixelContext.beginPath();
          pixelContext.arc(
            column * PITCH + PITCH / 2,
            row * PITCH + PITCH / 2,
            1.05,
            0,
            Math.PI * 2
          );
          pixelContext.fill();
        }
      }

      // Bloom uses the continuous letter coverage, so light spreads between dots.
      // This stays offscreen; bloom and emitters are composited in the same frame.
      bloomContext.clearRect(0, 0, width, HEIGHT);
      bloomContext.drawImage(mask, 0, 0, mask.width, mask.height);
      bloomContext.globalCompositeOperation = 'source-in';
      bloomContext.fillStyle = ink;
      bloomContext.fillRect(0, 0, width, HEIGHT);
      bloomContext.globalCompositeOperation = 'source-over';

      context.clearRect(0, 0, width, HEIGHT);
      // Draw only the tinted shadow of the letter coverage. Moving its source
      // above the canvas avoids adding a second solid copy of the lettering.
      const dpr = context.getTransform().a;
      context.save();
      context.shadowColor = ink;
      context.shadowOffsetY = HEIGHT * 2 * dpr;
      // Layer the same tinted halos to raise intensity without shifting hue.
      for (let pass = 0; pass < 2; pass++) {
        context.shadowBlur = 14 * dpr;
        context.globalAlpha = 0.9;
        context.drawImage(bloomCanvas, 0, -HEIGHT * 2, width, HEIGHT);
        context.shadowBlur = 5 * dpr;
        context.globalAlpha = 0.7;
        context.drawImage(bloomCanvas, 0, -HEIGHT * 2, width, HEIGHT);
      }

      context.restore();
      context.drawImage(pixels, 0, 0, width, HEIGHT);

      if (
        !disposed &&
        inView &&
        !document.hidden &&
        !reducedMotion &&
        velocity > 0
      ) {
        frame = requestAnimationFrame(draw);
      }
    };

    const restart = () => {
      cancelAnimationFrame(frame);
      previousTime = 0;
      if (width > 0 && inView && !document.hidden) draw(0);
    };

    const resize = () => {
      width = canvas.getBoundingClientRect().width;
      if (!width) return;

      const dpr = window.devicePixelRatio || 1;
      const style = getComputedStyle(label);
      font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      ink = style.color;
      bloomCanvas.width = canvas.width = pixels.width = Math.ceil(width * dpr);
      bloomCanvas.height =
        canvas.height =
        pixels.height =
          Math.ceil(HEIGHT * dpr);
      bloomContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      pixelContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      mask.width = Math.ceil(width / PITCH) * PITCH;
      mask.height = Math.ceil(HEIGHT / PITCH) * PITCH;
      maskContext.font = font;
      repeatWidth = Math.max(
        PITCH,
        Math.ceil(maskContext.measureText(message).width / SCROLL_STEP) *
          SCROLL_STEP
      );
      restart();
      setReady(true);
    };

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      restart();
    });

    void document.fonts.ready.then(() => {
      if (disposed) return;
      resize();
      resizeObserver.observe(canvas);
      intersectionObserver.observe(canvas);
    });
    document.addEventListener('visibilitychange', restart);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', restart);
    };
  }, [activeColor, displayText, reducedMotion, speed]);

  return (
    <Box
      as="button"
      type="button"
      aria-label={`Supporters: ${displayText}${color ? '' : '. Change display color'}`}
      onClick={() => {
        if (!color) setColorIndex((index) => (index + 1) % COLORS.length);
      }}
      style={{ color: activeColor }}
      css={{
        appearance: 'none',
        position: 'relative',
        display: 'block',
        width: '100%',
        height: HEIGHT,
        padding: 0,
        overflow: 'hidden',
        borderRadius: 'var(--border-radius-2)',
        border: '1px solid var(--border-color)',
        backgroundColor: '#080c0c',
        backgroundImage:
          'radial-gradient(circle, rgba(180, 210, 200, 0.07) 1px, transparent 1.2px)',
        backgroundSize: `${PITCH}px ${PITCH}px`,
        boxShadow: 'inset 0 2px 5px #000, 0 1px 0 rgba(255,255,255,0.06)',
        cursor: color ? 'default' : 'pointer',
        '&:focus-visible': {
          outline: '2px solid var(--blue-700)',
          outlineOffset: '3px',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-70%',
          left: '-10%',
          width: '100%',
          height: '200%',
          background:
            'linear-gradient(10deg, transparent 30%, rgba(200,200,200,0.18), transparent 70%)',
          filter: 'blur(10px)',
          transform: 'skewX(-60deg)',
          pointerEvents: 'none',
          zIndex: 1,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          borderRadius: 'inherit',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.8)',
          background:
            'linear-gradient(to bottom, rgba(200,200,200,0.17) 0%, rgba(200,200,200,0.035) 15%, transparent 40%, transparent 60%, rgba(200,200,200,0.05) 85%, rgba(200,200,200,0.07) 100%), linear-gradient(90deg, rgba(0,0,0,0.5), transparent 5%, transparent 95%, rgba(0,0,0,0.5))',
        },
      }}
    >
      <Text
        ref={textRef}
        as="span"
        family="mono"
        aria-hidden="true"
        css={{
          position: 'absolute',
          left: 0,
          top: 0,
          lineHeight: `${HEIGHT}px`,
          fontSize: '38px',
          fontWeight: 400,
          color: 'inherit',
          whiteSpace: 'nowrap',
          opacity: ready ? 0 : 1,
          pointerEvents: 'none',
        }}
      >
        {displayText.toLocaleUpperCase()}
      </Text>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ display: 'block', width: '100%', height: HEIGHT }}
      />
    </Box>
  );
};
