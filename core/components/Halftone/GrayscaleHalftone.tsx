import React from 'react';

interface GrayscaleHalftoneProps {
  imageUrl: string;
  dotSize?: number;
  width?: number;
  height?: number;
  rotation?: number;
  style?: React.CSSProperties;
}

// Helper function to get average brightness of a cell
const getAverageBrightness = (
  imageData: ImageData,
  startX: number,
  startY: number,
  size: number,
  canvasWidth: number,
  canvasHeight: number
): number => {
  let totalBrightness = 0;
  let count = 0;

  for (let y = startY; y < startY + size && y < canvasHeight; y++) {
    for (let x = startX; x < startX + size && x < canvasWidth; x++) {
      // Skip if out of bounds
      if (x < 0 || y < 0 || x >= canvasWidth || y >= canvasHeight) continue;

      const index = (y * canvasWidth + x) * 4;
      const r = imageData.data[index];
      const g = imageData.data[index + 1];
      const b = imageData.data[index + 2];

      // Convert to grayscale using luminance formula
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      totalBrightness += brightness;
      count++;
    }
  }

  return count > 0 ? totalBrightness / count : 255;
};

export const GrayscaleHalftone = ({
  imageUrl,
  dotSize = 8,
  width = 800,
  height = 800,
  rotation = Math.PI / 4,
  style,
}: GrayscaleHalftoneProps) => {
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

      // Draw the original image temporarily to sample pixels (centered and covering)
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

      // Draw halftone dots
      ctx.fillStyle = 'black';

      // Apply rotation if specified
      if (rotation !== 0) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rotation);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }

      // Calculate bounds to cover entire canvas when rotated
      // We need to draw beyond the canvas edges to ensure full coverage after rotation
      const diagonal = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
      const startX = (canvas.width - diagonal) / 2 - dotSize;
      const startY = (canvas.height - diagonal) / 2 - dotSize;
      const endX = startX + diagonal + dotSize * 2;
      const endY = startY + diagonal + dotSize * 2;

      // Pre-calculate rotation constants for inverse transform
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const cosAngle = Math.cos(-rotation); // Negative to reverse rotation
      const sinAngle = Math.sin(-rotation);

      for (let y = startY; y < endY; y += dotSize) {
        for (let x = startX; x < endX; x += dotSize) {
          const dotCenterX = x + dotSize / 2;
          const dotCenterY = y + dotSize / 2;

          // Transform the dot position back to canvas space to sample brightness
          // (inverse rotation to find what pixel this rotated dot corresponds to)
          const translatedX = dotCenterX - centerX;
          const translatedY = dotCenterY - centerY;
          const sampleX =
            translatedX * cosAngle + translatedY * sinAngle + centerX;
          const sampleY =
            -translatedX * sinAngle + translatedY * cosAngle + centerY;

          // Sample the brightness at the actual canvas position
          const brightness = getAverageBrightness(
            imageData,
            Math.floor(sampleX),
            Math.floor(sampleY),
            dotSize,
            canvas.width,
            canvas.height
          );

          // Convert brightness to dot radius (darker = larger dot)
          // brightness is 0-255, we want 0 (black) to create large dots
          const normalizedBrightness = brightness / 255;
          const radius = (dotSize / 2) * (1 - normalizedBrightness);

          // Draw the dot in rotated space
          if (radius > 0) {
            ctx.beginPath();
            ctx.arc(dotCenterX, dotCenterY, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Restore canvas state if rotation was applied
      if (rotation !== 0) {
        ctx.restore();
      }
    };

    img.onerror = () => {
      // eslint-disable-next-line no-console
      console.error('Failed to load image');
    };

    img.src = imageUrl;
  }, [dotSize, imageUrl, width, height, rotation]);

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
