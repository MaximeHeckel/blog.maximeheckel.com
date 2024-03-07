const GroundNormalVertexShader = `varying vec2 vUv;
varying vec3 vNormal;
varying vec3 eyeVector;
uniform float uTime;

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
  return cnoise(point * 0.05 - vec3(0.0, uTime * 2.5, 0.0)) * 2.5;
}

void main() {
  vUv = uv;

  vec3 displacedPosition = position + normal * displace(position);
  vec4 modelPosition = modelMatrix * vec4(displacedPosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;

  eyeVector = normalize(modelPosition.xyz - cameraPosition);

  float offset = 0.01;
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
`;

const GroundNormalMaterial = `import * as THREE from "three";

import vertexShader from "!!raw-loader!./GroundNormalVertexShader.glsl";
import fragmentShader from "!!raw-loader!./CustomNormalFragmentShader.glsl";

const groundNormalShader = {
  uniforms: {
    uTime: { value: 0.0 },
    lightPosition: { value: new THREE.Vector3() },
  },
  vertexShader,
  fragmentShader,
}

const GroundNormalMaterial = new THREE.ShaderMaterial(groundNormalShader);

export default GroundNormalMaterial;
`;

const GroundMaterial = `import * as THREE from "three";

class GroundMaterial extends THREE.MeshStandardMaterial {
  constructor() {
    super();

    this.uniforms = {
      uTime: { value: 0.0 },
    };

    this.onBeforeCompile = (shader) => {
      shader.uniforms = {
        ...shader.uniforms,
        ...this.uniforms,
      };

      shader.vertexShader =\`uniform float uTime;
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
        return cnoise(point * 0.05 - vec3(0.0, uTime * 2.5, 0.0)) * 2.5;
      }
      
      \n \` + shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace(
        "#include <clipping_planes_vertex>",
        \`#include <clipping_planes_vertex>
          

        vec3 displacedPosition = position + normal * displace(position);
        vec4 modelPosition = modelMatrix * vec4(displacedPosition, 1.0);
        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectedPosition = projectionMatrix * viewPosition;
        gl_Position = projectedPosition;

        float offset = 0.01;
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
        vNormal = displacedNormal;\`
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

export default GroundMaterial;
`;

const CustomNormalVertexShader = `varying vec3 vNormal;
varying vec3 eyeVector;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vec4 mvPosition = viewMatrix * worldPos;

  gl_Position = projectionMatrix * mvPosition;

  vec3 transformedNormal = normalMatrix * normal;
  vNormal = normalize(transformedNormal);
  eyeVector = normalize(worldPos.xyz - cameraPosition);
}
`;

const CustomNormalFragmentShader = `varying vec3 vNormal;
varying vec3 eyeVector;
uniform vec3 lightPosition;

const float shininess = 600.0;
const float diffuseness = 0.5;

vec2 phong() {
  vec3 normal = normalize(vNormal);
  vec3 lightDirection = normalize(lightPosition);
  vec3 halfVector = normalize(eyeVector - lightDirection);

  float NdotL = dot(normal, lightDirection);
  float NdotH =  dot(normal, halfVector);
  float NdotH2 = NdotH * NdotH;

  float kDiffuse = max(0.0, NdotL) * diffuseness;
  float kSpecular = pow(NdotH2, shininess);

  return vec2(kSpecular, kDiffuse);
}

void main() {
  vec3 color = vec3(vNormal);
  vec2 phongLighting = phong();

  float specularLight = phongLighting.x;
  float diffuseLight = phongLighting.y;

  if(specularLight >= 0.25) {
    color = vec3(1.0, 1.0, 1.0);
  }

  gl_FragColor = vec4(color, diffuseLight);
}
`;

const CustomNormalMaterial = `import * as THREE from "three";
import vertexShader from "!!raw-loader!./CustomNormalVertexShader.glsl";
import fragmentShader from "!!raw-loader!./CustomNormalFragmentShader.glsl";

const normalShader = {
  uniforms: {
    lightPosition: { value: new THREE.Vector3(10, 10, 10) },
  },
  vertexShader,
  fragmentShader
}

const CustomNormalMaterial = new THREE.ShaderMaterial(normalShader);

export default CustomNormalMaterial;
`;

const MoebiusVertexShader = `varying vec2 vUv;

void main() {
  vUv = uv;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const MoebiusFragmentShader = `#include <packing>
varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform sampler2D tDepth;
uniform sampler2D tNormal;
uniform float cameraNear;
uniform float cameraFar;
uniform vec2 resolution;
uniform float shadowType;

const mat3 Sx = mat3( -1, -2, -1, 0, 0, 0, 1, 2, 1 );
const mat3 Sy = mat3( -1, 0, 1, -2, 0, 2, -1, 0, 1 );

float hash(vec2 p) {
	vec3 p3  = fract(vec3(p.xyx) * .1031);
  p3 += dot(p3, p3.yzx + 33.33);
  
  return fract((p3.x + p3.y) * p3.z);
}

float readDepth( sampler2D depthTexture, vec2 coord ) {
  float fragCoordZ = texture2D( depthTexture, coord ).x;
  float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
  return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
}

float luma(vec3 color) {
  const vec3 magic = vec3(0.2125, 0.7154, 0.0721);
  return dot(magic, color);
}

void main() {
  vec2 uv = vUv;
  vec2 texel = vec2( 1.0 / resolution.x, 1.0 / resolution.y );

  float outlineThickness = 1.5;
  vec4 outlineColor = vec4(0.0, 0.0, 0.0, 1.0);

  vec2 displacement = vec2(
    (hash(gl_FragCoord.xy) * sin(gl_FragCoord.y * 0.05)) ,
    (hash(gl_FragCoord.xy) * cos(gl_FragCoord.x * 0.05))
  ) * 2.0 /resolution.xy;

  float depth = readDepth(tDepth, vUv);
  vec4 normal = texture2D(tNormal, vUv);
  vec4 pixelColor = texture2D(tDiffuse, vUv);

  float depth00 = readDepth(tDepth, vUv + displacement + outlineThickness * texel * vec2(-1, 1));
  float depth01 = readDepth(tDepth, vUv + displacement + outlineThickness * texel * vec2(-1, 0));
  float depth02 = readDepth(tDepth, vUv + displacement + outlineThickness * texel * vec2(-1, -1));

  float depth10 = readDepth(tDepth, vUv + displacement + outlineThickness * texel * vec2(0, -1));
  float depth11 = readDepth(tDepth, vUv + displacement + outlineThickness * texel * vec2(0, 0));
  float depth12 = readDepth(tDepth, vUv + displacement + outlineThickness * texel * vec2(0, 1));

  float depth20 = readDepth(tDepth, vUv + displacement + outlineThickness * texel * vec2(1, -1));
  float depth21 = readDepth(tDepth, vUv + displacement + outlineThickness * texel * vec2(1, 0));
  float depth22 = readDepth(tDepth, vUv + displacement + outlineThickness * texel * vec2(1, 1));

  float xSobelValueDepth = 
    Sx[0][0] * depth00 + Sx[1][0] * depth01 + Sx[2][0] * depth02 +
    Sx[0][1] * depth10 + Sx[1][1] * depth11 + Sx[2][1] * depth12 +
    Sx[0][2] * depth20 + Sx[1][2] * depth21 + Sx[2][2] * depth22;

  float ySobelValueDepth = 
    Sy[0][0] * depth00 + Sy[1][0] * depth01 + Sy[2][0] * depth02 +
    Sy[0][1] * depth10 + Sy[1][1] * depth11 + Sy[2][1] * depth12 +
    Sy[0][2] * depth20 + Sy[1][2] * depth21 + Sy[2][2] * depth22;

  float gradientDepth = sqrt(pow(xSobelValueDepth, 2.0) + pow(ySobelValueDepth, 2.0));

  float normal00 = luma(texture2D(tNormal, vUv + displacement + outlineThickness * texel * vec2(-1, -1)).rgb);
  float normal01 = luma(texture2D(tNormal, vUv + displacement + outlineThickness * texel * vec2(-1, 0)).rgb);
  float normal02 = luma(texture2D(tNormal, vUv + displacement + outlineThickness * texel * vec2(-1, 1)).rgb);

  float normal10 = luma(texture2D(tNormal, vUv + displacement + outlineThickness * texel * vec2(0, -1)).rgb);
  float normal11 = luma(texture2D(tNormal, vUv + displacement + outlineThickness * texel * vec2(0, 0)).rgb);
  float normal12 = luma(texture2D(tNormal, vUv + displacement + outlineThickness * texel * vec2(0, 1)).rgb);

  float normal20 = luma(texture2D(tNormal, vUv + displacement + outlineThickness * texel * vec2(1, -1)).rgb);
  float normal21 = luma(texture2D(tNormal, vUv + displacement + outlineThickness * texel * vec2(1, 0)).rgb);
  float normal22 = luma(texture2D(tNormal, vUv + displacement + outlineThickness * texel * vec2(1, 1)).rgb);

  float xSobelNormal = 
    Sx[0][0] * normal00 + Sx[1][0] * normal10 + Sx[2][0] * normal20 +
	Sx[0][1] * normal01 + Sx[1][1] * normal11 + Sx[2][1] * normal21 +
	Sx[0][2] * normal02 + Sx[1][2] * normal12 + Sx[2][2] * normal22;

  float ySobelNormal = 
    Sy[0][0] * normal00 + Sy[1][0] * normal10 + Sy[2][0] * normal20 +
    Sy[0][1] * normal01 + Sy[1][1] * normal11 + Sy[2][1] * normal21 +
    Sy[0][2] * normal02 + Sy[1][2] * normal12 + Sy[2][2] * normal22;

  float gradientNormal = sqrt(pow(xSobelNormal, 2.0) + pow(ySobelNormal, 2.0));

  float outline = gradientDepth * 25.0 + gradientNormal;

  float diffuseLight = normal.a;
  float pixelLuma = luma(pixelColor.rgb + diffuseLight * 0.65);

  if (shadowType == 1.0) {
    if(pixelLuma <= 0.35 && depth <= 0.99) {
      pixelColor = vec4(0.0, 0.0, 0.0, 1.0);
    }

    if (pixelLuma <= 0.45 && depth <= 0.99) {
      pixelColor = pixelColor * vec4(0.25, 0.25, 0.25, 1.0);
    }

    if (pixelLuma <= 0.6 && depth <= 0.99) {
      pixelColor = pixelColor * vec4(0.5, 0.5, 0.5, 1.0);
    }

    if (pixelLuma <= 0.75 && depth <= 0.99) {
      pixelColor = pixelColor * vec4(0.7, 0.7, 0.7, 1.0);
    }
  }

  if(shadowType == 2.0) {
    const float rasterSize = 6.0;
    float raster = length(mod(vUv * resolution.xy, vec2(rasterSize)) / rasterSize - vec2(0.5));

    if(pixelLuma <= raster * 1.25 && depth <= 0.99) {
      pixelColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
  }

  float modVal = 11.0;

  if(shadowType == 3.0) {
    if (pixelLuma <= 0.35 && depth <= 0.99) {
      if (mod((vUv.y + displacement.y) * resolution.y , modVal)  < outlineThickness) {
        pixelColor = outlineColor;
      };
    }
    if (pixelLuma <= 0.55 && depth <= 0.99) {
      if (mod((vUv.x + displacement.x) * resolution.x , modVal)  < outlineThickness) {
        pixelColor = outlineColor;
      };

    }
    if (pixelLuma <= 0.80 && depth <= 0.99) {
      if (mod((vUv.x + displacement.x) * resolution.y + (vUv.y + displacement.y) * resolution.x, modVal) <= outlineThickness) {
        pixelColor = outlineColor;
      };
    }
  }

  if(normal.r >= 1.0 && normal.g >= 1.0 && normal.b >= 1.0) {
    pixelColor = vec4(1.0, 1.0, 1.0, 1.0);
  }

  vec4 color = mix(pixelColor, outlineColor, outline);

  gl_FragColor = color;
}
`;

const MoebiusPass = `import { Pass } from "postprocessing";
import * as THREE from "three";
import { FullScreenQuad } from "three-stdlib";

import vertexShader from "!!raw-loader!./MoebiusVertexShader.glsl";
import fragmentShader from "!!raw-loader!./MoebiusFragmentShader.glsl";

const moebiusShader = {
  uniforms: {
    tDiffuse: { value: null },
    tDepth: { value: null },
    tNormal: { value: null },
    cameraNear: { value: null },
    cameraFar: { value: null },
    resolution: {
      value: new THREE.Vector2(),
    },
    shadowType: { value: 3.0 },
  },
  vertexShader,
  fragmentShader,
}

class MoebiusPass extends Pass {
  constructor(args) {
    super();

    this.material = new THREE.ShaderMaterial(moebiusShader);
    this.fsQuad = new FullScreenQuad(this.material);

    this.depthRenderTarget = args.depthRenderTarget;
    this.normalRenderTarget = args.normalRenderTarget;
    this.camera = args.camera;
   

    this.resolution = new THREE.Vector2(
      window.innerWidth * Math.min(window.devicePixelRatio, 2),
      window.innerHeight * Math.min(window.devicePixelRatio, 2)
    );
  }

  dispose() {
    this.material.dispose();
    this.fsQuad.dispose();
  }

  render(renderer, writeBuffer, readBuffer) {
    this.material.uniforms.tDiffuse.value = readBuffer.texture;
    this.material.uniforms.tDepth.value = this.depthRenderTarget.depthTexture;
    this.material.uniforms.tNormal.value = this.normalRenderTarget.texture;
    this.material.uniforms.cameraNear.value = this.camera.near;
    this.material.uniforms.cameraFar.value = this.camera.far;

    this.material.uniforms.resolution.value = new THREE.Vector2(
      window.innerWidth * Math.min(window.devicePixelRatio, 2),
      window.innerHeight * Math.min(window.devicePixelRatio, 2)
    );

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
      this.fsQuad.render(renderer);
    }
  }
}

export default MoebiusPass;
`;

const Spaceship = `import { useGLTF } from "@react-three/drei";
import { forwardRef, useEffect } from "react";
import * as THREE from "three";

const SPACESHIP_GEOMETRY_URL = "https://cdn.maximeheckel.com/models/spaceship-optimized.glb";

const Spaceship = forwardRef((_, ref) => {
  // Original model by Sousinho
  // Their work: https://sketchfab.com/sousinho
  // The original model: https://sketchfab.com/3d-models/rusty-spaceship-orange-18541ebed6ce44a9923f9b8dc30d87f5
  const gltf = useGLTF(SPACESHIP_GEOMETRY_URL);

  useEffect(() => {
    if (gltf) {
      function alphaFix(material) {
        material.transparent = true;
        material.alphaToCoverage = true;
        material.depthFunc = THREE.LessEqualDepth;
        material.depthTest = true;
        material.depthWrite = true;
      }
      alphaFix(gltf.materials.spaceship_racer);
      alphaFix(gltf.materials.cockpit);
    }
  }, [gltf]);

  return (
    <group ref={ref}>
      <group
        scale={0.005}
        rotation={[0, -Math.PI * 0.5, 0]}
        position={[1.583, 0, -3.725]}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={gltf.nodes.Cube001_spaceship_racer_0.geometry}
          material={gltf.materials.spaceship_racer}
          position={[739.26, -64.81, 64.77]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={gltf.nodes.Cube005_cockpit_0.geometry}
          material={gltf.materials.spaceship_racer}
          position={[739.26, 0, 0]}
        />
      </group>
    </group>
  );
});

export default Spaceship;
`;

const AppCode = `import { 
  OrbitControls, 
  Effects,
  PerspectiveCamera,
  useFBO,
} from "@react-three/drei";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import { useControls } from "leva";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";

import MoebiusPass from "./MoebiusPass";
import CustomNormalMaterial from "./CustomNormalMaterial";
import Spaceship from "./Spaceship";
import GroundMaterial from "./GroundMaterial";
import GroundNormalMaterial from "./GroundNormalMaterial";

import './scene.css';

extend({ MoebiusPass, GroundMaterial });

const Moebius = () => {
  const mesh = useRef();
  const spaceship = useRef();
  const ground = useRef();

  const lightPosition = [-50, 50, 15];

  const { camera } = useThree();

  const depthTexture = new THREE.DepthTexture(
    window.innerWidth,
    window.innerHeight
  );

  const depthRenderTarget = useFBO(window.innerWidth, window.innerHeight, {
    depthTexture,
    depthBuffer: true,
  });

  const normalRenderTarget = useFBO();

  useFrame((state) => {
    state.camera.lookAt(0, 0, 0);
  });

  useFrame((state) => {
    const { gl, scene, camera, clock } = state;

    gl.setRenderTarget(depthRenderTarget);
    gl.render(scene, camera);

    const materials = [];

    gl.setRenderTarget(normalRenderTarget);

    scene.traverse((obj) => {
      if (obj.isMesh) {
        materials.push(obj.material);
        if (obj.name === "ground") {
          obj.material = GroundNormalMaterial;
          obj.material.uniforms.uTime.value = clock.elapsedTime;
          obj.material.uniforms.lightPosition.value = lightPosition;
        } else {
          obj.material = CustomNormalMaterial;
          obj.material.uniforms.lightPosition.value = lightPosition;
        }
      }
    });

    gl.render(scene, camera);

    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.material = materials.shift();
      }
    });

    gl.setRenderTarget(null);
  });

  useFrame((state) => {
    const { clock } = state;

    spaceship.current.rotation.x =
      Math.cos(state.clock.getElapsedTime() * 2.0) *
      Math.cos(state.clock.getElapsedTime()) *
      0.15;
    spaceship.current.position.y =
      Math.sin(state.clock.getElapsedTime() * 2.0) + 1.0;

    ground.current.material.uniforms.uTime.value = clock.elapsedTime;
  })

  return (
    <>
      <directionalLight
        castShadow
        position={lightPosition}
        intensity={4.5}
        color="#fff"
        target={ground.current}
      />
      <mesh position={[80, 30, 140]} scale={10}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial color="darkorange" />
      </mesh>
      <mesh position={[50, 35, 120]} scale={3}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial color="cyan" />
      </mesh>
      <group rotation={[0, Math.PI / 2, 0]} position={[0, 2, 0]}>
        <Spaceship ref={spaceship} />
      </group>
      <mesh 
        ref={ground} 
        name="ground" 
        castShadow 
        receiveShadow 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -1, 0]}
      >
        <planeGeometry args={[300, 300, 100, 100]} />
        <groundMaterial receiveShadow color="#FF6457" />
      </mesh>
      <Effects key={uuidv4()}>
        <moebiusPass args={[{
            depthRenderTarget,
            normalRenderTarget,
            camera
          }]}
        />
      </Effects>
    </>
  );
};

const Scene = () => {
  return (
    <Canvas shadows dpr={[1, 2]}>
      <Suspense fallback="Loading">
        <ambientLight intensity={0.2} color="#FFFFFF" />
        <color attach="background" args={["#3386E0"]} />
        <Moebius />
        <PerspectiveCamera
         makeDefault
          position={[-8, 4, -20]}
          near={0.01}
          far={800}
        />
      </Suspense>
    </Canvas>
  );
};


export default Scene;
`;

const Final = {
  '/App.js': {
    code: AppCode,
    active: true,
  },
  '/MoebiusPass.js': {
    code: MoebiusPass,
  },
  '/MoebiusFragmentShader.glsl': {
    code: MoebiusFragmentShader,
  },
  '/MoebiusVertexShader.glsl': {
    code: MoebiusVertexShader,
  },
  '/Spaceship.js': {
    code: Spaceship,
  },
  '/GroundMaterial.js': {
    code: GroundMaterial,
  },
  '/GroundNormalMaterial.js': {
    code: GroundNormalMaterial,
  },
  '/GroundNormalVertexShader.glsl': {
    code: GroundNormalVertexShader,
  },
  '/CustomNormalMaterial.js': {
    code: CustomNormalMaterial,
  },
  '/CustomNormalVertexShader.glsl': {
    code: CustomNormalVertexShader,
  },
  '/CustomNormalFragmentShader.glsl': {
    code: CustomNormalFragmentShader,
  },
};

export default Final;
