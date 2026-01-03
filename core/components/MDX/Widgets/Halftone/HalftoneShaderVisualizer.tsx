import {
  Box,
  Card,
  Checkbox,
  Icon,
  IconButton,
  Tooltip,
  Flex,
  GlassMaterial,
  Shadows,
  Text,
} from '@maximeheckel/design-system';
import React, {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import useSound from 'use-sound';

import { HighlightedCodeText } from '@core/components/Code/CodeBlock';
import Fullbleed from '@core/components/Fullbleed';
import {
  ShaderCanvas,
  Uniforms,
} from '@core/components/MDX/Widgets/ShaderCanvas';
import { Select } from '@core/components/Select';
import { Slider } from '@core/components/Slider';

const GRID_SIZE = 12;
const HIDE_DELAY_MS = 550;
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

interface ShaderPlaygroundProps {
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

  return (
    <Fullbleed widthPercent={90}>
      <Card css={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
        <Card.Body
          as={Flex}
          direction="row"
          alignItems="stretch"
          css={{
            padding: 0,
            columnGap: 'var(--space-9)',
            rowGap: 'var(--space-3)',
            '@media (max-width: 700px)': {
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
              flex: hasControls ? 1.75 : 1,
              minWidth: 0,
            }}
          >
            <Box
              css={{
                position: 'relative',
                width: '100%',
                overflow: 'hidden',
                borderLeft: '1px solid var(--border-color)',
              }}
              style={{ aspectRatio }}
            >
              <ShaderCanvas
                fragmentShader={fragmentShader}
                uniforms={uniforms}
              />
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

// const SIMPLE_GRID_FRAGMENT = `precision highp float;
// varying vec2 vUv;
// uniform vec2 uResolution;
// uniform float uRadius;

// void main() {
//   vec2 cellUv = fract(vUv * 10.0);
//   float circle = smoothstep(uRadius - 0.01, uRadius + 0.01, distance(cellUv, vec2(0.5)));
//   vec3 color = mix(vec3(0.4, 0.75, 1.0), vec3(0.0, 0.0, 0.0), circle);
//   gl_FragColor = vec4(color, 1.0);
// }
// `;
// interface HalftoneShaderVisualizerProps {
//   fragmentShader?: string;
// }
//
// export const HalftoneShaderVisualizer = (
//   props: HalftoneShaderVisualizerProps
// ) => {
//   const { fragmentShader = SIMPLE_GRID_FRAGMENT } = props;
//   const [radius, setRadius] = useState(0.4);
//   const deferredRadius = useDeferredValue(radius);

//   return (
//     <ShaderPlayground
//       fragmentShader={fragmentShader}
//       uniforms={{ uRadius: deferredRadius }}
//       showGrid
//     >
//       <Slider
//         id="radius"
//         label="Radius"
//         min={0}
//         max={0.5}
//         step={0.01}
//         value={radius}
//         onChange={setRadius}
//       />
//     </ShaderPlayground>
//   );
// };

const PATTERN_FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform vec2 uResolution;
uniform float uRadius;
uniform float uPixelSize;
uniform sampler2D uTexture;
uniform bool uUsePixelatedUv;
uniform bool uDisplayCircleMask;
uniform bool uDisplayLuma;
uniform bool uGrayscale;

const float textureAspect = 1.0;

void main() {
  vec2 uv = vUv;
  vec2 normalizedPixelSize = uPixelSize / uResolution;

  // === Option 1: No offset (grid pattern) ===
  vec2 offsetUv = uv;

  // === Option 2: Offset every other row by half a cell (staggered/hexagonal pattern) ===
  // float row = floor(uv.y / normalizedPixelSize.y);
  // vec2 offsetUv = uv;
  // offsetUv.x += mod(row, 2.0) * normalizedPixelSize.x * 0.5;

  // === Option 3: Sine wave offset (wavy pattern) ===
  // float column = floor(uv.x / normalizedPixelSize.x);
  // vec2 offsetUv = uv;
  // float waveFrequency = 0.2;  // Adjust for tighter/looser waves
  // float waveAmplitude = 0.5;  // 0.5 = half cell offset at peak
  // offsetUv.y += sin(column * waveFrequency) * normalizedPixelSize.x * waveAmplitude;

  vec2 uvPixel = normalizedPixelSize * floor(uv / normalizedPixelSize);

  vec2 textureUv = (uUsePixelatedUv ? uvPixel : uv) * vec2(1.0, textureAspect);
  vec4 color = texture(uTexture, textureUv);

  float luma = dot(vec3(0.2126, 0.7152, 0.0722), color.rgb);
  // color.rgb = uGrayscale ? vec3(luma) : color.rgb;

  vec2 cellUv = fract(offsetUv / normalizedPixelSize);
  float cellAspect = normalizedPixelSize.x / normalizedPixelSize.y;
  vec2 toCenter = cellUv - 0.5;
  toCenter.y *= cellAspect;
  float dist = length(toCenter);

  float radius = uDisplayLuma ? uRadius * (0.1 + luma) : uRadius;

  // Hard cutoff (aliased, sharp edges)
  //float circle = dist < radius ? 0.0 : 1.0;

  // Antialiasing approaches (uncomment one):
  // 1. Fixed-width smoothstep (simple, consistent blur)
  // float circle = smoothstep(radius - 0.01, radius + 0.01, dist);

  // 2. Pixel-perfect antialiasing using fwidth (adapts to screen resolution)
  float edgeWidth = fwidth(dist);
  float circle = smoothstep(radius - edgeWidth, radius + edgeWidth, dist);

  // 3. Wider soft edge (more glow-like)
  //float circle = smoothstep(radius - 0.15, radius + 0.15, dist);

  // circle = 0 inside, 1 outside
  // Option A: Multiply (dark circles)
  // float circleMask = uDisplayCircleMask ? circle : 0.0;
  // color = mix(color, vec4(0.0), circleMask);

  // Option B: White circles at center
  // float circleMask = uDisplayCircleMask ? (1.0 - circle) : 0.0;
  // color = mix(color, vec4(1.0), circleMask);

  // ========================================
  // RENDERING OPTIONS (uncomment one)
  // ========================================

  // // --- RINGS ---
  float ringThickness = 0.1;
  float innerRadius = radius - ringThickness;
  float outerCircle = smoothstep(radius - edgeWidth, radius + edgeWidth, dist);
  float innerCircle = smoothstep(innerRadius - edgeWidth, innerRadius + edgeWidth, dist);
  float shape = innerCircle * (1.0 - outerCircle); // 1 inside ring, 0 elsewhere

  // // --- FOR RINGS (shape = 1 inside ring, 0 elsewhere) ---
  // // White rings on black background
  float mask = uDisplayCircleMask ? shape : 0.0;
  color = uv.x < 0.5 ? mix(vec4(0.0, 0.0, 0.0, 1.0), vec4(1.0, 0.5, 0.0, 1.0), mask) : color;

  // // Texture color in rings, black background
  // // float mask = uDisplayCircleMask ? shape : 0.0;
  // // color = mix(vec4(0.0, 0.0, 0.0, 1.0), color, mask);

  fragColor = color;
}
`;

// export const HalftoneShaderVisualizer = () => {
//   const [radius, setRadius] = useState(0.4);
//   const [pixelSize, setPixelSize] = useState(48.0);
//   const deferredRadius = useDeferredValue(radius);
//   const deferredPixelSize = useDeferredValue(pixelSize);
//   const [usePixelatedUv, setUsePixelatedUv] = useState(true);
//   const [displayCircleMask, setDisplayCircleMask] = useState(true);
//   const [displayLuma, setDisplayLuma] = useState(false);
//   const [grayscale, setGrayscale] = useState(false);

//   return (
//     <ShaderPlayground
//       key={PATTERN_FRAGMENT}
//       fragmentShader={PATTERN_FRAGMENT}
//       uniforms={{
//         uRadius: deferredRadius,
//         uTexture: '/static/backgrounds/girl_with_pearl_earing.jpg',
//         uUsePixelatedUv: usePixelatedUv,
//         uPixelSize: deferredPixelSize,
//         uDisplayCircleMask: displayCircleMask,
//         uDisplayLuma: displayLuma,
//         uGrayscale: grayscale,
//       }}
//       showGrid
//       showCode={false}
//     >
//       <Slider
//         id="radius"
//         label="Radius"
//         min={0}
//         max={0.5}
//         step={0.01}
//         value={radius}
//         onChange={setRadius}
//       />
//       <Slider
//         id="pixelSize"
//         label="Pixel Size"
//         min={4}
//         max={64}
//         step={1}
//         value={pixelSize}
//         onChange={setPixelSize}
//       />
//       <Checkbox
//         id="displayCircleMask"
//         aria-label="Display Circle Mask"
//         label="Display Circle Mask"
//         checked={displayCircleMask}
//         onChange={() => setDisplayCircleMask((prev) => !prev)}
//       />
//       <Checkbox
//         id="usePixelatedUv"
//         aria-label="Use Pixelated UV"
//         label="Use Pixelated UV"
//         checked={usePixelatedUv}
//         onChange={() => setUsePixelatedUv((prev) => !prev)}
//       />
//       <Checkbox
//         id="displayLuma"
//         aria-label="Use Luma based radius"
//         label="Use Luma based radius"
//         disabled={!displayCircleMask}
//         checked={displayLuma}
//         onChange={() => setDisplayLuma((prev) => !prev)}
//       />
//       <Box
//         as="hr"
//         css={{
//           width: '100%',
//           height: '1px',
//           backgroundColor: 'var(--border-color)',
//           border: 'none',
//         }}
//       />
//       <Select
//         id="grayscale"
//         items={[
//           { label: 'Colored', value: 'color' },
//           { label: 'Grayscale', value: 'grayscale' },
//         ]}
//         value={grayscale ? 'grayscale' : 'color'}
//         onChange={(value) => setGrayscale(value === 'grayscale')}
//       />
//     </ShaderPlayground>
//   );
// };

const GOOEY_FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform vec2 uResolution;
uniform float uRadius;
uniform float uGooeyness;

// Exponential smooth minimum - symmetric when applied to multiple values
float sminExp(float a, float b, float k) {
    if (k <= 0.001) return min(a, b);
    float res = exp(-k * a) + exp(-k * b);
    return -log(res) / k;
}

float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * k * 0.25;
}

void main() {
  float gridSize = 4.0;
  vec2 gridUV = vUv * gridSize;
  vec2 cellIndex = floor(gridUV);

  // Center of the grid
  vec2 gridCenter = vec2(gridSize * 0.5);

  // Smoothness factor - higher = more gooey
  float smoothK = (1.0 - uGooeyness) * 8.0;

  // Start with a large distance (no shape)
  float minDist = 100.0;

  // Check neighborhood of cells
  for (float ox = -2.0; ox <= 2.0; ox += 1.0) {
    for (float oy = -2.0; oy <= 2.0; oy += 1.0) {
      vec2 neighborCell = cellIndex + vec2(ox, oy);

      // DIAGONAL GRID: Only place dots where (row + col) is even
      // Creates checkerboard pattern for diagonal connections
      if (mod(neighborCell.x + neighborCell.y, 2.0) > 0.5) {
        continue;
      }

      vec2 neighborCenter = neighborCell + 0.5;

      // Calculate distance from dot center to grid center
      float distToCenter = length(neighborCenter - gridCenter);
      // Normalize (max distance is ~gridSize * 0.707 for corners)
      float maxDist = gridSize * 0.5 * 1.414;
      float normalizedDist = distToCenter / maxDist;

      // Dots closer to center are bigger, dots at edges are smaller
      // Clamp to prevent negative radius (which breaks the SDF)
      float radiusScale = max(0.05, 1.0 - normalizedDist * 1.2);
      float adjustedRadius = uRadius * radiusScale;

      // Distance from THIS PIXEL to the neighbor's center
      float dist = length(gridUV - neighborCenter);

      // Get signed distance to this dot (negative inside, positive outside)
      float dotDist = dist - adjustedRadius;

      // Use exponential smooth min for symmetric blending
      minDist = sminExp(minDist, dotDist, smoothK);
    }
  }

  // Convert SDF to shape with antialiasing
  float aa = fwidth(minDist);
  float finalShape = 1.0 - smoothstep(-aa, aa, minDist);

  vec3 color = mix(vec3(0.0), vec3(0.4, 0.75, 1.0), finalShape);
  fragColor = vec4(color, 1.0);
}
`;

// export const HalftoneShaderVisualizer = () => {
//   const [radius, setRadius] = useState(0.65);
//   const [gooeyness, setGooeyness] = useState(0.65);
//   const deferredRadius = useDeferredValue(radius);
//   const deferredGooeyness = useDeferredValue(gooeyness);

//   return (
//     <ShaderPlayground
//       key={GOOEY_FRAGMENT}
//       fragmentShader={GOOEY_FRAGMENT}
//       uniforms={{ uRadius: deferredRadius, uGooeyness: deferredGooeyness }}
//       showGrid
//       showCode={false}
//       gridSize={4}
//     >
//       <Slider
//         id="radius"
//         label="Radius"
//         min={0}
//         max={0.75}
//         step={0.01}
//         value={radius}
//         onChange={setRadius}
//       />
//       <Slider
//         id="gooeyness"
//         label="Gooeyness"
//         min={0}
//         max={0.75}
//         step={0.01}
//         value={gooeyness}
//         onChange={setGooeyness}
//       />
//     </ShaderPlayground>
//   );
// };

//CMYK Halftone Shader
const CMYK_HALFTONE_FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform vec2 uResolution;
uniform float uPixelSize;
uniform float uDotSize;
uniform float uAngleC;
uniform float uAngleM;
uniform float uAngleY;
uniform float uAngleK;
uniform sampler2D uTexture;

const float CYAN_STRENGTH    = 0.95;
const float MAGENTA_STRENGTH = 0.95;
const float YELLOW_STRENGTH  = 0.95;
const float BLACK_STRENGTH   = 1.10;

mat2 rot(float deg) {
  float a = radians(deg);
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

// Get the texture UV at the center of the rotated halftone cell
vec2 getHalftoneCellTextureUV(vec2 uvScreen, float angleDeg) {
  float effectiveDotDensity = (min(uResolution.x, uResolution.y) / uPixelSize);
  float minRes = min(uResolution.x, uResolution.y);
  float scale = effectiveDotDensity / minRes;

  vec2 uv = uvScreen * scale;

  // Transform to rotated space
  mat2 rotation = rot(angleDeg);
  vec2 rotatedUV = rotation * uv;

  // Find cell center in rotated space
  vec2 cellCenter = floor(rotatedUV) + 0.5;

  // Transform back to screen space
  mat2 invRotation = rot(-angleDeg);
  vec2 screenCenter = invRotation * cellCenter;

  // Convert back to texture UV (0-1 range)
  return screenCenter / scale / uResolution;
}

float halftoneDot(vec2 uvScreen, float angleDeg, float coverage) {
  float effectiveDotDensity = (min(uResolution.x, uResolution.y) / uPixelSize);

  float minRes = min(uResolution.x, uResolution.y);
  float scale = effectiveDotDensity / minRes;
  vec2 uv = uvScreen * scale;

  // Introduce rotation
  uv = rot(angleDeg) * uv;

  vec2 gv = fract(uv) - 0.5;
  float r = uDotSize * sqrt(clamp(coverage, 0.0, 1.0));

  // Analytic AA
  float aa = fwidth(length(gv)) * 1.0;
  float d = length(gv);
  float ink = 1.0 - smoothstep(r - aa, r + aa, d);
  return ink;
}

// Convert RGB to CMYK by MattDSL -> https://gist.github.com/mattdesl/e40d3189717333293813626cbdb2c1d1
vec4 RGBtoCMYK(vec3 rgb) {
  float r = rgb.r;
  float g = rgb.g;
  float b = rgb.b;
  float k = min(1.0 - r, min(1.0 - g, 1.0 - b));
  vec3 cmy = vec3(0.0);
  float invK = 1.0 - k;
  if (invK != 0.0) {
    cmy.x = (1.0 - r - k) / invK;
    cmy.y = (1.0 - g - k) / invK;
    cmy.z = (1.0 - b - k) / invK;
  }
  return clamp(vec4(cmy, k), 0.0, 1.0);
}

// Procedural colorful gradient to demonstrate the effect
vec3 proceduralImage(vec2 uv) {
  // Create a nice colorful gradient with multiple hues
  vec3 col1 = vec3(0.9, 0.2, 0.3);  // Red-ish
  vec3 col2 = vec3(0.2, 0.8, 0.4);  // Green
  vec3 col3 = vec3(0.2, 0.4, 0.9);  // Blue
  vec3 col4 = vec3(0.9, 0.7, 0.1);  // Yellow

  // Four-corner gradient
  vec3 top = mix(col1, col2, uv.x);
  vec3 bottom = mix(col4, col3, uv.x);
  return mix(bottom, top, uv.y);
}

void main() {
  vec2 uvScreen = vUv * uResolution;

  // Sample texture at each channel's rotated cell center
  // This ensures consistent color within each rotated halftone cell
  vec2 uvC = getHalftoneCellTextureUV(uvScreen, uAngleC);
  vec2 uvM = getHalftoneCellTextureUV(uvScreen, uAngleM);
  vec2 uvY = getHalftoneCellTextureUV(uvScreen, uAngleY);
  vec2 uvK = getHalftoneCellTextureUV(uvScreen, uAngleK);

  vec4 cmykC = RGBtoCMYK(texture(uTexture, uvC).rgb);
  vec4 cmykM = RGBtoCMYK(texture(uTexture, uvM).rgb);
  vec4 cmykY = RGBtoCMYK(texture(uTexture, uvY).rgb);
  vec4 cmykK = RGBtoCMYK(texture(uTexture, uvK).rgb);

  float dotC = halftoneDot(uvScreen, uAngleC, cmykC.x);
  float dotM = halftoneDot(uvScreen, uAngleM, cmykM.y);
  float dotY = halftoneDot(uvScreen, uAngleY, cmykY.z);
  float dotK = halftoneDot(uvScreen, uAngleK, cmykK.w);

  vec3 outColor = vec3(1.0);
  outColor.r *= (1.0 - CYAN_STRENGTH * dotC);
  outColor.g *= (1.0 - MAGENTA_STRENGTH * dotM);
  outColor.b *= (1.0 - YELLOW_STRENGTH * dotY);
  outColor *= (1.0 - BLACK_STRENGTH * dotK);

  fragColor = vec4(outColor, 1.0);
}
`;

// export const HalftoneShaderVisualizer = () => {
//   const [pixelSize, setPixelSize] = useState(8.0);
//   const [dotSize, setDotSize] = useState(0.65);
//   const [angleC, setAngleC] = useState(15.0);
//   const [angleM, setAngleM] = useState(75.0);
//   const [angleY, setAngleY] = useState(0.0);
//   const [angleK, setAngleK] = useState(45.0);

//   return (
//     <ShaderPlayground
//       key={CMYK_HALFTONE_FRAGMENT_SHADER}
//       fragmentShader={CMYK_HALFTONE_FRAGMENT_SHADER}
//       uniforms={{
//         uPixelSize: pixelSize,
//         uDotSize: dotSize,
//         uAngleC: angleC,
//         uAngleM: angleM,
//         uAngleY: angleY,
//         uAngleK: angleK,
//         uTexture: '/static/backgrounds/cliff_walk_at_pourville.jpg',
//       }}
//       showGrid={false}
//       showCode={false}
//     >
//       <Slider
//         id="pixelSize"
//         label="Pixel Size"
//         min={4}
//         max={48}
//         step={1}
//         value={pixelSize}
//         onChange={setPixelSize}
//       />
//       <Slider
//         id="dotSize"
//         label="Dot Size"
//         min={0}
//         max={1}
//         step={0.01}
//         value={dotSize}
//         onChange={setDotSize}
//       />
//       <Box
//         as="hr"
//         css={{
//           width: '100%',
//           height: '1px',
//           border: 'none',
//           backgroundColor: 'var(--border-color)',
//         }}
//       />
//       <Slider
//         id="angleC"
//         label="Cyan Angle"
//         min={0}
//         max={90}
//         step={1}
//         value={angleC}
//         onChange={setAngleC}
//       />
//       <Slider
//         id="angleM"
//         label="Magenta Angle"
//         min={0}
//         max={90}
//         step={1}
//         value={angleM}
//         onChange={setAngleM}
//       />
//       <Slider
//         id="angleY"
//         label="Yellow Angle"
//         min={0}
//         max={90}
//         step={1}
//         value={angleY}
//         onChange={setAngleY}
//       />
//       <Slider
//         id="angleK"
//         label="Black Angle"
//         min={0}
//         max={90}
//         step={1}
//         value={angleK}
//         onChange={setAngleK}
//       />
//       <Tooltip content="Reset Angles">
//         <IconButton
//           variant="secondary"
//           onClick={() => {
//             setAngleC(15.0);
//             setAngleM(75.0);
//             setAngleY(0.0);
//             setAngleK(45.0);
//           }}
//         >
//           <Icon.Repeat />
//         </IconButton>
//       </Tooltip>
//     </ShaderPlayground>
//   );
// };

const MOIRE_FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform vec2 uResolution;
uniform float uRadius;
uniform float uPixelSize;
uniform float uAngle;
uniform bool uType;
uniform bool uDebug;

mat2 rotate(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec2 hash2(vec2 p) {
  return vec2(hash(p), hash(p + 1.234));
}

float circleGrid(vec2 uv, float radius, float angle) {
  vec2 normalizedPixelSize = uPixelSize / uResolution;
  
  // Apply rotation to UV before calculating cell
  vec2 uvPx = uv * uResolution;
  vec2 rotatedPx = rotate(angle) * uvPx;
  vec2 rotatedUv = rotatedPx / uResolution;
  
  vec2 cellUv = fract(rotatedUv / normalizedPixelSize);
  float edgeWidth = fwidth(distance(cellUv, vec2(0.5)));
  float adjustedRadius = clamp(radius * uv.x, 0.1, 0.8);
  float circle = smoothstep(adjustedRadius - edgeWidth, adjustedRadius + edgeWidth, distance(cellUv, vec2(0.5)));
  return circle;
}

float poissonDots(vec2 uv, float radius, float angle) {
  vec2 seed = vec2(0.0, 0.0);
  vec2 uvPx = uv * uResolution;
  vec2 centerPx = 0.5 * uResolution;
  vec2 rotatedPx = rotate(angle) * (uvPx - centerPx) + centerPx;
  float cellSizePx = uPixelSize;
  vec2 gridUv = (rotatedPx / cellSizePx) + seed;
  vec2 baseCell = floor(gridUv);
  float minDist = 1e6;
  float density = 0.65;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 cell = baseCell + vec2(x, y);
      vec2 rand = hash2(cell);
      float isActive = step(rand.x, density);
      vec2 point = (cell + rand - seed) * cellSizePx;
      float distToPoint = distance(rotatedPx, point);
      minDist = min(minDist, mix(1e6, distToPoint, isActive));
    }
  }

  float edgeWidth = fwidth(minDist);
  float dotRadius = clamp(radius, 0.1, 0.3) * cellSizePx;
  return smoothstep(dotRadius - edgeWidth, dotRadius + edgeWidth, minDist);
}

void main() {
  vec2 uv = vUv;
  
  float circleGridA = uType
    ? circleGrid(uv, uRadius, 0.0)
    : poissonDots(uv, uRadius, 0.0);
  float circleGridB = uType
    ? circleGrid(uv, uRadius, radians(uAngle))
    : poissonDots(uv, uRadius, radians(uAngle));
  vec3 colorA = mix(vec3(0.6), vec3(0.0, 0.0, 0.0), circleGridA);
  vec3 colorB = mix(vec3(0.6), vec3(0.0, 0.0, 0.0), circleGridB);

  if (uDebug) {
    colorA = mix(vec3(0.0, 1.0, 0.0), vec3(0.0, 0.0, 0.0), circleGridA);
    colorB = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 0.0, 0.0), circleGridB);
  }


  fragColor = vec4(max(colorA, colorB), 1.0);
}
`;

// export const HalftoneShaderVisualizer = () => {
//   const [pixelSize, setPixelSize] = useState(16.0);
//   const [angle, setAngle] = useState(0.0);
//   const [debug, setDebug] = useState(false);
//   const [type, setType] = useState('poissonDots');
//   const deferredPixelSize = useDeferredValue(pixelSize);
//   const deferredAngle = useDeferredValue(angle);

//   return (
//     <ShaderPlayground
//       key={MOIRE_FRAGMENT}
//       fragmentShader={MOIRE_FRAGMENT}
//       uniforms={{
//         uRadius: 0.4,
//         uPixelSize: deferredPixelSize,
//         uAngle: deferredAngle,
//         uType: type === 'circleGrid',
//         uDebug: debug,
//       }}
//       showGrid={false}
//       showCode={false}
//     >
//       <Select
//         id="type"
//         items={[
//           { label: 'Circle Grid', value: 'circleGrid' },
//           { label: 'Poisson Dots', value: 'poissonDots' },
//         ]}
//         value={type}
//         minWidth={135}
//         onChange={(value) => setType(value as 'circleGrid' | 'poissonDots')}
//       />
//       <Slider
//         id="pixelSize"
//         label="Pixel Size"
//         min={4}
//         max={64}
//         step={1}
//         value={pixelSize}
//         onChange={setPixelSize}
//       />
//       <Slider
//         id="angle"
//         label="Angle"
//         min={0}
//         max={type === 'circleGrid' ? 90 : 5}
//         step={0.25}
//         value={angle}
//         onChange={setAngle}
//       />
//       <Checkbox
//         id="debug"
//         aria-label="Debug"
//         label="Debug"
//         checked={debug}
//         onChange={() => setDebug((prev) => !prev)}
//       />
//     </ShaderPlayground>
//   );
// };

const RING_FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform vec2 uResolution;
uniform float uRadius;
uniform float uPixelSize;
uniform sampler2D uTexture;
uniform bool uDisplayLuma;
uniform float split;

const float textureAspect = 1.0;

void main() {
  vec2 uv = vUv;
  vec2 normalizedPixelSize = uPixelSize / uResolution;

  vec2 uvPixel = normalizedPixelSize * floor(uv / normalizedPixelSize);

  vec2 textureUv = (uv.x < split ? uvPixel : uv) * vec2(1.0, textureAspect);
  vec4 color = texture(uTexture, textureUv);

  float luma = dot(vec3(0.2126, 0.7152, 0.0722), color.rgb);

  vec2 cellUv = fract(uv / normalizedPixelSize);
  vec2 toCenter = cellUv - 0.5;
  float dist = length(toCenter);

  float radius = uRadius * (0.2 + luma);
  float edgeWidth = fwidth(dist);

  // --- RINGS ---
  float ringThickness = 0.1;
  float innerRadius = radius - ringThickness;
  float outerCircle = smoothstep(radius - edgeWidth, radius + edgeWidth, dist);
  float innerCircle = smoothstep(innerRadius - edgeWidth, innerRadius + edgeWidth, dist);
  float shape = innerCircle * (1.0 - outerCircle); // 1 inside ring, 0 elsewhere

  float mask = shape;
  color = uv.x < split ? mix(vec4(0.0, 0.0, 0.0, 1.0), vec4(1.0, 0.5, 0.0, 1.0), shape) : color;

  fragColor = color;
}
`;

export const HalftoneShaderVisualizer = () => {
  const [pixelSize, setPixelSize] = useState(8.0);
  const deferredPixelSize = useDeferredValue(pixelSize);
  const [split, setSplit] = useState(0.5);
  const deferredSplit = useDeferredValue(split);

  return (
    <Flex
      alignItems="center"
      direction="column"
      gap="4"
      css={{
        maxWidth: 662,
        width: '100%',
      }}
    >
      <Box
        css={{
          width: '100%',
          height: '100%',
          borderRadius: 'var(--border-radius-2)',
          overflow: 'hidden',
        }}
      >
        <ShaderCanvas
          key={RING_FRAGMENT}
          fragmentShader={RING_FRAGMENT}
          uniforms={{
            uRadius: 0.3,
            uPixelSize: deferredPixelSize,
            uTexture: '/static/backgrounds/landscape.mp4',
            split: deferredSplit,
          }}
          aspectRatio="16 / 10"
        />
      </Box>
      <Flex direction="column" gap="4" css={{ width: '50%', minWidth: 135 }}>
        <Slider
          id="split"
          label="Split"
          min={0}
          max={1}
          step={0.01}
          value={split}
          onChange={setSplit}
        />
        <Slider
          id="pixelSize"
          label="Pixel Size"
          min={8}
          max={32}
          step={1}
          value={pixelSize}
          onChange={setPixelSize}
        />
      </Flex>
    </Flex>
  );
};
