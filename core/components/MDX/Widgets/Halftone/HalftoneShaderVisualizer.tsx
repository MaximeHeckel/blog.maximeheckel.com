import {
  Box,
  Card,
  Flex,
  GlassMaterial,
  Shadows,
  Text,
} from '@maximeheckel/design-system';
import { useInView } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import Fullbleed from '@core/components/Fullbleed';

const GRID_SIZE = 20;
const HIDE_DELAY_MS = 750;

const VERTEX_SHADER = `
precision highp float;

attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const DEFAULT_FRAGMENT_SHADER = `
precision highp float;

varying vec2 v_uv;

uniform float u_time;
uniform vec2 u_resolution;

void main() {
  vec2 cellUv = fract(v_uv * 10.0);
  float circle = smoothstep(0.39, 0.41, distance(cellUv, vec2(0.5)));
  vec3 color = mix(vec3(0.6), vec3(0.0, 0.0, 0.0), circle);
  gl_FragColor = vec4(color, 1.0);
}
`;

interface WebGLRendererState {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  vao: WebGLVertexArrayObject;
  uniforms: {
    resolution: WebGLUniformLocation | null;
  };
}

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string
): WebGLProgram | null {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  // Clean up shaders after linking
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return program;
}

function createFullscreenQuad(
  gl: WebGL2RenderingContext,
  program: WebGLProgram
): WebGLVertexArrayObject | null {
  const vao = gl.createVertexArray();
  if (!vao) return null;

  gl.bindVertexArray(vao);

  // Fullscreen quad vertices (two triangles)
  const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const positionLoc = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(positionLoc);
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

  gl.bindVertexArray(null);

  return vao;
}

// Helper function to calculate grid point from mouse position
function calculateGridPoint(
  clientX: number,
  clientY: number,
  rect: DOMRect
): {
  point: { x: number; y: number };
  screenPos: { x: number; y: number };
} {
  const mouseX = (clientX - rect.left) / rect.width;
  const mouseY = (clientY - rect.top) / rect.height;

  // Find closest grid point
  const closestX = Math.round(mouseX * GRID_SIZE);
  const closestY = Math.round((1 - mouseY) * GRID_SIZE); // Flip Y

  // Clamp to grid bounds
  const x = Math.max(0, Math.min(GRID_SIZE, closestX));
  const y = Math.max(0, Math.min(GRID_SIZE, closestY));

  // Calculate screen position of the grid point
  const pointScreenX = rect.left + (x / GRID_SIZE) * rect.width;
  const pointScreenY = rect.top + (1 - y / GRID_SIZE) * rect.height;

  return {
    point: { x, y },
    screenPos: { x: pointScreenX, y: pointScreenY },
  };
}

const GridOverlay = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isFading, setIsFading] = useState(false);
  const [isOutside, setIsOutside] = useState(false);

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const { point, screenPos } = calculateGridPoint(e.clientX, e.clientY, rect);

    setHoveredPoint(point);
    setTooltipPosition(screenPos);
  }, []);

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
        setHoveredPoint(null);
        setTooltipPosition(null);
        setIsFading(false);
        setIsOutside(false);
      }, 300);
    }, HIDE_DELAY_MS);
  }, [clearHideTimeout]);

  // Track mouse movement outside the grid
  useEffect(() => {
    if (!isOutside || !hoveredPoint) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const { point, screenPos } = calculateGridPoint(
        e.clientX,
        e.clientY,
        rect
      );

      setHoveredPoint(point);
      setTooltipPosition(screenPos);

      // Reset the hide timer on mouse movement
      clearHideTimeout();
      hideTimeoutRef.current = setTimeout(() => {
        setIsFading(true);
        setTimeout(() => {
          setHoveredPoint(null);
          setTooltipPosition(null);
          setIsFading(false);
          setIsOutside(false);
        }, 300);
      }, HIDE_DELAY_MS);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
    };
  }, [isOutside, hoveredPoint, clearHideTimeout]);

  // Cleanup timeout on unmount
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
        {/* Grid lines */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        >
          {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={(i / GRID_SIZE) * 100}
              y1={0}
              x2={(i / GRID_SIZE) * 100}
              y2={100}
              stroke="var(--border-color)"
              strokeWidth={0.5}
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1={0}
              y1={(i / GRID_SIZE) * 100}
              x2={100}
              y2={(i / GRID_SIZE) * 100}
              stroke="var(--border-color)"
              strokeWidth={0.5}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      </Box>

      {/* Dot indicator rendered via portal to avoid overflow clipping */}
      {hoveredPoint &&
        tooltipPosition &&
        typeof document !== 'undefined' &&
        createPortal(
          <Box
            css={{
              position: 'fixed',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 9998,
              transition:
                'left 0.05s ease-out, top 0.05s ease-out, opacity 0.3s ease-out',
            }}
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
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
          </Box>,
          document.body
        )}

      {/* Tooltip rendered via portal to avoid overflow clipping */}
      {hoveredPoint &&
        tooltipPosition &&
        typeof document !== 'undefined' &&
        createPortal(
          <Box
            css={{
              position: 'fixed',
              transform: 'translate(-50%, calc(-100% - 12px))',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 9999,
              transition:
                'opacity 0.3s ease-out, left 0.05s ease-out, top 0.05s ease-out',
            }}
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
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
                {(hoveredPoint.x / GRID_SIZE).toFixed(2)},{' '}
                {(hoveredPoint.y / GRID_SIZE).toFixed(2)}
              </Text>
            </Box>
          </Box>,
          document.body
        )}
    </>
  );
};

interface ShaderCanvasProps {
  fragmentShader: string;
}

const ShaderCanvas = ({ fragmentShader }: ShaderCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<WebGLRendererState | null>(null);
  const animationFrameRef = useRef<number>(0);
  const isInView = useInView(canvasRef);

  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const gl = canvas.getContext('webgl2', {
      antialias: true,
      alpha: false,
    });

    if (!gl) {
      return null;
    }

    const program = createProgram(gl, VERTEX_SHADER, fragmentShader);
    if (!program) return null;

    const vao = createFullscreenQuad(gl, program);
    if (!vao) return null;

    const uniforms = {
      resolution: gl.getUniformLocation(program, 'u_resolution'),
    };

    return { gl, program, vao, uniforms };
  }, [fragmentShader]);

  const render = useCallback(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    const { gl, program, vao, uniforms } = renderer;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle canvas resize
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio, 2);

    if (
      canvas.width !== displayWidth * dpr ||
      canvas.height !== displayHeight * dpr
    ) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.bindVertexArray(vao);

    if (uniforms.resolution !== null) {
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    }

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    animationFrameRef.current = requestAnimationFrame(render);
  }, []);

  useEffect(() => {
    const renderer = initWebGL();
    if (renderer && isInView) {
      rendererRef.current = renderer;
      animationFrameRef.current = requestAnimationFrame(render);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = 0;
      }
      if (rendererRef.current) {
        const { gl, program, vao } = rendererRef.current;
        gl.deleteVertexArray(vao);
        gl.deleteProgram(program);
      }
    };
  }, [initWebGL, render, isInView]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
};

interface HalftoneShaderVisualizerProps {
  fragmentShader?: string;
}

export const HalftoneShaderVisualizer = (
  props: HalftoneShaderVisualizerProps
) => {
  const { fragmentShader = DEFAULT_FRAGMENT_SHADER } = props;

  return (
    <Fullbleed widthPercent={90}>
      <Card css={{ width: '100%' }}>
        <Card.Body
          as={Flex}
          direction="row"
          gap="5"
          css={{
            '@media (max-width: 550px)': {
              flexDirection: 'column',
            },
          }}
        >
          {/* Left column - Controls placeholder */}
          <Flex
            direction="column"
            gap="4"
            css={{
              flex: 1,
              minWidth: 0,
            }}
          ></Flex>

          {/* Right column - WebGL Canvas */}
          <Flex
            alignItems="center"
            justifyContent="end"
            css={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <Box
              css={{
                position: 'relative',
                width: '100%',
                aspectRatio: '1 / 1',
                maxWidth: '500px',
                borderRadius: 'var(--border-radius-1)',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
              }}
            >
              <ShaderCanvas fragmentShader={fragmentShader} />
              <GridOverlay />
            </Box>
          </Flex>
        </Card.Body>
      </Card>
    </Fullbleed>
  );
};
