import { Box, Card, Flex, EM, Text } from '@maximeheckel/design-system';
import { Group } from '@visx/group';
import { HeatmapRect } from '@visx/heatmap';
import ParentSize from '@visx/responsive/lib/components/ParentSizeModern';
import { scaleLinear, scaleBand } from '@visx/scale';
import { useMemo, useState } from 'react';
import vectors from './vectors.json';

type Bucket =
  | 'sentenceBucket1'
  | 'sentenceBucket2'
  | 'sentenceBucket3'
  | 'sentenceBucket4';

const sentence1 = 'I build animations for my React component in Framer Motion';

const sentence2 =
  'My shader uses uniforms and varyings to create a cool effect';
const sentence3 = 'My dog loves to go to the park';
const sentence4 = 'Do you want some cake?';
const sentence5 = "My dog doesn't like cats";
const sentence6 = 'I use shaders in my components with React Three Fiber';

const sentence7 = 'I like to be in my house';

const sentence8 =
  'I use uniforms to pass colors from my Javascript code to my shader';
const sentence9 = 'Framer Motion supports layout animations';
const sentence10 = 'I enjoy staying at home on the weekends';
const sentence11 = 'I use Frame Buffer Object for my 3D particle system';
const sentence12 = 'CSS variable can be composed to create better color scales';

const sentenceBucket1 = {
  sentence1: { value: sentence1, vector: vectors['sentence1'] },
  sentence2: { value: sentence2, vector: vectors['sentence2'] },
  sentence3: { value: sentence3, vector: vectors['sentence3'] },
};
const sentenceBucket2 = {
  sentence4: { value: sentence4, vector: vectors['sentence4'] },
  sentence5: { value: sentence5, vector: vectors['sentence5'] },
  sentence6: { value: sentence6, vector: vectors['sentence6'] },
};

const sentenceBucket3 = {
  sentence1: { value: sentence7, vector: vectors['sentence7'] },
  sentence2: { value: sentence8, vector: vectors['sentence8'] },
  sentence3: { value: sentence9, vector: vectors['sentence9'] },
};
const sentenceBucket4 = {
  sentence4: { value: sentence10, vector: vectors['sentence10'] },
  sentence5: { value: sentence11, vector: vectors['sentence11'] },
  sentence6: { value: sentence12, vector: vectors['sentence12'] },
};

const buckets: Record<
  Bucket,
  Record<string, { value: string; vector: number[] }>
> = {
  sentenceBucket1,
  sentenceBucket2,
  sentenceBucket3,
  sentenceBucket4,
};

const sentences = [
  ...Object.keys(sentenceBucket1),
  ...Object.keys(sentenceBucket2),
];

const CosineSimilarity = () => {
  const [bucket1, setBucket1] = useState<Bucket>('sentenceBucket1');
  const [bucket2, setBucket2] = useState<Bucket>('sentenceBucket2');

  const calculateCosineSimilarity = (vector1: number[], vector2: number[]) => {
    // Calculate the dot product
    let dotProduct = 0;
    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
    }

    // Calculate the magnitudes
    const magnitude1 = Math.sqrt(
      vector1.reduce((sum, val) => sum + val ** 2, 0)
    );
    const magnitude2 = Math.sqrt(
      vector2.reduce((sum, val) => sum + val ** 2, 0)
    );

    // Calculate the cosine similarity
    const similarity = dotProduct / (magnitude1 * magnitude2);

    return similarity;
  };

  const data = useMemo(() => {
    return Object.values(buckets[bucket2]).map((sentenceItem1, i) => {
      return {
        bins: Object.values(buckets[bucket1]).map((sentenceItem2, j) => ({
          label: `${j + 4}`,
          bin: j,
          count: calculateCosineSimilarity(
            sentenceItem1.vector,
            sentenceItem2.vector
          ),
        })),
        label: `${i + 1}`,
        index: i,
      };
    });
  }, [bucket1, bucket2]);

  const flatData = data.reduce(
    (acc, val) => acc.concat(val.bins),
    [] as Array<{ label: string; bin: number; count: number }>
  );

  const colorMax = Math.max(...flatData.map((d) => d.count));
  const colorMin = Math.min(...flatData.map((d) => d.count));
  const colorScale = scaleLinear({
    domain: [colorMin, colorMax],
    range: ['#EDF1FB', '#5786F5'],
    // range: ['#E5FFF7', '#05FFAA'],
  });

  return (
    <Card title="Heatmap representing the cosine similarity between multiple sets of sentences">
      <Card.Body as={Flex} direction="column">
        <Box
          css={{
            width: '100%',
            height: 500,
            '@media(max-width: 750px)': { height: 350 },
          }}
        >
          <ParentSize
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {({ width, height }) => {
              const size = Math.min(width - 50, height - 50);
              const xScale = scaleBand({
                domain: data[0].bins.map((d) => d.bin),
                range: [0, size],
              });
              const yScale = scaleBand({
                domain: data.map((d) => d.index),
                range: [0, size],
              });

              return (
                <svg
                  width={Math.min(width, height)}
                  height={Math.min(width, height)}
                  style={{
                    overflow: 'visible',
                    marginLeft: -50,
                    marginTop: -50,
                  }}
                >
                  <Group>
                    {data.map((bin, idx) => (
                      <text
                        key={idx}
                        x={25}
                        y={yScale(idx)! + yScale.bandwidth() / 1.2}
                        dy=".35em"
                        style={{
                          fontWeight: 500,
                          fontFamily: 'Inter',
                          fontSize: '12px',
                          fill: 'var(--text-secondary)',
                        }}
                        textAnchor="middle"
                      >
                        {bin.label}
                      </text>
                    ))}
                    {data[0].bins.map((bin, idx) => (
                      <text
                        key={idx}
                        x={xScale(idx)! + xScale.bandwidth() / 1.2}
                        y={32}
                        style={{
                          fontWeight: 500,
                          fontFamily: 'Inter',
                          fontSize: '12px',
                          fill: 'var(--text-secondary)',
                        }}
                        textAnchor="end"
                      >
                        {bin.label}
                      </text>
                    ))}
                  </Group>
                  <g transform={`translate(${50},${50})`}>
                    <HeatmapRect
                      data={data}
                      //   @ts-ignore
                      xScale={xScale}
                      //   @ts-ignore
                      yScale={yScale}
                      colorScale={colorScale}
                      binWidth={(size / sentences.length) * 2}
                      binHeight={(size / sentences.length) * 2}
                      gap={4}
                    >
                      {(heatmap) =>
                        heatmap.map((heatmapBins, i) =>
                          heatmapBins.map((bin, j) => (
                            <g key={`heatmap-rect-${bin.row}-${bin.column}`}>
                              <rect
                                className="visx-heatmap-rect"
                                width={bin.width}
                                height={bin.height}
                                x={bin.x}
                                y={bin.y}
                                fill={bin.color}
                                rx="16"
                              />
                              <text
                                x={xScale(i)! + bin.width / 2}
                                y={yScale(j)! + bin.height / 2}
                                textAnchor="middle"
                                dy=".35em" // to vertically center text
                                style={{
                                  fontWeight: 500,
                                  fontFamily: 'Inter',
                                  fontSize: '12px',
                                  fill: 'black', // adjust color as needed
                                }}
                              >
                                {bin.count?.toFixed(4)}
                              </text>
                            </g>
                          ))
                        )
                      }
                    </HeatmapRect>
                  </g>
                </svg>
              );
            }}
          </ParentSize>
        </Box>
      </Card.Body>
      <Box
        css={{
          borderTop: '1px solid var(--border-color)',
          padding: 'var(--space-3) var(--space-5)',
        }}
      >
        <Flex alignItems="start" css={{ marginTop: 'var(--space-3)' }} gap="9">
          <Flex
            alignItems="start"
            css={{ width: '100%' }}
            direction="column"
            gap="2"
          >
            <Flex alignItems="center">
              <Box
                as="select"
                css={{
                  border: '1px solid var(--accent)',
                  boxShadow: 'none',
                  backgroundColor: 'var(--emphasis)',
                  color: 'var(--accent)',
                  height: '30px',
                  borderRadius: 'var(--border-radius-0)',
                  padding: '5px',
                }}
                id="shader-function"
                value={bucket1}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                  setBucket1(event.target.value as Bucket);
                }}
              >
                <option value="sentenceBucket1">Bucket 1</option>
                <option value="sentenceBucket2">Bucket 2</option>
                <option value="sentenceBucket3">Bucket 3</option>
                <option value="sentenceBucket4">Bucket 4</option>
              </Box>
            </Flex>
            {Object.values(buckets[bucket1]).map((sentence, i) => (
              <Text as="span" css={{ margin: 0 }} key={i} size="1">
                {i + 1}. <EM size="1">&quot;{sentence.value}&quot;</EM>;
              </Text>
            ))}
          </Flex>
          <Flex
            alignItems="start"
            css={{ width: '100%' }}
            direction="column"
            gap="2"
          >
            <Box
              as="select"
              css={{
                border: '1px solid var(--accent)',
                boxShadow: 'none',
                backgroundColor: 'var(--emphasis)',
                color: 'var(--accent)',
                height: '30px',
                borderRadius: 'var(--border-radius-0)',
                padding: '5px',
              }}
              id="shader-function"
              value={bucket2}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                setBucket2(event.target.value as Bucket);
              }}
            >
              <option value="sentenceBucket1">Bucket 1</option>
              <option value="sentenceBucket2">Bucket 2</option>
              <option value="sentenceBucket3">Bucket 3</option>
              <option value="sentenceBucket4">Bucket 4</option>
            </Box>
            {Object.values(buckets[bucket2]).map((sentence, i) => (
              <Text as="span" css={{ margin: 0 }} key={i} size="1">
                {i + 4}. <EM size="1">&quot;{sentence.value}&quot;</EM>;
              </Text>
            ))}
          </Flex>
        </Flex>
      </Box>
    </Card>
  );
};

export default CosineSimilarity;
