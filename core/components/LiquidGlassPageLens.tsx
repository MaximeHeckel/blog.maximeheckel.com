import { Box } from '@maximeheckel/design-system';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { PointerEvent, ReactNode } from 'react';

interface LiquidGlassLens {
  width: number;
  height: number;
  borderRadius: number;
  scale: number;
  depth: number;
  curvature: number;
  chroma: number;
  edgeSize: number;
  refraction: number;
  splay: number;
}

interface Bounds {
  width: number;
  height: number;
}

interface Coordinates {
  x: number;
  y: number;
}

interface DisplacementMap {
  src: string;
  version: number;
}

interface LiquidGlassPageLensProps {
  children: ReactNode;
}

const LIQUID_GLASS_LENS: LiquidGlassLens = {
  width: 250,
  height: 150,
  borderRadius: 150,
  scale: 0.1,
  depth: 10,
  curvature: 0.95,
  chroma: 0.5,
  edgeSize: 20,
  refraction: 3.2,
  splay: 0.75,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const generateLiquidGlassMap = (
  lens: LiquidGlassLens,
  position: Coordinates
) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const width = Math.max(1, LIQUID_GLASS_LENS.width);
  const height = Math.max(1, LIQUID_GLASS_LENS.height);

  canvas.width = width;
  canvas.height = height;

  if (!context) {
    return '';
  }

  const imageData = context.createImageData(width, height);
  const data = imageData.data;

  for (let index = 0; index < data.length; index += 4) {
    data[index] = 128;
    data[index + 1] = 128;
    data[index + 2] = 128;
    data[index + 3] = 255;
  }

  const centerX = position.x + lens.width / 2;
  const centerY = position.y + lens.height / 2;
  const radius = Math.min(lens.borderRadius, lens.width / 2, lens.height / 2);
  const innerWidth = lens.width / 2 - radius;
  const innerHeight = lens.height / 2 - radius;
  const startX = Math.max(0, Math.floor(position.x));
  const startY = Math.max(0, Math.floor(position.y));
  const endX = Math.min(width, Math.ceil(position.x + lens.width));
  const endY = Math.min(height, Math.ceil(position.y + lens.height));

  for (let y = startY; y < endY; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      const index = (y * width + x) * 4;
      const px = Math.abs(x - centerX);
      const py = Math.abs(y - centerY);
      const cornerX = Math.max(px - innerWidth, 0);
      const cornerY = Math.max(py - innerHeight, 0);
      const distanceOutsideCorner = Math.hypot(cornerX, cornerY) - radius;
      const isInsideLens = distanceOutsideCorner <= 0;

      if (!isInsideLens) {
        continue;
      }

      const distanceToEdge = Math.abs(distanceOutsideCorner);
      const edgeProgress = Math.max(
        0,
        1 - Math.min(1, distanceToEdge / lens.edgeSize)
      );
      const cornerAmount = Math.min(1, Math.hypot(cornerX, cornerY) / radius);
      const horizontalSideAmount = py > innerHeight && px <= innerWidth ? 1 : 0;
      const verticalSideAmount = px > innerWidth && py <= innerHeight ? 1 : 0;
      const sideAmount = Math.max(horizontalSideAmount, verticalSideAmount);

      const normalX =
        cornerX > 0
          ? (cornerX / Math.max(1, Math.hypot(cornerX, cornerY))) *
            Math.sign(x - centerX)
          : verticalSideAmount * Math.sign(x - centerX);
      const normalY =
        cornerY > 0
          ? (cornerY / Math.max(1, Math.hypot(cornerX, cornerY))) *
            Math.sign(y - centerY)
          : horizontalSideAmount * Math.sign(y - centerY);
      const edgeBend =
        Math.pow(edgeProgress, 1 / lens.curvature) *
        (0.74 + cornerAmount * 0.64 + sideAmount * 0.24) *
        lens.depth *
        lens.scale;

      data[index] = Math.round(128 + normalX * edgeBend * 127 * lens.splay);
      data[index + 1] = Math.round(128 + normalY * edgeBend * 127);
    }
  }

  context.putImageData(imageData, 0, 0);

  return canvas.toDataURL('image/png');
};

const LiquidGlassPageLens = (props: LiquidGlassPageLensProps) => {
  const { children } = props;
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const dragOffsetRef = useRef<Coordinates>({ x: 0, y: 0 });
  const generatedId = useId();
  const filterBaseId = useMemo(
    () => generatedId.replace(/[^a-zA-Z0-9_-]/g, ''),
    [generatedId]
  );
  const [bounds, setBounds] = useState<Bounds>({ width: 0, height: 0 });
  const [displacementMap, setDisplacementMap] = useState<DisplacementMap>({
    src: '',
    version: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [lensPosition, setLensPosition] = useState<Coordinates>({
    x: 96,
    y: 128,
  });

  useEffect(() => {
    const wrapper = wrapperRef.current;

    if (!wrapper) {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      const nextBounds = entry.contentRect;

      setBounds({
        width: nextBounds.width,
        height: nextBounds.height,
      });
      setLensPosition((position) => ({
        x: clamp(position.x, 0, nextBounds.width - LIQUID_GLASS_LENS.width),
        y: clamp(position.y, 0, nextBounds.height - LIQUID_GLASS_LENS.height),
      }));
    });

    resizeObserver.observe(wrapper);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    setDisplacementMap((currentMap) => ({
      src: generateLiquidGlassMap(LIQUID_GLASS_LENS, lensPosition),
      version: currentMap.version + 1,
    }));
  }, [bounds, lensPosition]);

  const filterId = `${filterBaseId}-liquid-glass-${displacementMap.version}`;

  const moveLens = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !wrapperRef.current) {
      return;
    }

    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    const nextX = event.clientX - wrapperRect.left - dragOffsetRef.current.x;
    const nextY = event.clientY - wrapperRect.top - dragOffsetRef.current.y;

    setLensPosition({
      x: clamp(nextX, 0, bounds.width - LIQUID_GLASS_LENS.width),
      y: clamp(nextY, 0, bounds.height - LIQUID_GLASS_LENS.height),
    });
  };

  const startDragging = (event: PointerEvent<HTMLDivElement>) => {
    if (!wrapperRef.current) {
      return;
    }

    const wrapperRect = wrapperRef.current.getBoundingClientRect();

    event.currentTarget.setPointerCapture(event.pointerId);
    dragOffsetRef.current = {
      x: event.clientX - wrapperRect.left - lensPosition.x,
      y: event.clientY - wrapperRect.top - lensPosition.y,
    };
    setIsDragging(true);
  };

  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setIsDragging(false);
  };

  return (
    <Box
      ref={wrapperRef}
      css={{
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        as="svg"
        aria-hidden="true"
        focusable="false"
        height={bounds.height}
        viewBox={`0 0 ${bounds.width} ${bounds.height}`}
        width={bounds.width}
        css={{
          position: 'absolute',
          width: 0,
          height: 0,
        }}
      >
        <Box
          as="filter"
          id={filterId}
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          primitiveUnits="userSpaceOnUse"
          x={0}
          y={0}
          width={bounds.width}
          height={bounds.height}
        >
          <Box
            as="feImage"
            href={displacementMap.src}
            result="displacementMap"
            width={bounds.width}
            height={bounds.height}
            preserveAspectRatio="none"
          />
          <Box
            as="feDisplacementMap"
            in="SourceGraphic"
            in2="displacementMap"
            result="redShift"
            scale={
              LIQUID_GLASS_LENS.depth *
              LIQUID_GLASS_LENS.refraction *
              (1 + LIQUID_GLASS_LENS.chroma * 0.28)
            }
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <Box
            as="feDisplacementMap"
            in="SourceGraphic"
            in2="displacementMap"
            result="greenShift"
            scale={LIQUID_GLASS_LENS.depth * LIQUID_GLASS_LENS.refraction}
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <Box
            as="feDisplacementMap"
            in="SourceGraphic"
            in2="displacementMap"
            result="blueShift"
            scale={
              LIQUID_GLASS_LENS.depth *
              LIQUID_GLASS_LENS.refraction *
              (1 - LIQUID_GLASS_LENS.chroma * 0.28)
            }
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <Box
            as="feColorMatrix"
            in="redShift"
            result="red"
            type="matrix"
            values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"
          />
          <Box
            as="feColorMatrix"
            in="greenShift"
            result="green"
            type="matrix"
            values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0"
          />
          <Box
            as="feColorMatrix"
            in="blueShift"
            result="blue"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0"
          />
          <Box
            as="feBlend"
            in="red"
            in2="green"
            mode="screen"
            result="redGreen"
          />
          <Box as="feBlend" in="redGreen" in2="blue" mode="screen" />
        </Box>
      </Box>
      <Box
        css={{
          filter: displacementMap.src ? `url(#${filterId})` : undefined,
          WebkitFilter: displacementMap.src ? `url(#${filterId})` : undefined,
          transform: 'translateZ(0)',
        }}
      >
        {children}
      </Box>
      <Box
        aria-hidden="true"
        onPointerCancel={stopDragging}
        onPointerDown={startDragging}
        onPointerMove={moveLens}
        onPointerUp={stopDragging}
        css={{
          position: 'absolute',
          top: lensPosition.y,
          left: lensPosition.x,
          zIndex: 2,
          width: LIQUID_GLASS_LENS.width,
          height: LIQUID_GLASS_LENS.height,
          borderRadius: LIQUID_GLASS_LENS.borderRadius,
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
          boxShadow: `
            inset 0 0 0 1px oklch(from var(--gray-1100) l c h / 16%),
            inset 0 1px 1px oklch(from var(--gray-1100) l c h / 35%),
            inset 0 -14px 24px oklch(from var(--gray-100) l c h / 10%),
            0 12px 30px oklch(from var(--gray-1000) l c h / 18%)
          `,

          '&::before': {
            content: '',
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `
              radial-gradient(circle at 28% 20%, oklch(from var(--gray-1100) l c h / 36%), transparent 18%),
              linear-gradient(135deg, oklch(from var(--gray-1100) l c h / 20%), transparent 34%),
              linear-gradient(180deg, oklch(from var(--blue-400) l c h / 12%), oklch(from var(--gray-100) l c h / 5%))
            `,
            opacity: 0.18,
          },

          '&::after': {
            content: '',
            position: 'absolute',
            inset: 0,
            borderRadius: LIQUID_GLASS_LENS.borderRadius - 1,
            pointerEvents: 'none',
            boxShadow: `
              inset 0 2px 2px oklch(from var(--gray-1100) l c h / 38%),
              inset 0 -2px 2px oklch(from var(--blue-400) l c h / 18%)
            `,
          },
        }}
      />
    </Box>
  );
};

export { LiquidGlassPageLens };
