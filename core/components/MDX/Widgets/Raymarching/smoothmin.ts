const VertexShader = `varying vec2 vUv;

void main() {
  vUv = uv;

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
}
`;

const FragmentShader = `uniform float uTime;
uniform vec2 uResolution;

#define MAX_STEPS 120
#define MAX_DIST 100.0
#define SURFACE_DIST 0.01

// Perlin 2D Noide Code
vec4 mod289(vec4 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec2 fade(vec2 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise
float cnoise(vec2 P)
{
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod289(Pi); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;

  vec4 i = permute(permute(ix) + iy);

  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
  vec4 gy = abs(gx) - 0.5 ;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;

  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);

  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;

  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));

  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

// Cosine color palette function from Inigo Quilez
vec3 getColor(float amount) {
  vec3 color = 0.5 + 0.5 * cos(6.2831 * (vec3(0.0, 0.1, 0.2) + amount * vec3(1.0, 1.0, 1.0)));
  return color * amount;
}


float sdSphere(vec3 p, float radius) {
    return length(p) - radius;
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b-a)/k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float scene(vec3 p) {
  float displacement = cnoise(p.yy + uTime * 0.5) / 4.0;
  float d = sdSphere(p, 0.75);
  float d2 = sdSphere(p - vec3(cos(uTime), sin(uTime), 0.0), 0.25);
  float d3 = sdSphere(p - vec3(cos(uTime), cos(uTime), 0.0), 0.25);


  float distance =  smin(d, d2, 0.7);
  distance = smin(distance, d3, 0.7);
  distance += displacement;

  return distance;
}

float raymarch(vec3 ro, vec3 rd) {
  float dO = 0.0;
  vec3 color = vec3(0.0);

  for(int i = 0; i < MAX_STEPS; i++) {
    vec3 p = ro + rd * dO;
    float dS = scene(p);

    dO += dS;

    if(dO > MAX_DIST || dS < SURFACE_DIST) {
        break;
    }
  }
  return dO;
}

vec3 getNormal(vec3 p) {
  vec2 e = vec2(.01, 0);

  vec3 n = scene(p) - vec3(
    scene(p-e.xyy),
    scene(p-e.yxy),
    scene(p-e.yyx));

  return normalize(n);
}

float softShadows(vec3 ro, vec3 rd, float mint, float maxt, float k ) {
  float resultingShadowColor = 1.0;
  float t = mint;
  for(int i = 0; i < 50 && t < maxt; i++) {
      float h = scene(ro + rd*t);
      if( h < 0.001 )
          return 0.0;
      resultingShadowColor = min(resultingShadowColor, k*h/t );
      t += h;
  }
  return resultingShadowColor ;
}

void main() {
  vec2 uv = gl_FragCoord.xy/uResolution.xy;
  uv -= 0.5;
  uv.x *= uResolution.x / uResolution.y;

  // Light Position
  vec3 lightPosition = vec3(-10.0 * cos(uTime * 1.5), 10.0, 10.0);

  vec3 ro = vec3(0.0, 0.0, 5.0);
  vec3 rd = normalize(vec3(uv, -1.0));

  float d = raymarch(ro, rd);
  vec3 p = ro + rd * d;

  vec3 color = vec3(0.0);

  if(d<MAX_DIST) {
    vec3 normal = getNormal(p);
    vec3 lightDirection = normalize(lightPosition - p);

    float diffuse = max(dot(normal, lightDirection), 0.0);
    float shadows = softShadows(p, lightDirection, 0.1, 5.0, 64.0);
    color = vec3(1.0, 1.0, 1.0) * getColor(diffuse * shadows);
  }

  gl_FragColor = vec4(color, 1.0);
}
`;

const AppCode = `import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, Suspense } from "react";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import './scene.css';

import vertexShader from "!!raw-loader!./vertexShader.glsl";
import fragmentShader from "!!raw-loader!./fragmentShader.glsl";

const DPR = 1;

const Raymarching = () => {
  const mesh = useRef();
  const { viewport } = useThree();

  const uniforms = {
    uTime: new THREE.Uniform(0.0),
    uResolution: new THREE.Uniform(new THREE.Vector2()),
  };
  
  useFrame((state) => {
    const { clock } = state;
    mesh.current.material.uniforms.uTime.value = clock.getElapsedTime();
    mesh.current.material.uniforms.uResolution.value = new THREE.Vector2(
      window.innerWidth * DPR,
      window.innerHeight * DPR
    );   
  });

  return (
    <mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        key={uuidv4()}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

const Scene = () => {
  return (
    <Canvas camera={{ position: [0, 0, 6] }} dpr={DPR}>
      <Suspense fallback={null}>
        <Raymarching />
      </Suspense>
    </Canvas>
  );
};


export default Scene;
`;

const Smoothmin = {
  '/App.js': {
    code: AppCode,
  },
  '/fragmentShader.glsl': {
    code: FragmentShader,
    active: true,
  },
  '/vertexShader.glsl': {
    code: VertexShader,
  },
};

export default Smoothmin;
