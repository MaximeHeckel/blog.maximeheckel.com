const WaterColorMaterial = `import * as THREE from "three";

const noise = \`
  vec4 permute(vec4 x) {
    return mod(((x*34.0)+1.0)*x, 289.0);
  }
  
  vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
  }
  
  vec3 fade(vec3 t) {
    return t*t*t*(t*(t*6.0-15.0)+10.0);
  }
  
  float cnoise(vec3 P) {
    vec3 Pi0 = floor(P); // Integer part for indexing
    vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
    Pi0 = mod(Pi0, 289.0);
    Pi1 = mod(Pi1, 289.0);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;
  
    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);
  
    vec4 gx0 = ixy0 / 7.0;
    vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  
    vec4 gx1 = ixy1 / 7.0;
    vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  
    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
  
    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;
  
    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);
  
    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
    return 2.2 * n_xyz;
  }

  vec3 noise3D(vec3 p) {
    // You can replace this with your preferred Simplex or Perlin noise algorithm
    return vec3(cnoise(p), cnoise(p + 10.0), cnoise(p + 20.0));
  }
  vec3 proceduralNoise(vec3 position, float scale, float detail, float roughness, float lacunarity) {
    vec3 pos = position * scale;

    // Initial noise
    vec3 result = noise3D(pos);
    
    // Apply detail through octaves
    float amplitude = .5;
    float frequency = 2.0;
    
    for (int i = 0; i < int(detail); i++) {
        result += amplitude * noise3D(pos * frequency);
        amplitude *= roughness; // roughness reduces amplitude of each layer
        frequency *= lacunarity; // lacunarity increases frequency of each layer
    }
  

    return result;
  }
\`;

const voronoiNoise = \`
  // Voronoi GLSL function
  vec4 voronoi(vec2 position, float randomness) {
      vec2 cellId = floor(position);
      vec2 localPos = fract(position);
      vec2 closestPoint = vec2(0.0);
      vec2 closestPointPosition = vec2(0.0);
      float minDist = 8.0; // Large value for distance comparison

      // Loop through the 3x3 neighboring cells
      for (int x = -1; x <= 1; x++) {
          for (int y = -1; y <= 1; y++) {
              vec2 neighbor = vec2(x, y);
              vec2 point = cellId + neighbor;
              // Randomize point inside the cell
              vec2 randomOffset = fract(sin(vec2(dot(point, vec2(12.9898, 78.233)), dot(point, vec2(34.5678, 90.1234))) * 43758.5453));
              vec2 candidatePoint = neighbor + mix(vec2(0.5), randomOffset, randomness) * 0.5;
            

              // Compute Euclidean distance to candidate point
              vec2 diff = localPos - candidatePoint;
              float dist = length(diff);

              // Update closest point
              if (dist < minDist) {
                  minDist = dist;
                  closestPoint = candidatePoint;
                  closestPointPosition = point + cellId;
              }
          }
      }

      return vec4(minDist, closestPointPosition.x, closestPointPosition.y, 0.0);
  }
\`;

class WatercolorMaterial extends THREE.MeshStandardMaterial {
  constructor() {
    super();

    this.uniforms = {
      uSeed: { value: Math.random() },
      uScale: { value: 1.0 },
      uColorLevels: { value: 5.0 },
      uTime: { value: 0 },
      uPaintNormalMap: { value: null },
    };

    this.onBeforeCompile = (shader) => {
      shader.uniforms = {
        ...shader.uniforms,
        ...this.uniforms,
      };

      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        \`
        #include <common>
        uniform float uSeed;
        uniform float uScale;
        uniform float uColorLevels;
        uniform float uTime;
        \${voronoiNoise}
        varying vec3 vPosition;
        varying vec2 vUv; // Add this line
        \`
      );

      shader.vertexShader = shader.vertexShader.replace(
        "#include <uv_vertex>",
        \`
        #include <uv_vertex>
        vUv = uv;
        vPosition = position;
        \`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        \`
        #include <common>
        uniform float uSeed;
        uniform float uScale;
        uniform float uColorLevels;
        uniform float uTime;
        varying vec3 vPosition;
        varying vec2 vUv; // Add this line
        \${voronoiNoise}
        \${noise}
        uniform sampler2D uPaintNormalMap;

        vec3 quantizeColor(vec3 color, float levels) {
          return floor(color * levels + 0.5) / levels;
        }



        vec3 colorRamp(float t) {
    // Define colors for the ramp (you can add more stops)
    vec3 color1 = vec3(0.0, 0.0, 1.0); // Blue
    vec3 color2 = vec3(0.0, 1.0, 1.0); // Green
    vec3 color3 = vec3(1.0, 1.0, 1.0); // Yellow
    vec3 color4 = vec3(1.0, 0.0, 0.0); // Red

    // Clamp 't' to stay between 0.0 and 1.0
    t = clamp(t, 0.0, 1.0);

    // Interpolate between colors based on 't'
    if (t < 0.33) {
        // Transition from color1 to color2
        return mix(color1, color2, t / 0.33);
    } else if (t < 0.66) {
        // Transition from color2 to color3
        return mix(color2, color3, (t - 0.33) / 0.33);
    } else {
        // Transition from color3 to color4
        return mix(color3, color4, (t - 0.66) / 0.34);
    }
}
       \`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <color_fragment>",
        \`
        #include <color_fragment>

        
        // grayscale
        float lum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114)) ;
        // quantize
        //diffuseColor.rgb = colorRamp(lum);
         diffuseColor.rgb = quantizeColor(diffuseColor.rgb, uColorLevels);
        \`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <normal_fragment_begin>",
        \`
        #include <normal_fragment_begin>
       
        // Sample the paint normal map
        vec3 paintNormal = texture2D(uPaintNormalMap, vUv).rgb;
        
        //   vec3 proceduralNoise(vec3 position, float scale, float detail, float roughness, float lacunarity)
        vec3 noiseColor = (proceduralNoise(vPosition, 4.9, 3.0, 0.5, 2.0) -0.5) *0.3;

   

        vec3 modifiedNormal = mix(normal, noiseColor, 0.4);
        modifiedNormal = mix(modifiedNormal, paintNormal, 0.25);

        vec4 voronoiValue = voronoi(modifiedNormal.xy * uScale, 1.0);
        float voronoiDist = voronoiValue.x;
        vec2 voronoiPosition = voronoiValue.yz;
        
        vec3 perturbation = normalize(vec3(voronoiPosition, 1.0) - 0.5);
        
        normal = perturbation;
        \`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        \`
        // vec3 tex = texture2D(uPaintNormalMap, vUv).rgb;
        // gl_FragColor = vec4(tex, 1.0);
        #include <dithering_fragment>\`
      );
    };

    Object.keys(this.uniforms).forEach((name) =>
      Object.defineProperty(this, name, {
        get: () => this.uniforms[name].value,
        set: (v) => (this.uniforms[name].value = v),
      })
    );
  }
}

export default WatercolorMaterial;
`;

const AppCode = `import { 
  OrbitControls,
  OrthographicCamera,
  useFBO,
  Outlines,
  Edges,
  useTexture
} from "@react-three/drei";
import { Canvas, useFrame, extend } from "@react-three/fiber";

import { Suspense, useRef } from "react";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import WaterColorMaterial from "./WaterColorMaterial";

import './scene.css';

extend({ WaterColorMaterial });

const Painting = () => {
  const materialRef = useRef();

  const paintNormalTexture = useTexture("https://cdn.maximeheckel.com/textures/paint-normal.jpg");

  paintNormalTexture.minFilter = THREE.LinearMipmapLinearFilter;
  paintNormalTexture.magFilter = THREE.LinearFilter;
  paintNormalTexture.generateMipmaps = true;

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uPaintNormalMap.value = paintNormalTexture;
    }
  });

  return (
     <mesh receiveShadow castShadow>
      <torusKnotGeometry args={[0.5, 0.2, 256, 256]} />
      <waterColorMaterial
        ref={materialRef}
        key={uuidv4()}
        color="hotpink"
        uScale={9.0}
        uColorLevels={4.0}
      />
      <Outlines thickness={0.0} transparent />
      <Edges />
    </mesh>
  );
};

const Scene = () => {
  return (
    <Canvas dpr={[1, 2]}>
      <Suspense fallback="Loading">
        <ambientLight intensity={1.25} />
        <directionalLight position={[-5, 5, 5]} intensity={7} />
        <color attach="background" args={["#3386E0"]} />
        <Painting />
        <OrbitControls />
        <OrthographicCamera
          makeDefault
          position={[5, 0, 10]}
          zoom={200}
          near={0.01}
          far={500}
        />
      </Suspense>
    </Canvas>
  );
};


export default Scene;`;

const Basic = {
  '/App.js': {
    code: AppCode,
  },
  '/WaterColorMaterial.js': {
    code: WaterColorMaterial,
  },
};

export default Basic;
