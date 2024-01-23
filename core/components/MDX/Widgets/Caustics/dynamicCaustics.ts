const vertexBase = `
uniform float time;
uniform bool uDisplace;
uniform float uFrequency;
uniform float uAmplitude;


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

vec3 orthogonal(vec3 v) {
  return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0)
  : vec3(0.0, -v.z, v.y));
}


float displace(vec3 point) {
  if(uDisplace) {
      return cnoise(point * uFrequency + vec3(time)) * uAmplitude;
  }
  return 0.0;
}
`;

const vertexDisplacement = `
#include <clipping_planes_vertex>

vec3 displacedPosition = position + normal * displace(position);
vec4 modelPosition = modelMatrix * vec4(displacedPosition, 1.0);
vec4 viewPosition = viewMatrix * modelPosition;
vec4 projectedPosition = projectionMatrix * viewPosition;
gl_Position = projectedPosition;

float offset = 4.0/256.0;
vec3 tangent = orthogonal(normal);
vec3 bitangent = normalize(cross(normal, tangent));
vec3 neighbour1 = position + tangent * offset;
vec3 neighbour2 = position + bitangent * offset;
vec3 displacedNeighbour1 = neighbour1 + normal * displace(neighbour1);
vec3 displacedNeighbour2 = neighbour2 + normal * displace(neighbour2);

vec3 displacedTangent = displacedNeighbour1 - displacedPosition;
vec3 displacedBitangent = displacedNeighbour2 - displacedPosition;

// https://upload.wikimedia.org/wikipedia/commons/d/d2/Right_hand_rule_cross_product.svg
vec3 displacedNormal = normalize(cross(displacedTangent, displacedBitangent));
vNormal = displacedNormal * normalMatrix;
`;

const causticsComputeFragment = `
uniform sampler2D uTexture;
varying vec2 vUv;
varying vec3 vPosition;
uniform vec3 uLight;
uniform float uIntensity;

void main() {
  vec2 uv = vUv;
  float scale = 0.0;

  vec3 normalTexture = texture2D(uTexture, uv).rgb;
  vec3 normal = normalize(normalTexture);
  vec3 lightDir = normalize(uLight);
  
  vec3 ray = refract(lightDir, normal, 1.0 / 1.25);

  vec3 newPos = vPosition.xyz + ray;
  vec3 oldPos = vPosition.xyz;

  float lightArea = length(dFdx(oldPos)) * length(dFdy(oldPos));
  float newLightArea = length(dFdx(newPos)) * length(dFdy(newPos));
  
  float value = lightArea / newLightArea * 0.2;
  scale += clamp(value, 0.0, 1.0) * uIntensity;
  scale *= scale;


  gl_FragColor = vec4(vec3(scale), 1.0);
}
`;

const MeshTransmissionMaterial = `import * as THREE from "three";
import React from "react";
import { extend, useFrame } from "@react-three/fiber";
import { useFBO, MeshDiscardMaterial } from "@react-three/drei";

import vertexShader from "!!raw-loader!./vertexBase.glsl";
import vertexReplace from "!!raw-loader!./vertexDisplacement.glsl";

class MeshTransmissionMaterialImpl extends THREE.MeshPhysicalMaterial {
  constructor(samples = 6, transmissionSampler = false) {
    super();

    this.uniforms = {
      chromaticAberration: { value: 0.05 },
      // Transmission must always be 0, unless transmissionSampler is being used
      transmission: { value: 0 },
      // Instead a workaround is used, see below for reasons why
      _transmission: { value: 1 },
      transmissionMap: { value: null },
      // Roughness is 1 in THREE.MeshPhysicalMaterial but it makes little sense in a transmission material
      roughness: { value: 0 },
      thickness: { value: 0 },
      thicknessMap: { value: null },
      attenuationDistance: { value: Infinity },
      attenuationColor: { value: new THREE.Color("white") },
      anisotropicBlur: { value: 0.1 },
      time: { value: 0 },
      distortion: { value: 0.0 },
      distortionScale: { value: 0.5 },
      temporalDistortion: { value: 0.0 },
      buffer: { value: null },
      uDisplace: { value: true },
      uFrequency: { value: 0.5 },
      uAmplitude: { value: 0.25 },
    };

    this.onBeforeCompile = (shader) => {
      shader.uniforms = {
        ...shader.uniforms,
        ...this.uniforms,
      };

      // Fix for r153-r156 anisotropy chunks
      // https://github.com/mrdoob/three.js/pull/26716
      if (this.anisotropy > 0) shader.defines.USE_ANISOTROPY = "";

      // If the transmission sampler is active inject a flag
      if (transmissionSampler) shader.defines.USE_SAMPLER = "";
      // Otherwise we do use use .transmission and must therefore force USE_TRANSMISSION
      // because threejs won't inject it for us
      else shader.defines.USE_TRANSMISSION = "";

      // Head
      shader.fragmentShader =
        /*glsl*/ \`
        uniform float chromaticAberration;         
        uniform float anisotropicBlur;      
        uniform float time;
        uniform float distortion;
        uniform float distortionScale;
        uniform float temporalDistortion;
        uniform sampler2D buffer;
  
        vec3 random3(vec3 c) {
          float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
          vec3 r;
          r.z = fract(512.0*j);
          j *= .125;
          r.x = fract(512.0*j);
          j *= .125;
          r.y = fract(512.0*j);
          return r-0.5;
        }
  
        float seed = 0.0;
        uint hash( uint x ) {
          x += ( x << 10u );
          x ^= ( x >>  6u );
          x += ( x <<  3u );
          x ^= ( x >> 11u );
          x += ( x << 15u );
          return x;
        }
  
        // Compound versions of the hashing algorithm I whipped together.
        uint hash( uvec2 v ) { return hash( v.x ^ hash(v.y)                         ); }
        uint hash( uvec3 v ) { return hash( v.x ^ hash(v.y) ^ hash(v.z)             ); }
        uint hash( uvec4 v ) { return hash( v.x ^ hash(v.y) ^ hash(v.z) ^ hash(v.w) ); }
  
        // Construct a float with half-open range [0:1] using low 23 bits.
        // All zeroes yields 0.0, all ones yields the next smallest representable value below 1.0.
        float floatConstruct( uint m ) {
          const uint ieeeMantissa = 0x007FFFFFu; // binary32 mantissa bitmask
          const uint ieeeOne      = 0x3F800000u; // 1.0 in IEEE binary32
          m &= ieeeMantissa;                     // Keep only mantissa bits (fractional part)
          m |= ieeeOne;                          // Add fractional part to 1.0
          float  f = uintBitsToFloat( m );       // Range [1:2]
          return f - 1.0;                        // Range [0:1]
        }
  
        // Pseudo-random value in half-open range [0:1].
        float random( float x ) { return floatConstruct(hash(floatBitsToUint(x))); }
        float random( vec2  v ) { return floatConstruct(hash(floatBitsToUint(v))); }
        float random( vec3  v ) { return floatConstruct(hash(floatBitsToUint(v))); }
        float random( vec4  v ) { return floatConstruct(hash(floatBitsToUint(v))); }
  
        float rand() {
          float result = random(vec3(gl_FragCoord.xy, seed));
          seed += 1.0;
          return result;
        }
  
        const float F3 =  0.3333333;
        const float G3 =  0.1666667;
  
        float snoise(vec3 p) {
          vec3 s = floor(p + dot(p, vec3(F3)));
          vec3 x = p - s + dot(s, vec3(G3));
          vec3 e = step(vec3(0.0), x - x.yzx);
          vec3 i1 = e*(1.0 - e.zxy);
          vec3 i2 = 1.0 - e.zxy*(1.0 - e);
          vec3 x1 = x - i1 + G3;
          vec3 x2 = x - i2 + 2.0*G3;
          vec3 x3 = x - 1.0 + 3.0*G3;
          vec4 w, d;
          w.x = dot(x, x);
          w.y = dot(x1, x1);
          w.z = dot(x2, x2);
          w.w = dot(x3, x3);
          w = max(0.6 - w, 0.0);
          d.x = dot(random3(s), x);
          d.y = dot(random3(s + i1), x1);
          d.z = dot(random3(s + i2), x2);
          d.w = dot(random3(s + 1.0), x3);
          w *= w;
          w *= w;
          d *= w;
          return dot(d, vec4(52.0));
        }
  
        float snoiseFractal(vec3 m) {
          return 0.5333333* snoise(m)
                +0.2666667* snoise(2.0*m)
                +0.1333333* snoise(4.0*m)
                +0.0666667* snoise(8.0*m);
        }\n\` + shader.fragmentShader;

      // Remove transmission
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <transmission_pars_fragment>",
        /*glsl*/ \`
          #ifdef USE_TRANSMISSION
            // Transmission code is based on glTF-Sampler-Viewer
            // https://github.com/KhronosGroup/glTF-Sample-Viewer
            uniform float _transmission;
            uniform float thickness;
            uniform float attenuationDistance;
            uniform vec3 attenuationColor;
            #ifdef USE_TRANSMISSIONMAP
              uniform sampler2D transmissionMap;
            #endif
            #ifdef USE_THICKNESSMAP
              uniform sampler2D thicknessMap;
            #endif
            uniform vec2 transmissionSamplerSize;
            uniform sampler2D transmissionSamplerMap;
            uniform mat4 modelMatrix;
            uniform mat4 projectionMatrix;
            varying vec3 vWorldPosition;
            vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
              // Direction of refracted light.
              vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
              // Compute rotation-independant scaling of the model matrix.
              vec3 modelScale;
              modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
              modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
              modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
              // The thickness is specified in local space.
              return normalize( refractionVector ) * thickness * modelScale;
            }
            float applyIorToRoughness( const in float roughness, const in float ior ) {
              // Scale roughness with IOR so that an IOR of 1.0 results in no microfacet refraction and
              // an IOR of 1.5 results in the default amount of microfacet refraction.
              return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
            }
            vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
              float framebufferLod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );            
              #ifdef USE_SAMPLER
                #ifdef texture2DLodEXT
                  return texture2DLodEXT(transmissionSamplerMap, fragCoord.xy, framebufferLod);
                #else
                  return texture2D(transmissionSamplerMap, fragCoord.xy, framebufferLod);
                #endif
              #else
                return texture2D(buffer, fragCoord.xy);
              #endif
            }
            vec3 applyVolumeAttenuation( const in vec3 radiance, const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
              if ( isinf( attenuationDistance ) ) {
                // Attenuation distance is +∞, i.e. the transmitted color is not attenuated at all.
                return radiance;
              } else {
                // Compute light attenuation using Beer's law.
                vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
                vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance ); // Beer's law
                return transmittance * radiance;
              }
            }
            vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
              const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
              const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
              const in vec3 attenuationColor, const in float attenuationDistance ) {
              vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
              vec3 refractedRayExit = position + transmissionRay;
              // Project refracted vector on the framebuffer, while mapping to normalized device coordinates.
              vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
              vec2 refractionCoords = ndcPos.xy / ndcPos.w;
              refractionCoords += 1.0;
              refractionCoords /= 2.0;
              // Sample framebuffer to get pixel the refracted ray hits.
              vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
              vec3 attenuatedColor = applyVolumeAttenuation( transmittedLight.rgb, length( transmissionRay ), attenuationColor, attenuationDistance );
              // Get the specular component.
              vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
              return vec4( ( 1.0 - F ) * attenuatedColor * diffuseColor, transmittedLight.a );
            }
          #endif\n\`
      );

      // Add refraction
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <transmission_fragment>",
        /*glsl*/ \`  
          // Improve the refraction to use the world pos
          material.transmission = _transmission;
          material.transmissionAlpha = 1.0;
          material.thickness = thickness;
          material.attenuationDistance = attenuationDistance;
          material.attenuationColor = attenuationColor;
          #ifdef USE_TRANSMISSIONMAP
            material.transmission *= texture2D( transmissionMap, vUv ).r;
          #endif
          #ifdef USE_THICKNESSMAP
            material.thickness *= texture2D( thicknessMap, vUv ).g;
          #endif
          
          vec3 pos = vWorldPosition;
          vec3 v = normalize( cameraPosition - pos );
          vec3 n = inverseTransformDirection( normal, viewMatrix );
          vec3 transmission = vec3(0.0);
          float transmissionR, transmissionB, transmissionG;
          float randomCoords = rand();
          float thickness_smear = thickness * max(pow(roughnessFactor, 0.33), anisotropicBlur);
          vec3 distortionNormal = vec3(0.0);
          vec3 temporalOffset = vec3(time, -time, -time) * temporalDistortion;
          if (distortion > 0.0) {
            distortionNormal = distortion * vec3(snoiseFractal(vec3((pos * distortionScale + temporalOffset))), snoiseFractal(vec3(pos.zxy * distortionScale - temporalOffset)), snoiseFractal(vec3(pos.yxz * distortionScale + temporalOffset)));
          }
          for (float i = 0.0; i < \${samples}.0; i ++) {
            vec3 sampleNorm = normalize(n + roughnessFactor * roughnessFactor * 2.0 * normalize(vec3(rand() - 0.5, rand() - 0.5, rand() - 0.5)) * pow(rand(), 0.33) + distortionNormal);
            transmissionR = getIBLVolumeRefraction(
              sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
              pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness  + thickness_smear * (i + randomCoords) / float(\${samples}),
              material.attenuationColor, material.attenuationDistance
            ).r;
            transmissionG = getIBLVolumeRefraction(
              sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
              pos, modelMatrix, viewMatrix, projectionMatrix, material.ior  * (1.0 + chromaticAberration * (i + randomCoords) / float(\${samples})) , material.thickness + thickness_smear * (i + randomCoords) / float(\${samples}),
              material.attenuationColor, material.attenuationDistance
            ).g;
            transmissionB = getIBLVolumeRefraction(
              sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
              pos, modelMatrix, viewMatrix, projectionMatrix, material.ior * (1.0 + 2.0 * chromaticAberration * (i + randomCoords) / float(\${samples})), material.thickness + thickness_smear * (i + randomCoords) / float(\${samples}),
              material.attenuationColor, material.attenuationDistance
            ).b;
            transmission.r += transmissionR;
            transmission.g += transmissionG;
            transmission.b += transmissionB;
          }
          transmission /= \${samples}.0;
          totalDiffuse = mix( totalDiffuse, transmission.rgb, material.transmission );\n\`
      );

      shader.vertexShader = vertexShader + shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace(
        "#include <clipping_planes_vertex>",
        vertexReplace
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

export const MeshTransmissionMaterial = React.forwardRef(
  (
    {
      buffer,
      transmissionSampler = false,
      backside = false,
      side = THREE.FrontSide,
      transmission = 1,
      thickness = 0,
      backsideThickness = 0,
      samples = 10,
      resolution,
      backsideResolution,
      background,
      anisotropy,
      anisotropicBlur,
      uDisplace,
      uFrequency,
      uAmplitude,
      ...props
    },
    fref
  ) => {
    extend({ MeshTransmissionMaterial: MeshTransmissionMaterialImpl });

    const ref = React.useRef(null);
    const [discardMaterial] = React.useState(() => <MeshDiscardMaterial />);
    const fboBack = useFBO(backsideResolution || resolution);
    const fboMain = useFBO(resolution);

    let oldBg;
    let oldTone;
    let parent;
    useFrame((state) => {
      ref.current.time = state.clock.getElapsedTime();
      // Render only if the buffer matches the built-in and no transmission sampler is set
      if (ref.current.buffer === fboMain.texture && !transmissionSampler) {
        parent = ref.current.__r3f.parent;
        if (parent) {
          // Save defaults
          oldTone = state.gl.toneMapping;
          oldBg = state.scene.background;

          // Switch off tonemapping lest it double tone maps
          // Save the current background and set the HDR as the new BG
          // Use discardmaterial, the parent will be invisible, but it's shadows will still be cast
          state.gl.toneMapping = THREE.NoToneMapping;
          if (background) state.scene.background = background;
          parent.material = discardMaterial;

          if (backside) {
            // Render into the backside buffer
            state.gl.setRenderTarget(fboBack);
            state.gl.render(state.scene, state.camera);
            // And now prepare the material for the main render using the backside buffer
            parent.material = ref.current;
            parent.material.buffer = fboBack.texture;
            parent.material.thickness = backsideThickness;
            parent.material.side = THREE.BackSide;
          }

          // Render into the main buffer
          state.gl.setRenderTarget(fboMain);
          state.gl.render(state.scene, state.camera);

          parent.material = ref.current;
          parent.material.thickness = thickness;
          parent.material.side = side;
          parent.material.buffer = fboMain.texture;

          // Set old state back
          state.scene.background = oldBg;
          state.gl.setRenderTarget(null);
          state.gl.toneMapping = oldTone;
        }
      }
    });

    // Forward ref
    React.useImperativeHandle(fref, () => ref.current, []);

    return (
      <meshTransmissionMaterial
        // Samples must re-compile the shader so we memoize it
        args={[samples, transmissionSampler]}
        ref={ref}
        {...props}
        buffer={buffer || fboMain.texture}
        // @ts-ignore
        _transmission={transmission}
        // In order for this to not incur extra cost "transmission" must be set to 0 and treated as a reserved prop.
        // This is because THREE.WebGLRenderer will check for transmission > 0 and execute extra renders.
        // The exception is when transmissionSampler is set, in which case we are using three's built in sampler.
        anisotropicBlur={anisotropicBlur ?? anisotropy}
        transmission={transmissionSampler ? transmission : 0}
        thickness={thickness}
        side={side}
      />
    );
  }
);

MeshTransmissionMaterial.displayName = "MeshTransmissionMaterial";
`;

const CausticsComputeMaterial = `import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

import fragmentShader from "!!raw-loader!./causticsComputeFragment.glsl";

const vertexShader = \`
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vPosition = worldPosition.xyz;

  vec4 viewPosition = viewMatrix * worldPosition;
  gl_Position = projectionMatrix * viewPosition;
  
}
\`;

const CausticsComputeMaterial = shaderMaterial(
  {
    uLight: { value: new THREE.Vector2(0, 0, 0) },
    uTexture: { value: null },
    uIntensity: { value: 1.0 },
  },
  vertexShader,
  fragmentShader
);

export default CausticsComputeMaterial;
`;

const NormalMaterial = `import { shaderMaterial } from "@react-three/drei";

const vertexShader = \`
uniform float time;
uniform bool uDisplace;
uniform float uFrequency;
uniform float uAmplitude;

varying vec2 vUv;
varying vec3 vNormal;

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

vec3 orthogonal(vec3 v) {
  return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0)
  : vec3(0.0, -v.z, v.y));
}

float displace(vec3 point) {
  if(uDisplace) {
      return cnoise(point * uFrequency + vec3(time)) * uAmplitude;
  }
  return 0.0;
}

void main() {
  vUv = uv;

  vec3 displacedPosition = position + normal * displace(position);
  vec4 modelPosition = modelMatrix * vec4(displacedPosition, 1.0);
 

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  float offset = 4.0/256.0;
  vec3 tangent = orthogonal(normal);
  vec3 bitangent = normalize(cross(normal, tangent));
  vec3 neighbour1 = position + tangent * offset;
  vec3 neighbour2 = position + bitangent * offset;
  vec3 displacedNeighbour1 = neighbour1 + normal * displace(neighbour1);
  vec3 displacedNeighbour2 = neighbour2 + normal * displace(neighbour2);

  vec3 displacedTangent = displacedNeighbour1 - displacedPosition;
  vec3 displacedBitangent = displacedNeighbour2 - displacedPosition;

  // https://upload.wikimedia.org/wikipedia/commons/d/d2/Right_hand_rule_cross_product.svg
  vec3 displacedNormal = normalize(cross(displacedTangent, displacedBitangent));

  vNormal = displacedNormal * normalMatrix;
}
\`;

const fragmentShader = \`
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vec3 normal = normalize(vNormal);
    gl_FragColor = vec4(normal * 0.5 + 0.5, 1.0);
  }
\`;

const NormalMaterial = shaderMaterial(
  {
    time: { value: 0.0 },
    uDisplace: { value: true },
    uAmplitude: { value: 0.25 },
    uFrequency: { value: 0.75 },
  }, 
  vertexShader, 
  fragmentShader
);

export default NormalMaterial;
`;

const causticsPlaneFragmentShader = `uniform sampler2D uTexture;
uniform float uAberration;

varying vec2 vUv;

const int SAMPLES = 16;

float random(vec2 p){
  return fract(sin(dot(p.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec3 sat(vec3 rgb, float adjustment) {
  const vec3 W = vec3(0.2125, 0.7154, 0.0721);
  vec3 intensity = vec3(dot(rgb, W));
  return mix(intensity, rgb, adjustment);
}

void main() {
  vec2 uv = vUv;
  vec4 color = vec4(0.0);
  
  vec3 refractCol = vec3(0.0);

  float flip = -0.5;

  for ( int i = 0; i < SAMPLES; i ++ ) {
    float noiseIntensity = 0.01; 
    float noise = random(uv) * noiseIntensity;
    float slide = float(i) / float(SAMPLES) * 0.1 + noise;

    
    float mult = i % 2 == 0 ? 1.0 : -1.0;
    flip *= mult;

    vec2 dir = i % 2 == 0 ? vec2(flip, 0.0) : vec2(0.0, flip);

  
    refractCol.r += texture2D(uTexture, uv + (uAberration * slide * dir * 1.0) ).r;
    refractCol.g += texture2D(uTexture, uv + (uAberration * slide * dir * 2.0) ).g;
    refractCol.b += texture2D(uTexture, uv + (uAberration * slide * dir * 3.0) ).b;
  }
  // Divide by the number of layers to normalize colors (rgb values can be worth up to the value of SAMPLES)
  refractCol /= float(SAMPLES);
  refractCol = sat(refractCol, 1.265);

  color = vec4(refractCol.r, refractCol.g, refractCol.b, 1.0);

  gl_FragColor = vec4(color.rgb, 1.0);

  #include <tonemapping_fragment>
  #include <encodings_fragment>
}
`;

const CausticsPlaneMaterial = `import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

import fragmentShader from "!!raw-loader!./causticsPlaneFragmentShader.glsl";

const vertexShader = \`
varying vec2 vUv;

void main() {
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);

  vec4 viewPosition = viewMatrix * worldPosition;
  gl_Position = projectionMatrix * viewPosition;
}
\`;

const CausticsPlaneMaterial = shaderMaterial(
  {
    uLight: { value: new THREE.Vector2(0, 0, 0) },
    uTexture: { value: null },
    uAberration: { value: 0.02 },
  },
  vertexShader,
  fragmentShader
);

export default CausticsPlaneMaterial;
`;

const AppCode = `import { 
  OrbitControls, 
  Environment,
  PerspectiveCamera,
  useFBO,
  SpotLight,
  useGLTF,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { useRef, useState, useMemo, forwardRef } from "react";
import * as THREE from "three";
import { FullScreenQuad } from "three-stdlib";

import CausticsPlaneMaterial from "./CausticsPlaneMaterial";
import CausticsComputeMaterial from "./CausticsComputeMaterial";
import NormalMaterial from "./NormalMaterial";
import { MeshTransmissionMaterial } from "./MeshTransmissionMaterial";

import './scene.css';

const config = {
  backsideThickness: 0.3,
  thickness: 0.3,
  samples: 8,
  transmission: 0.9,
  clearcoat: 0.4,
  clearcoatRoughness: 0.1,
  chromaticAberration: 1.25,
  anisotropy: 0.2,
  roughness: 0,
  distortion: 0,
  distortionScale: 0.09,
  temporalDistortion: 0,
  ior: 1.25,
  color: "#ffffff",
};

const BUNNY_GEOMETRY_URL = "https://cdn.maximeheckel.com/models/bunny.glb";

const BunnyGeometry = forwardRef((props, ref) => {
  const { nodes } = useGLTF(BUNNY_GEOMETRY_URL);

  return (
    <mesh
      ref={ref}
      geometry={nodes.Stanford_Bunny.geometry}
      scale={0.025}
      position={[0, 6.5, 0]}
      rotation={[0, 0, 0]}
    >
      <MeshTransmissionMaterial backside {...config} />
    </mesh>
  )
})

const SphereGeometry = forwardRef((props, ref) => {
  return (
    <mesh
      ref={ref}
      scale={2}
      position={[0, 6.5, 0]}
    >
      <sphereGeometry args={[3, 512, 512]} />
      <MeshTransmissionMaterial backside {...config} />
    </mesh>
  )
})

const TorusGeometry = forwardRef((props, ref) => {
  return (
    <mesh
      ref={ref}
      scale={0.4}
      position={[0, 6.5, 0]}
    >
      <torusKnotGeometry args={[10, 3, 600, 160]} />
      <MeshTransmissionMaterial backside {...config} />
    </mesh>
  )
})

const Caustics = () => {
  const mesh = useRef();
  const causticsPlane = useRef();
  const spotlightRef = useRef();

  

  const {
    light,
    intensity,
    chromaticAberration,
    displace,
    amplitude,
    frequency,
    geometry,
  } = useControls({
    light: {
      value: new THREE.Vector3(-10, 13, -10),
    },
    geometry: {
      value: "sphere",
      options: [ "sphere", "torus", "bunny",],
    },
    intensity: {
      value: 1.5,
      step: 0.01,
      min: 0,
      max: 10.0,
    },
    chromaticAberration: {
      value: 0.16,
      step: 0.001,
      min: 0,
      max: 0.4,
    },
    displace: {
      value: true,
    },
    amplitude: {
      value: 0.13,
      step: 0.01,
      min: 0,
      max: 1,
    },
    frequency: {
      value: 0.65,
      step: 0.01,
      min: 0,
      max: 4,
    },
  });

  const TargetMesh = useMemo(() => {
    switch (geometry) {
      case "sphere":
        return SphereGeometry;
      case "torus":
        return TorusGeometry;
      case "bunny":
        return BunnyGeometry;
      default:
        return SphereGeometry;
    }
  }, [geometry])

  const normalRenderTarget = useFBO(2000, 2000, {});
  const [normalCamera] = useState(
    () => new THREE.PerspectiveCamera(65, 1, 0.1, 1000)
  );
  const [normalMaterial] = useState(() => new NormalMaterial());


  const causticsComputeRenderTarget = useFBO(2000, 2000, {});
  const [causticsQuad] = useState(() => new FullScreenQuad());
  const [causticsComputeMaterial] = useState(() => new CausticsComputeMaterial());

  const [causticsPlaneMaterial] = useState(() => new CausticsPlaneMaterial());
  causticsPlaneMaterial.transparent = true;
  causticsPlaneMaterial.blending = THREE.CustomBlending;
  causticsPlaneMaterial.blendSrc = THREE.OneFactor;
  causticsPlaneMaterial.blendDst = THREE.SrcAlphaFactor;

  useFrame((state) => {
    const { gl, clock, camera } = state;

    camera.lookAt(0, 0, 0);

    const bounds = new THREE.Box3().setFromObject(mesh.current, true);

    let boundsVertices = [];
    boundsVertices.push(
      new THREE.Vector3(bounds.min.x, bounds.min.y, bounds.min.z)
    );
    boundsVertices.push(
      new THREE.Vector3(bounds.min.x, bounds.min.y, bounds.max.z)
    );
    boundsVertices.push(
      new THREE.Vector3(bounds.min.x, bounds.max.y, bounds.min.z)
    );
    boundsVertices.push(
      new THREE.Vector3(bounds.min.x, bounds.max.y, bounds.max.z)
    );
    boundsVertices.push(
      new THREE.Vector3(bounds.max.x, bounds.min.y, bounds.min.z)
    );
    boundsVertices.push(
      new THREE.Vector3(bounds.max.x, bounds.min.y, bounds.max.z)
    );
    boundsVertices.push(
      new THREE.Vector3(bounds.max.x, bounds.max.y, bounds.min.z)
    );
    boundsVertices.push(
      new THREE.Vector3(bounds.max.x, bounds.max.y, bounds.max.z)
    );

    const lightDir = new THREE.Vector3(
      light.x,
      light.y,
      light.z
    ).normalize();

    // Calculates the projected coordinates of the vertices onto the plane
    // perpendicular to the light direction
    const projectedCoordinates = boundsVertices.map((v) =>
      {
        const newX = v.x + lightDir.x * (-v.y / lightDir.y);
        const newY = v.y + lightDir.y * (-v.y / lightDir.y);
        const newZ = v.z + lightDir.z * (-v.y / lightDir.y);

        return new THREE.Vector3(newX, newY, newZ);
      }
    );

    // Calculates the combined spatial coordinates of the projected vertices
    // and divides by the number of vertices to get the center position
    const centerPos = projectedCoordinates
      .reduce((a, b) => a.add(b), new THREE.Vector3(0, 0, 0))
      .divideScalar(projectedCoordinates.length);

    // Calculates the scale of the caustic plane based on the distance of the
    // furthest vertex from the center (using euclidean distance)
    const scale = projectedCoordinates
      .map((p) =>
        Math.sqrt(
          Math.pow(p.x - centerPos.x, 2),
          Math.pow(p.z - centerPos.z, 2)
        )
      )
      .reduce((a, b) => Math.max(a, b), 0);

    // The scale of the plane is multiplied by this correction factor to
    // avoid the caustics pattern to be cut / overflow the bounds of the plane
    // my normal projection or my math must be a bit off, so I'm trying to be very conservative here
    const scaleCorrection = 1.75;

    causticsPlane.current.scale.set(
      scale * scaleCorrection,
      scale * scaleCorrection,
      scale * scaleCorrection
    );
    causticsPlane.current.position.set(centerPos.x, centerPos.y, centerPos.z);

    normalCamera.position.set(light.x, light.y, light.z);
    normalCamera.lookAt(
      bounds.getCenter(new THREE.Vector3(0, 0, 0)).x,
      bounds.getCenter(new THREE.Vector3(0, 0, 0)).y,
      bounds.getCenter(new THREE.Vector3(0, 0, 0)).z
    );
    normalCamera.up = new THREE.Vector3(0, 1, 0);

    const originalMaterial = mesh.current.material;

    mesh.current.material = normalMaterial;
    mesh.current.material.side = THREE.BackSide;

    mesh.current.material.uniforms.time.value = clock.elapsedTime;
    mesh.current.material.uniforms.uDisplace.value = displace;
    mesh.current.material.uniforms.uAmplitude.value = amplitude;
    mesh.current.material.uniforms.uFrequency.value = frequency;

    gl.setRenderTarget(normalRenderTarget);
    gl.render(mesh.current, normalCamera);

    mesh.current.material = originalMaterial;
    mesh.current.material.uniforms.time.value = clock.elapsedTime;
    mesh.current.material.uniforms.uDisplace.value = displace;
    mesh.current.material.uniforms.uAmplitude.value = amplitude;
    mesh.current.material.uniforms.uFrequency.value = frequency;

    causticsQuad.material = causticsComputeMaterial;
    causticsQuad.material.uniforms.uTexture.value = normalRenderTarget.texture;
    causticsQuad.material.uniforms.uLight.value = light;
    causticsQuad.material.uniforms.uIntensity.value = intensity;

    gl.setRenderTarget(causticsComputeRenderTarget);
    causticsQuad.render(gl);

    causticsPlane.current.material = causticsPlaneMaterial;

    causticsPlane.current.material.uniforms.uTexture.value =
      causticsComputeRenderTarget.texture;
    causticsPlane.current.material.uniforms.uAberration.value =
    chromaticAberration;

    gl.setRenderTarget(null);

    spotlightRef.current.position.set(light.x, light.y, light.z);
    spotlightRef.current.distance = Math.sqrt(
      Math.pow(
        spotlightRef.current.position.x - causticsPlane.current.position.x,
        2
      ) +
        Math.pow(
          spotlightRef.current.position.y - causticsPlane.current.position.y,
          2
        ) +
        Math.pow(
          spotlightRef.current.position.z - causticsPlane.current.position.z,
          2
        )
    );
  });

  return (
    <>
      <SpotLight
        castShadow
        ref={spotlightRef}
        penumbra={1}
        distance={25}
        angle={0.65}
        attenuation={20}
        anglePower={10}
        intensity={1}
        color="#fff"
        target={causticsPlane.current}
      />
      <TargetMesh ref={mesh}/>
      <mesh ref={causticsPlane} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry />
      </mesh>
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.2, -0.2]}
      >
        <planeGeometry args={[50, 50]} />
        <meshPhongMaterial
          transparent
          blending={THREE.CustomBlending}
          blendSrc={THREE.OneFactor}
          blendDst={THREE.SrcAlphaFactor}
        />
      </mesh>
    </>
  );
};

const Scene = () => {
  return (
    <Canvas shadows dpr={[1, 2]}>
      <Caustics />
      <PerspectiveCamera makeDefault position={[0, 20, 20]} fov={65} />
      <Environment
        files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/syferfontein_0d_clear_puresky_1k.hdr"
        ground={{ height: 45, radius: 100, scale: 300 }}
      />
    </Canvas>
  );
};


export default Scene;
`;

const DynamicCaustics = {
  '/App.js': {
    code: AppCode,
  },
  '/NormalMaterial.js': {
    code: NormalMaterial,
    active: true,
  },
  '/MeshTransmissionMaterial.js': {
    code: MeshTransmissionMaterial,
  },
  '/vertexDisplacement.glsl': {
    code: vertexDisplacement,
  },
  '/vertexBase.glsl': {
    code: vertexBase,
  },
  '/CausticsPlaneMaterial.js': {
    code: CausticsPlaneMaterial,
    hidden: true,
  },
  '/causticsPlaneFragmentShader.glsl': {
    code: causticsPlaneFragmentShader,
    hidden: true,
  },
  '/CausticsComputeMaterial.js': {
    code: CausticsComputeMaterial,
    hidden: true,
  },
  '/causticsComputeFragment.glsl': {
    code: causticsComputeFragment,
    hidden: true,
  },
};

export default DynamicCaustics;
