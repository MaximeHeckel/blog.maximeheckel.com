import {
  Box,
  Card,
  Flex,
  Grid,
  Label,
  Radio,
  Text,
  Tooltip,
} from '@maximeheckel/design-system';
import { HighlightedCodeText } from '@theme/components/Code/CodeBlock';
import React from 'react';

interface CellProps {
  value: number;
  x: number;
  y: number;
}

const Cell = (props: CellProps) => {
  const { value, x, y } = props;
  return (
    <Tooltip content={value < 0 ? '0.000' : value.toFixed(3)}>
      <Flex
        alignItems="center"
        css={{
          aspectRatio: '1 / 1',
          cursor: 'pointer',
          borderBottom: '0.5px solid hsla(var(--palette-gray-20), 50%)',
          borderLeft: '0.5px solid hsla(var(--palette-gray-20), 50%)',
          backgroundColor: `rgb(${value * 255},${value * 255},${value * 255})`,
          overflow: 'hidden',
        }}
        justifyContent="center"
      >
        {(x === 0 && y === 0) ||
        (x === 1 && y === 1) ||
        (x === 0 && y === 1) ||
        (x === 1 && y === 0) ? (
          <Text css={{ marginBottom: 0 }} size="1">
            {x},{y}
          </Text>
        ) : null}
      </Flex>
    </Tooltip>
  );
};

const shader0 = (_x: number, _y: number) => 1.0;
const shader1 = (_x: number, _y: number) => 0.0;
const shader2 = (_x: number, _y: number) => _x;
const shader3 = (_x: number, _y: number) => 1.0 - _x;
const shader4 = (_x: number, _y: number) => Math.cos(_x * 2.0);
const shader5 = (_x: number, _y: number) => Math.sin(_y * 3.0);
const shader6 = (_x: number, _y: number) =>
  Math.sqrt((_x - 0.5) * (_x - 0.5) + (_y - 0.5) * (_y - 0.5));
const shader7 = (_x: number, _y: number) =>
  1.0 - 2.0 * Math.sqrt((_x - 0.5) * (_x - 0.5) + (_y - 0.5) * (_y - 0.5));
const shader8 = (_x: number, _y: number) =>
  _x >= 0.95 || _x <= 0.05 || _y >= 0.95 || _y <= 0.05 ? 1.0 : 0.0;

const codeShader0 = `void main() {
  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}>`;

const codeShader1 = `void main() {
  gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
}>`;

const codeShader2 = `void main() {
  // 500.0 is an arbitrary value to "normalize"
  // my coordinate system
  // In these examples consider the value of x 
  // to go from 0 to 1.
  float x = gl_FragCoord.x / 500.0;
  vec3 color = vec3(x);

  gl_FragColor = vec4(color,1.0);
}`;

const codeShader3 = `void main() {
  float x = gl_FragCoord.x / 500.0;
  vec3 color = vec3(1.0 - x);
  
  gl_FragColor = vec4(color,1.0);
}`;

const codeShader4 = `void main() {
  float x = gl_FragCoord.x / 500.0;
  vec3 color = vec3(cos(x * 2.0));
  
  gl_FragColor = vec4(color,1.0);
}`;

const codeShader5 = `void main() {
  float y = gl_FragCoord.y / 500.0;
  vec3 color = vec3(sin(y * 3.0));
    
  gl_FragColor = vec4(color,1.0);
}`;

const codeShader6 = `void main() {
  vec2 point = gl_FragCoord.xy / 500.0;
  vec3 color = vec3(
    distance(point, vec2(0.5)));

  gl_FragColor = vec4(color,1.0);
}`;

const codeShader7 = `void main() {
  vec2 point = gl_FragCoord.xy / 500.0;
  vec3 color = vec3(1.0 - 2.0 * 
    distance(point, vec2(0.5)));
  
  gl_FragColor = vec4(color,1.0);
}`;

const codeShader8 = `void main() {
  vec2 point = gl_FragCoord.xy/500.0;
  vec3 color = vec3(1.0);

  if(point.x <= 0.1 || point.x >= 0.9 || point.y <= 0.1 || point.y >= 0.9) {
    color = vec3(0.0);
  }

  gl_FragColor = vec4(color,1.0);
}`;

const shaderFunction = {
  shader0,
  shader1,
  shader2,
  shader3,
  shader4,
  shader5,
  shader6,
  shader7,
  shader8,
};

const shaderCode = {
  shader0: codeShader0,
  shader1: codeShader1,
  shader2: codeShader2,
  shader3: codeShader3,
  shader4: codeShader4,
  shader5: codeShader5,
  shader6: codeShader6,
  shader7: codeShader7,
  shader8: codeShader8,
};

const FragmentShaderVisualizer = () => {
  const [size, setSize] = React.useState(16);
  const [shader, setShader] = React.useState<keyof typeof shaderFunction>(
    'shader2'
  );

  const emptyMatrix = React.useMemo(
    () =>
      Array(size)
        .fill(null)
        .map(() => Array(size).fill(null)),
    [size]
  );

  const matrix = emptyMatrix
    .map((row, y) =>
      row.map((_, x) =>
        shaderFunction[shader](
          x / (row.length - 1),
          y / (emptyMatrix.length - 1)
        )
      )
    )
    .reverse();

  return (
    <Card css={{ marginBottom: '2.25rem' }}>
      <Card.Body as={Flex} direction="column" dotMatrix justifyContent="center">
        <Flex
          alignItems="start"
          justifyContent="space-around"
          css={{ width: '100%', paddingBottom: 'var(--space-5)' }}
        >
          <Flex alignItems="start" direction="column">
            <Label htmlFor="resolution">Resolution:</Label>
            <Radio.Group
              id="resolutions"
              name="resolutions"
              direction="vertical"
              onChange={(event) => {
                // @ts-ignore
                setSize(parseInt(event.target.value, 10));
              }}
            >
              <Radio.Item
                id="size-1"
                value={8}
                aria-label="8x8"
                label="8x8"
                checked={size === 8}
              />
              <Radio.Item
                id="size-2"
                value={16}
                aria-label="16x16"
                label="16x16"
                checked={size === 16}
              />
              <Radio.Item
                id="size-4"
                value={32}
                aria-label="32x32"
                label="32x32"
                checked={size === 32}
              />
            </Radio.Group>
          </Flex>
          <Flex alignItems="start" direction="column">
            <Label htmlFor="shader-function">Shader Function</Label>
            <Box
              as="select"
              css={{
                border: '1px solid var(--maximeheckel-colors-brand)',
                boxShadow: 'none',
                backgroundColor: 'var(--maximeheckel-colors-emphasis)',
                color: 'var(--maximeheckel-colors-brand)',
                height: '30px',
                borderRadius: 'var(--border-radius-0)',
                padding: '5px',
              }}
              id="shader-function"
              value={shader}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                setShader(event.target.value as keyof typeof shaderFunction);
              }}
            >
              <option value="shader0">White</option>
              <option value="shader1">Black</option>
              <option value="shader2">Gradient</option>
              <option value="shader3">Reverse Gradient</option>
              <option value="shader4">Cosine Gradient</option>
              <option value="shader5">Sine Gradient</option>
              <option value="shader6">Circle</option>
              <option value="shader7">Reverse Circle</option>
              <option value="shader8">Box</option>
            </Box>
          </Flex>
        </Flex>
        <Grid
          css={{
            borderTop: '0.5px solid hsla(var(--palette-gray-20), 50%)',
            borderRight: '0.5px solid hsla(var(--palette-gray-20), 50%)',
            overflow: 'hidden',
            width: '100%',
            gridTemplateColumns: `repeat(${size}, 1fr)`,
          }}
        >
          {matrix.map((row, idy) => (
            <React.Fragment key={idy}>
              {row.map((value, idx) => (
                <Cell
                  key={`${value}-${idx}-${idy}`}
                  x={idx / (row.length - 1)}
                  y={(matrix.length - 1 - idy) / (matrix.length - 1)}
                  value={value}
                />
              ))}
            </React.Fragment>
          ))}
        </Grid>
      </Card.Body>
      <Grid
        css={{
          overflowY: 'auto',
        }}
      >
        <HighlightedCodeText codeString={shaderCode[shader]} language="glsl" />
      </Grid>
    </Card>
  );
};

export default FragmentShaderVisualizer;
