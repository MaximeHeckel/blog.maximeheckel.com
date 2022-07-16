const CustomLayer = `
import { Abstract } from "lamina/vanilla";

class CustomLayer extends Abstract {
  // Define stuff as static properties!

  // Uniforms: Must begin with prefix "u_".
  // Assign them their default value.
  // Any unifroms here will automatically be set as properties on the class as setters and getters.
  // There setters and getters will update the underlying unifrom.
  static u_colorA = "#124dd8";
  static u_colorB = "#2bffe7";
  static u_cloudTint = "#001741";
  static u_gain = 0.5;
  static u_lacunarity = 2.0;
  static u_time = 0.0;

  // Define your fragment shader just like you already do!
  // Only difference is, you must return the final color of this layer
  static fragmentShader = \`   
  uniform float u_time;
  uniform float u_lacunarity;
  uniform float u_gain;
  uniform vec3 u_colorA;
  uniform vec3 u_colorB;
  uniform vec3 u_cloudTint;

  varying vec2 v_Uv;

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

  float fbm(vec2 st) {
    const int OCTAVES = 5;
    // Initial values
    float value = 0.0;
    float amplitude = 0.6;
    // float frequency = 0.5;
    // Loop of octaves
    for (int i = 0; i < OCTAVES; i++) {
      value += amplitude * abs(cnoise(st));
      st *= u_lacunarity;
      amplitude *= u_gain;
    }
    return value;
}
  
  void main() {
    vec3 f_color = vec3(0.0);
    vec2 st = v_Uv * 0.250;
    float speed = 0.1;
    float f_time = u_time * speed;

    vec2 q = vec2(0.);
    q.x = fbm( st + 0.00 * f_time);
    q.y = fbm( st + vec2(1.0));

    vec2 r = vec2(0.);
    r.x = fbm( st + 1.0 * q + vec2(1.7,9.2)+ 0.15 * f_time );
    r.y = fbm( st + 1.0 * q + vec2(8.3,2.8)+ 0.126 * f_time);

      float f = fbm(st+r);

      f_color = mix(vec3(u_colorA),
                  vec3(u_colorB),
                  clamp((f*f)*4.0,0.0,1.0));

      f_color = mix(f_color,
                  u_cloudTint,
                  clamp(length(q),0.0,1.0));

      f_color *= mix(f_color,
                  u_colorA,
                  clamp(length(r.x),0.0,1.0));


    vec4 f_colorfrag = vec4(f_color,1.0);
    return f_colorfrag;
  }
  \`;

  // Optionally Define a vertex shader!
  // Same rules as fragment shaders, except no blend modes.
  // Return a non-projected vec3 position.
  static vertexShader = \`   
  varying vec2 v_Uv;

    void main() {
      v_Uv = uv;
      return position;
    }
  \`;

  constructor(props) {
    // You MUST call 'super' with the current constructor as the first argument.
    // Second argument is optional and provides non-uniform parameters like blend mode, name and visibility.
    super(CustomLayer, {
      name: "CustomLayer",
      ...props,
    });
  }
}

export default CustomLayer;
`;

const AppCode = `import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { LayerMaterial, Depth, Fresnel } from "lamina";
import { useMemo, useRef } from "react";
import './scene.css';

import CustomLayer from './CustomLayer';

extend({ CustomLayer });

const Planet = () => {
  const materialRef = useRef();

  useFrame((state) => {
    const { clock } = state;
    materialRef.current.time = clock.getElapsedTime();
  });

  return (
    <mesh position={[0, 0, 0]} rotation={[0, Math.PI, 0]} scale={1.5}>
      <icosahedronGeometry args={[2, 11]} />
      <LayerMaterial lighting="lambert">
        {/* First layer is our own custom layer that's based of the FBM shader */}
        {/* 
          Notice how we can use *any* uniforms as prop here 👇
          You can tweak the colors by adding a colorA or colorB prop!
        */}
        <customLayer ref={materialRef} time={0.0} lacunarity={2.3} />
        {/* Second layer is a depth based gradient that we "add" on top of our custom layer*/}
        <Depth colorA="blue" colorB="aqua" alpha={0.9} mode="add" />
        {/* Third Layer is a Fresnel shading effect that we add on*/}
        <Fresnel color="#FEB3D9" mode="add" />
      </LayerMaterial>
    </mesh>
  );
};

const Scene = () => {
  return (
    <Canvas camera={{ position: [0.0, 0.0, 8.0] }}>
      <ambientLight intensity={0.03} />
      <directionalLight position={[0.3, 0.15, 0.0]} intensity={2} />
      <Planet />
      <OrbitControls />
    </Canvas>
  );
};

export default Scene;
`;

const PlanetFiles = {
  '/App.js': {
    code: AppCode,
  },
  '/CustomLayer.js': {
    code: CustomLayer,
  },
};

export default PlanetFiles;
