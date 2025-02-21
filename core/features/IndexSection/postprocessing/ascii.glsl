uniform float pixelSize;
uniform sampler2D asciiTexture;
uniform vec2 charCount;
uniform float diagonalTilt;
uniform float curvature;




float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

vec3 sat(vec3 rgb, float adjustment) {
  const vec3 W = vec3(0.2125, 0.7154, 0.0721);
  vec3 intensity = vec3(dot(rgb, W));
  return mix(intensity, rgb, adjustment);
}

float character(int n, vec2 p) {
	p = floor(p*vec2(-4.0, 4.0) + 2.5);
    if (clamp(p.x, 0.0, 4.0) == p.x)
	{
        if (clamp(p.y, 0.0, 4.0) == p.y)	
		{
        	int a = int(round(p.x) + 5.0 * round(p.y));
			if (((n >> a) & 1) == 1) return 1.0;
		}	
    }
	return 0.0;
}

const float COLOR_NUM = 4.0;


void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 normalizedPixelSize = pixelSize / resolution;
    vec2 uvPixel = normalizedPixelSize * floor(uv / normalizedPixelSize);
    vec4 ogColor = texture2D(inputBuffer, uv);
    vec4 color = texture2D(inputBuffer, uvPixel);

    color.r = floor(color.r * (COLOR_NUM - 1.0) + 0.5) / (COLOR_NUM - 1.0);
  color.g = floor(color.g * (COLOR_NUM - 1.0) + 0.5) / (COLOR_NUM - 1.0);
  color.b = floor(color.b * (COLOR_NUM - 1.0) + 0.5) / (COLOR_NUM - 1.0);



    


    float luma = dot(vec3(0.2126, 0.7152, 0.0722), color.rgb);


    vec2 cellUV = fract(uv / normalizedPixelSize);

    float charIndex = clamp(
        floor(luma * (charCount.x - 1.0)),
        0.0,
        charCount.x - 1.0
    );
    

   
    vec2 asciiUV = vec2(
        (charIndex + cellUV.x) / charCount.x,
        cellUV.y
    );
    
  
    

    float character = texture2D(asciiTexture, asciiUV).r;
    vec4 asciiColor = vec4(character * vec3(1.0) * (luma + 0.05), 1.0);

    float diagonalTilt = 1.0;
    float curvature = 1.0;
    
    // Modified transition with curved diagonal
    float curve = pow(uv.x, 2.0) * curvature;
    float transition = smoothstep(-0.2, 1.0, -uv.x + uv.y);
    outputColor = mix(asciiColor, vec4(ogColor.rgb, 1.0), transition);


   
}
