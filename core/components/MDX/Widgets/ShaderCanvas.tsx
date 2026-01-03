import { Box } from '@maximeheckel/design-system';
import { useInView } from 'motion/react';
import { useCallback, useEffect, useRef } from 'react';

// ========================================
// Types
// ========================================

export type UniformValue =
  | number
  | [number, number]
  | [number, number, number]
  | [number, number, number, number]
  | boolean
  | string; // URL for texture (sampler2D) - supports images and videos

export interface Uniforms {
  [key: string]: UniformValue;
}

interface TextureInfo {
  texture: WebGLTexture;
  unit: number;
}

interface VideoTextureInfo {
  texture: WebGLTexture;
  video: HTMLVideoElement;
  unit: number;
}

interface WebGLRendererState {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  vao: WebGLVertexArrayObject;
  uniformLocations: Map<string, WebGLUniformLocation | null>;
  textures: Map<string, TextureInfo>;
  videoTextures: Map<string, VideoTextureInfo>;
  nextTextureUnit: number;
}

// ========================================
// Default Vertex Shader (fullscreen quad)
// ========================================

const VERTEX_SHADER = `#version 300 es
precision highp float;
in vec2 position;
out vec2 vUv;

void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// ========================================
// WebGL Utilities
// ========================================

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) {
    // eslint-disable-next-line no-console
    console.error('Failed to create shader');
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const shaderType = type === gl.VERTEX_SHADER ? 'vertex' : 'fragment';
    // eslint-disable-next-line no-console
    console.error(
      `Failed to compile ${shaderType} shader:`,
      gl.getShaderInfoLog(shader)
    );
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
  if (!program) {
    // eslint-disable-next-line no-console
    console.error('Failed to create program');
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    // eslint-disable-next-line no-console
    console.error('Failed to link program:', gl.getProgramInfoLog(program));
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

  const positionLoc = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(positionLoc);
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

  gl.bindVertexArray(null);

  return vao;
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)$/i.test(url);
}

function loadTexture(
  gl: WebGL2RenderingContext,
  url: string,
  onLoad?: () => void
): WebGLTexture | null {
  const texture = gl.createTexture();
  if (!texture) return null;

  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Put a single pixel as placeholder while loading
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([128, 128, 128, 255])
  );

  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    const isPowerOf2 = (n: number) => (n & (n - 1)) === 0;
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }

    onLoad?.();
  };
  image.src = url;

  return texture;
}

function loadVideoTexture(
  gl: WebGL2RenderingContext,
  url: string,
  onLoad?: () => void
): { texture: WebGLTexture; video: HTMLVideoElement } | null {
  const texture = gl.createTexture();
  if (!texture) return null;

  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Put a single pixel as placeholder while loading
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([128, 128, 128, 255])
  );

  // Set texture parameters for non-power-of-2 video dimensions
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const video = document.createElement('video');
  video.crossOrigin = 'anonymous';
  video.autoplay = true;
  video.loop = true;
  video.muted = true; // Required for autoplay in most browsers
  video.playsInline = true; // iOS requirement

  video.addEventListener('canplay', () => {
    onLoad?.();
    video.play();
  });

  video.src = url;
  video.load();

  return { texture, video };
}

function updateVideoTexture(
  gl: WebGL2RenderingContext,
  texture: WebGLTexture,
  video: HTMLVideoElement
): void {
  if (video.readyState >= video.HAVE_CURRENT_DATA) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
  }
}

// ========================================
// ShaderCanvas Component
// ========================================

export interface ShaderCanvasProps {
  fragmentShader: string;
  uniforms?: Uniforms;
  aspectRatio?: string;
}

export const ShaderCanvas = ({
  fragmentShader,
  uniforms = {},
  aspectRatio = '1 / 1',
}: ShaderCanvasProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<WebGLRendererState | null>(null);
  const animationFrameRef = useRef<number>(0);
  const uniformsRef = useRef<Uniforms>(uniforms);
  const startTimeRef = useRef<number>(performance.now());
  // Start rendering slightly before canvas is visible for smoother experience
  const isInView = useInView(ref);

  // Keep ref in sync with prop
  useEffect(() => {
    uniformsRef.current = uniforms;
  }, [uniforms]);

  // Pause/resume videos based on visibility
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    renderer.videoTextures.forEach(({ video }) => {
      if (isInView) {
        video.play();
      } else {
        video.pause();
      }
    });
  }, [isInView]);

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

    // Dynamically get uniform locations based on the uniforms prop
    const uniformLocations = new Map<string, WebGLUniformLocation | null>();

    // Always add built-in uniforms
    uniformLocations.set(
      'uResolution',
      gl.getUniformLocation(program, 'uResolution')
    );
    uniformLocations.set('uTime', gl.getUniformLocation(program, 'uTime'));

    // Add user-defined uniforms
    Object.keys(uniformsRef.current).forEach((name) => {
      uniformLocations.set(name, gl.getUniformLocation(program, name));
    });

    // Initialize texture tracking
    const textures = new Map<string, TextureInfo>();
    const videoTextures = new Map<string, VideoTextureInfo>();

    return {
      gl,
      program,
      vao,
      uniformLocations,
      textures,
      videoTextures,
      nextTextureUnit: 0,
    };
  }, [fragmentShader]);

  const setUniform = useCallback(
    (
      gl: WebGL2RenderingContext,
      location: WebGLUniformLocation | null,
      value: UniformValue,
      renderer: WebGLRendererState,
      uniformName: string
    ) => {
      if (location === null) return;

      if (typeof value === 'boolean') {
        gl.uniform1i(location, value ? 1 : 0);
      } else if (typeof value === 'number') {
        gl.uniform1f(location, value);
      } else if (typeof value === 'string') {
        // String values are texture URLs (images or videos)
        if (isVideoUrl(value)) {
          // Handle video textures
          let videoTextureInfo = renderer.videoTextures.get(uniformName);

          if (!videoTextureInfo) {
            const result = loadVideoTexture(gl, value);
            if (result) {
              const unit = renderer.nextTextureUnit++;
              videoTextureInfo = { ...result, unit };
              renderer.videoTextures.set(uniformName, videoTextureInfo);
            }
          }

          if (videoTextureInfo) {
            gl.activeTexture(gl.TEXTURE0 + videoTextureInfo.unit);
            gl.bindTexture(gl.TEXTURE_2D, videoTextureInfo.texture);
            gl.uniform1i(location, videoTextureInfo.unit);
          }
        } else {
          // Handle image textures
          let textureInfo = renderer.textures.get(uniformName);

          if (!textureInfo) {
            const texture = loadTexture(gl, value);
            if (texture) {
              const unit = renderer.nextTextureUnit++;
              textureInfo = { texture, unit };
              renderer.textures.set(uniformName, textureInfo);
            }
          }

          if (textureInfo) {
            gl.activeTexture(gl.TEXTURE0 + textureInfo.unit);
            gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture);
            gl.uniform1i(location, textureInfo.unit);
          }
        }
      } else if (Array.isArray(value)) {
        switch (value.length) {
          case 2:
            gl.uniform2f(location, value[0], value[1]);
            break;
          case 3:
            gl.uniform3f(location, value[0], value[1], value[2]);
            break;
          case 4:
            gl.uniform4f(location, value[0], value[1], value[2], value[3]);
            break;
        }
      }
    },
    []
  );

  const render = useCallback(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    const { gl, program, vao, uniformLocations } = renderer;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle canvas resize (cap DPR at 1.5 for performance with many canvases)
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio, 1.5);

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

    // Update all video textures every frame
    renderer.videoTextures.forEach(({ texture, video }) => {
      updateVideoTexture(gl, texture, video);
    });

    // Always set built-in uniforms
    const resolutionLocation = uniformLocations.get('uResolution');
    if (resolutionLocation) {
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    }
    const timeLocation = uniformLocations.get('uTime');
    if (timeLocation) {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      gl.uniform1f(timeLocation, elapsed);
    }

    // Set user-defined uniforms
    Object.entries(uniformsRef.current).forEach(([name, value]) => {
      const location = uniformLocations.get(name);
      setUniform(gl, location ?? null, value, renderer, name);
    });

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    animationFrameRef.current = requestAnimationFrame(render);
  }, [setUniform]);

  // Start/stop render loop based on visibility
  useEffect(() => {
    if (isInView && rendererRef.current) {
      animationFrameRef.current = requestAnimationFrame(render);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = 0;
      }
    };
  }, [isInView, render]);

  useEffect(() => {
    const renderer = initWebGL();
    if (renderer) {
      rendererRef.current = renderer;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = 0;
      }
      if (rendererRef.current) {
        const { gl, program, vao, textures, videoTextures } =
          rendererRef.current;
        // Delete all image textures
        textures.forEach(({ texture }) => {
          gl.deleteTexture(texture);
        });
        // Delete all video textures and clean up video elements
        videoTextures.forEach(({ texture, video }) => {
          video.pause();
          video.src = '';
          video.load();
          gl.deleteTexture(texture);
        });
        gl.deleteVertexArray(vao);
        gl.deleteProgram(program);
        rendererRef.current = null;
      }
    };
  }, [initWebGL]);

  return (
    <Box ref={ref}>
      <canvas
        ref={canvasRef}
        style={{
          aspectRatio,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </Box>
  );
};
