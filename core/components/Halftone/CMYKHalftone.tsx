import React from 'react';

interface CMYKHalftoneProps {
  imageUrl: string;
  dotSize?: number;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  cyanAngle?: number;
  magentaAngle?: number;
  yellowAngle?: number;
  blackAngle?: number;
}

// Helper function to convert RGB to CMYK
const rgbToCmyk = (r: number, g: number, b: number) => {
  // Normalize RGB values
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  // Calculate K (black)
  const k = 1 - Math.max(rNorm, gNorm, bNorm);

  // Avoid division by zero
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 1 };
  }

  // Calculate CMY
  const c = (1 - rNorm - k) / (1 - k);
  const m = (1 - gNorm - k) / (1 - k);
  const y = (1 - bNorm - k) / (1 - k);

  return { c, m, y, k };
};

// Helper function to get average CMYK values of a cell
const getAverageCMYK = (
  imageData: ImageData,
  startX: number,
  startY: number,
  size: number,
  canvasWidth: number,
  canvasHeight: number
): { c: number; m: number; y: number; k: number } => {
  let totalC = 0,
    totalM = 0,
    totalY = 0,
    totalK = 0;
  let count = 0;

  for (let y = startY; y < startY + size && y < canvasHeight; y++) {
    for (let x = startX; x < startX + size && x < canvasWidth; x++) {
      if (x < 0 || y < 0 || x >= canvasWidth || y >= canvasHeight) continue;

      const index = (y * canvasWidth + x) * 4;
      const r = imageData.data[index];
      const g = imageData.data[index + 1];
      const b = imageData.data[index + 2];

      const cmyk = rgbToCmyk(r, g, b);
      totalC += cmyk.c;
      totalM += cmyk.m;
      totalY += cmyk.y;
      totalK += cmyk.k;
      count++;
    }
  }

  return count > 0
    ? {
        c: totalC / count,
        m: totalM / count,
        y: totalY / count,
        k: totalK / count,
      }
    : { c: 0, m: 0, y: 0, k: 0 };
};

// Helper to draw a halftone layer for a single channel
const drawHalftoneLayer = (
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  canvasWidth: number,
  canvasHeight: number,
  dotSize: number,
  rotation: number,
  channel: 'c' | 'm' | 'y' | 'k',
  color: string
) => {
  ctx.save();
  ctx.fillStyle = color;

  // Apply rotation
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.rotate(rotation);
  ctx.translate(-canvasWidth / 2, -canvasHeight / 2);

  // Calculate bounds to cover entire canvas when rotated
  const diagonal = Math.sqrt(canvasWidth ** 2 + canvasHeight ** 2);
  const startX = (canvasWidth - diagonal) / 2 - dotSize;
  const startY = (canvasHeight - diagonal) / 2 - dotSize;
  const endX = startX + diagonal + dotSize * 2;
  const endY = startY + diagonal + dotSize * 2;

  // Pre-calculate rotation constants for inverse transform
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const cosAngle = Math.cos(-rotation);
  const sinAngle = Math.sin(-rotation);

  for (let y = startY; y < endY; y += dotSize) {
    for (let x = startX; x < endX; x += dotSize) {
      const dotCenterX = x + dotSize / 2;
      const dotCenterY = y + dotSize / 2;

      // Transform the dot position back to canvas space
      const translatedX = dotCenterX - centerX;
      const translatedY = dotCenterY - centerY;
      const sampleX = translatedX * cosAngle + translatedY * sinAngle + centerX;
      const sampleY =
        -translatedX * sinAngle + translatedY * cosAngle + centerY;

      // Sample the CMYK values at the actual canvas position
      const cmyk = getAverageCMYK(
        imageData,
        Math.floor(sampleX),
        Math.floor(sampleY),
        dotSize,
        canvasWidth,
        canvasHeight
      );

      // Get the value for the current channel
      const channelValue = cmyk[channel] * 0.85;

      // Convert channel value to dot radius (higher value = larger dot)
      const radius = dotSize * channelValue;

      // Draw the dot
      if (radius > 0.1) {
        ctx.beginPath();
        ctx.arc(dotCenterX, dotCenterY, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
};

export const CMYKHalftone = ({
  imageUrl,
  dotSize = 8,
  width = 800,
  height = 800,
  style,
  cyanAngle = 15,
  magentaAngle = 75,
  yellowAngle = 0,
  blackAngle = 45,
}: CMYKHalftoneProps) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // Set canvas size
      const canvasWidth = width;
      const canvasHeight = height;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Calculate scaling to fill canvas (cover behavior)
      const scale = Math.max(
        canvasWidth / img.width,
        canvasHeight / img.height
      );

      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;

      // Center the image
      const offsetX = (canvasWidth - scaledWidth) / 2;
      const offsetY = (canvasHeight - scaledHeight) / 2;

      // Draw the original image temporarily to sample pixels
      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        offsetX,
        offsetY,
        scaledWidth,
        scaledHeight
      );
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Clear canvas and set white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalCompositeOperation = 'multiply';

      // Standard halftone screen angles (in radians)
      // These angles are chosen to minimize moiré patterns
      const angles = {
        c: (cyanAngle * Math.PI) / 180, // Cyan
        m: (magentaAngle * Math.PI) / 180, // Magenta
        y: (yellowAngle * Math.PI) / 180, // Yellow
        k: (blackAngle * Math.PI) / 180, // Black
      };

      // Draw each CMYK layer with pure subtractive primaries
      // Using fully saturated colors because multiply blend mode simulates ink mixing
      drawHalftoneLayer(
        ctx,
        imageData,
        canvasWidth,
        canvasHeight,
        dotSize,
        angles.c,
        'c',
        'rgb(0, 255, 255)' // Pure Cyan
      );
      drawHalftoneLayer(
        ctx,
        imageData,
        canvasWidth,
        canvasHeight,
        dotSize,
        angles.m,
        'm',
        'rgb(255, 0, 255)' // Pure Magenta
      );
      drawHalftoneLayer(
        ctx,
        imageData,
        canvasWidth,
        canvasHeight,
        dotSize,
        angles.y,
        'y',
        'rgb(255, 255, 0)' // Pure Yellow
      );
      drawHalftoneLayer(
        ctx,
        imageData,
        canvasWidth,
        canvasHeight,
        dotSize,
        angles.k,
        'k',
        'rgb(0, 0, 0)' // Black
      );

      // Reset composite operation
      ctx.globalCompositeOperation = 'source-over';
    };

    img.onerror = () => {
      // eslint-disable-next-line no-console
      console.error('Failed to load image');
    };

    img.src = imageUrl;
  }, [
    dotSize,
    imageUrl,
    width,
    height,
    cyanAngle,
    magentaAngle,
    yellowAngle,
    blackAngle,
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        maxWidth: '100%',
        height: 'auto',
        ...style,
      }}
    />
  );
};
