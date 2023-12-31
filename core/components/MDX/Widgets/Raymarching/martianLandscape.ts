const VertexShader = `varying vec2 vUv;

void main() {
  vUv = uv;

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
}
`;

const FragmentShader = `// Inspired by the work of @stormoid               
uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uTexture;

#define MAX_STEPS 100
#define MAX_DIST 250.0
#define SURFACE_DIST 0.001
#define MAX_OCTAVES 5

float linstep(float mn, float mx, float x){
  return clamp((x-mn)/(mx-mn),0.,1.);
}

vec3 noised(vec2 x){
  vec2 p=floor(x);
  vec2 f=fract(x);
  vec2 u=f*f*(3.-2.*f);

  float a=textureLod(uTexture,(p+vec2(.0,.0))/256.,0.).x;
  float b=textureLod(uTexture,(p+vec2(1.0,.0))/256.,0.).x;
  float c=textureLod(uTexture,(p+vec2(.0,1.0))/256.,0.).x;
  float d=textureLod(uTexture,(p+vec2(1.0,1.0))/256.,0.).x;
 
  float noiseValue = a+(b-a)*u.x+(c-a)*u.y+(a-b-c+d)*u.x*u.y;
  vec2 noiseDerivative = 6.*f*(1.-f)*(vec2(b-a,c-a)+(a-b-c+d)*u.yx);

  return vec3(noiseValue,noiseDerivative);
}

mat2 m=mat2(.8,-.6,.6,.8);

float terrain(vec2 p){
  vec2 p1 = p * 0.06;
  float a = -0.1;
  float b = 1.9;
  vec2 d = vec2(0.0);
  float scl = 2.95;

  for( int i=0; i<MAX_OCTAVES; i++ ) {
    vec3 n = noised(p1);
    d+=n.yz;
    a += b*n.x/(dot(d,d) + 1.0);
    b *= -0.4;
    a *= .85;
    p1 = m*p1*scl;
  }
  
  return a*3.0;
}

float scene(vec3 p) {
  float d = p.y - terrain(p.xz);
  return d;
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

vec3 lightPosition = vec3(-1.0, 0.0, 0.5);

// This fog is presented in Inigo Quilez's article
// It's a version of the fog function that keeps the "fog" at the
// bottom of the scene, and doesn't let it go above the horizon/mountains
vec3 fog(vec3 ro,vec3 rd,vec3 col,float d){
  vec3 pos=ro+rd*d;
  float sunAmount = max(dot(rd,lightPosition),0.0);
  
  const float b=1.3;
  // Applying exponential decay to fog based on distance
  float fogAmount = .2*exp(-ro.y*b) * (1.-exp(-d*rd.y*b))/rd.y;
  vec3 fogColor = mix(vec3(0.5,0.2,0.15), vec3(1.1,0.6,0.45), pow(sunAmount,2.0));

  return mix(col, fogColor, clamp(fogAmount,0.0,1.0));
}

// This function comes from @stormoid's work and is used to add
// a fake atmospherical scattering effect at the horizon line
vec3 scatter(vec3 ro, vec3 rd) {
  float sunAmount = max(dot(rd,lightPosition) * 0.5 + 0.5, 0.0);
  float depth = 1.0 - (ro + rd * (MAX_DIST)).y * 10.0;
  float hori = (linstep(-400.0 ,0.0 ,depth) - linstep(0.0, 400.0, depth)) * 1.04;
  hori *= pow(sunAmount, 0.04);
  
  vec3 col = vec3(0);
  col += pow(hori, 100.0) * vec3(1.0 , 0.7, 0.5);
  col += pow(hori, 25.0) * vec3(1.0, 0.5, 0.25) * 1.2;
  col += pow(hori, 7.0) * vec3(1.0, 0.4, 0.25) * 1.8;
  
  return col;
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

  vec3 ro = vec3(0.0, 18.0, 5.0 - uTime * 10.0);
  vec3 rd = normalize(vec3(uv, -1.0));

  float d = raymarch(ro, rd);
  vec3 p = ro + rd * d;

  vec3 color = vec3(0.0);

  if(d<MAX_DIST) {
    vec3 normal = getNormal(p);
    vec3 lightDirection = normalize(lightPosition - p);
    
    float ambient = clamp(0.5 + .5*normal.y, 0.0, 1.0);
    float diffuse = max(dot(normal, lightDirection), 0.0);
    float shadows = softShadows(p, lightDirection, 0.1, 5.0, 64.0);
    color=vec3(0.25,0.25,0.3) * (vec3(0.10,0.11,0.12) * ambient + 2.0 * vec3(0.9,0.4,0.25) * diffuse) * shadows;
  }

  color = fog(ro, rd, color, d) + scatter(ro, rd);
  gl_FragColor = vec4(color, 1.0);
}
`;

const AppCode = `import { useTexture } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, Suspense } from "react";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import './scene.css';

import vertexShader from "!!raw-loader!./vertexShader.glsl";
import fragmentShader from "!!raw-loader!./fragmentShader.glsl";

const DPR = 1;
// Noise Texture
const TEXTURE_URL = "https://cdn.maximeheckel.com/noises/noise1.png";

const Raymarching = () => {
  const mesh = useRef();
  const { viewport } = useThree();

  const texture = useTexture(TEXTURE_URL);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;

  const uniforms = {
    uTime: new THREE.Uniform(0.0),
    uResolution: new THREE.Uniform(new THREE.Vector2()),
    uTexture: new THREE.Uniform(null),
  };
  
  useFrame((state) => {
    const { clock } = state;
    mesh.current.material.uniforms.uTime.value = clock.getElapsedTime();
    mesh.current.material.uniforms.uResolution.value = new THREE.Vector2(
      window.innerWidth * DPR,
      window.innerHeight * DPR
    );
    mesh.current.material.uniforms.uTexture.value = texture; 
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

const MartianLandscape = {
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

export default MartianLandscape;
