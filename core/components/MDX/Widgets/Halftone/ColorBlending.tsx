import { Box, Card, Flex } from '@maximeheckel/design-system';
import React, { useEffect, useRef, useState, useCallback } from 'react';

import Fullbleed from '@core/components/Fullbleed';

interface ColorBlendingProps {
  mode: 'RGB' | 'CMY';
  width?: number;
  height?: number;
  circleRadius?: number;
  style?: React.CSSProperties;
}

interface Circle {
  x: number;
  y: number;
  color: string;
}

const ColorBlendingCanvas: React.FC<ColorBlendingProps> = ({
  mode,
  width = 700,
  height = 400,
  circleRadius = 94,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const [hoveredCircle, setHoveredCircle] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  // Use device pixel ratio for better antialiasing
  const [dpr, setDpr] = useState(1);

  // Set DPR after mount to avoid SSR issues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDpr(window.devicePixelRatio || 1);
    }
  }, []);

  // Initialize circle positions
  const [circles, setCircles] = useState<Circle[]>(() => {
    const centerX = width / 2;
    const centerY = height / 2;
    const offset = circleRadius * 0.7;

    // Top circle
    const topX = centerX;
    const topY = centerY - offset;

    // Bottom-left circle
    const bottomLeftX = centerX - offset * Math.cos(Math.PI / 6);
    const bottomLeftY = centerY + offset * Math.sin(Math.PI / 6);

    // Bottom-right circle
    const bottomRightX = centerX + offset * Math.cos(Math.PI / 6);
    const bottomRightY = centerY + offset * Math.sin(Math.PI / 6);

    if (mode === 'RGB') {
      return [
        { x: topX, y: topY, color: 'rgba(255, 0, 0, 0.6)' }, // Red
        { x: bottomRightX, y: bottomRightY, color: 'rgba(0, 255, 0, 0.6)' }, // Green
        { x: bottomLeftX, y: bottomLeftY, color: 'rgba(0, 0, 255, 0.6)' }, // Blue
      ];
    } else {
      return [
        { x: topX, y: topY, color: 'rgba(255, 0, 225, 0.6)' }, // Magenta
        { x: bottomLeftX, y: bottomLeftY, color: 'rgba(0, 255, 225, 0.6)' }, // Cyan
        { x: bottomRightX, y: bottomRightY, color: 'rgba(255, 225, 0, 0.6)' }, // Yellow
      ];
    }
  });

  // Draw function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Enable antialiasing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Clear canvas (using scaled dimensions)
    ctx.clearRect(0, 0, width * dpr, height * dpr);

    // Fill background
    if (mode === 'RGB') {
      ctx.fillStyle = '#10101A';
    } else {
      ctx.fillStyle = '#E5E7EA';
    }
    ctx.fillRect(0, 0, width * dpr, height * dpr);

    // Draw dot matrix pattern
    const dotSize = 0.75 * dpr;
    const dotSpacing = 7.5 * dpr;
    if (mode === 'RGB') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.0525)';
    } else {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.0525)';
    }

    for (let x = 0; x < width * dpr; x += dotSpacing) {
      for (let y = 0; y < height * dpr; y += dotSpacing) {
        ctx.beginPath();
        ctx.arc(
          x + dotSpacing / 2,
          y + dotSpacing / 2,
          dotSize,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }

    // First pass: Draw shadows
    ctx.save();
    circles.forEach((circle) => {
      // Parse RGB values from the circle color and create shadow with 0.3 opacity
      const rgbaMatch = circle.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      let shadowColor = 'rgba(0, 0, 0, 0.3)';

      if (rgbaMatch) {
        const r = rgbaMatch[1];
        const g = rgbaMatch[2];
        const b = rgbaMatch[3];
        shadowColor = `rgba(${r}, ${g}, ${b}, 0.4)`;
      }

      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = 15 * dpr;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 20 * dpr;
      ctx.fillStyle = circle.color;
      ctx.beginPath();
      ctx.arc(
        circle.x * dpr,
        circle.y * dpr,
        circleRadius * dpr,
        0,
        Math.PI * 2
      );
      ctx.fill();
      // Reset shadow for next iteration
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    });
    ctx.restore();

    // Second shadow
    ctx.save();
    circles.forEach((circle) => {
      // Parse RGB values from the circle color and create shadow with 0.3 opacity
      const rgbaMatch = circle.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      let shadowColor = 'rgba(0, 0, 0, 0.3)';

      if (rgbaMatch) {
        const r = rgbaMatch[1];
        const g = rgbaMatch[2];
        const b = rgbaMatch[3];
        shadowColor = `rgba(${r}, ${g}, ${b}, 0.4)`;
      }

      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = 25 * dpr;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 45 * dpr;
      ctx.fillStyle = circle.color;
      ctx.beginPath();
      ctx.arc(
        circle.x * dpr,
        circle.y * dpr,
        circleRadius * dpr,
        0,
        Math.PI * 2
      );
      ctx.fill();
      // Reset shadow for next iteration
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    });
    ctx.restore();

    // Second pass: Draw main circles with blending
    ctx.save();
    if (mode === 'RGB') {
      ctx.globalCompositeOperation = 'lighter';
    } else {
      ctx.globalCompositeOperation = 'multiply';
    }

    circles.forEach((circle) => {
      ctx.fillStyle = circle.color;
      ctx.beginPath();
      ctx.arc(
        circle.x * dpr,
        circle.y * dpr,
        circleRadius * dpr,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
    ctx.restore();

    // Third pass: Add rim lighting and subtle glow
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    circles.forEach((circle) => {
      // Rim light gradient
      const rimGradient = ctx.createRadialGradient(
        circle.x * dpr + circleRadius * dpr * 0.02,
        circle.y * dpr + circleRadius * dpr * 0.05, // Offset light source
        circleRadius * dpr * 0.9,
        circle.x * dpr,
        circle.y * dpr,
        circleRadius * dpr * 1.0
      );

      // Create a subtle rim light effect
      rimGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
      rimGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
      rimGradient.addColorStop(0.85, 'rgba(255, 255, 255, 0.25)');
      rimGradient.addColorStop(0.95, 'rgba(255, 255, 255, 0.45)');
      rimGradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

      ctx.fillStyle = rimGradient;
      ctx.beginPath();
      ctx.arc(
        circle.x * dpr,
        circle.y * dpr,
        circleRadius * dpr,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
    ctx.restore();

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
  }, [circles, width, height, circleRadius, mode, dpr]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Helper function to get mouse position relative to canvas
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Check if mouse is over a circle
  const getCircleAtPoint = useCallback(
    (x: number, y: number): number | null => {
      for (let i = circles.length - 1; i >= 0; i--) {
        const circle = circles[i];
        const dx = x - circle.x;
        const dy = y - circle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= circleRadius) {
          return i;
        }
      }
      return null;
    },
    [circles, circleRadius]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    const circleIndex = getCircleAtPoint(pos.x, pos.y);

    if (circleIndex !== null) {
      const circle = circles[circleIndex];
      setDragOffset({
        x: pos.x - circle.x,
        y: pos.y - circle.y,
      });
      setIsDragging(circleIndex);
    }
  };

  // Attach touch event listeners manually with passive: false
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;
      const touch = e.touches[0];

      const pos = {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };

      const circleIndex = getCircleAtPoint(pos.x, pos.y);

      if (circleIndex !== null) {
        const circle = circles[circleIndex];
        setDragOffset({
          x: pos.x - circle.x,
          y: pos.y - circle.y,
        });
        setIsDragging(circleIndex);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;
      const touch = e.touches[0];

      const pos = {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };

      setCircles((prev) =>
        prev.map((circle, index) =>
          index === isDragging
            ? { ...circle, x: pos.x - dragOffset.x, y: pos.y - dragOffset.y }
            : circle
        )
      );
    };

    const handleTouchEnd = () => {
      setIsDragging(null);
    };

    // Add event listeners with passive: false
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    // Cleanup
    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    width,
    circles,
    isDragging,
    dragOffset,
    circleRadius,
    height,
    getCircleAtPoint,
  ]);

  // Mouse move handler
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    if (isDragging !== null) {
      setCircles((prev) =>
        prev.map((circle, index) =>
          index === isDragging
            ? { ...circle, x: pos.x - dragOffset.x, y: pos.y - dragOffset.y }
            : circle
        )
      );
    } else {
      // Check hover state
      const circleIndex = getCircleAtPoint(pos.x, pos.y);
      setHoveredCircle(circleIndex);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const handleMouseLeave = () => {
    setIsDragging(null);
    setHoveredCircle(null);
  };

  return (
    <Box
      css={{
        borderRadius: 'var(--border-radius-2)',
        overflow: 'hidden',
        display: 'flex',
      }}
    >
      <canvas
        ref={canvasRef}
        width={width * dpr}
        height={height * dpr}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          width: '100%',
          height: 'auto',
          maxWidth: '100%',
          cursor:
            isDragging !== null
              ? 'grabbing'
              : hoveredCircle !== null
                ? 'grab'
                : 'default',
          touchAction: 'none', // Prevent default touch actions
          ...style,
        }}
      />
    </Box>
  );
};

export const ColorBlending = () => {
  return (
    <Fullbleed widthPercent={70}>
      <Card>
        <Card.Body
          as={Flex}
          direction={{
            '@md': 'row',
            '@initial': 'column',
          }}
          gap="2"
        >
          <ColorBlendingCanvas mode="RGB" />
          <ColorBlendingCanvas mode="CMY" />
        </Card.Body>
      </Card>
    </Fullbleed>
  );
};
