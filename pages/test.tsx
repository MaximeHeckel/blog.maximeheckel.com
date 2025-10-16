import { Flex, Grid } from '@maximeheckel/design-system';
import { useDebouncedValue } from '@maximeheckel/design-system';
import React from 'react';

// import { GrayscaleHalftone } from '@core/components/Halftone';
import { ColorBlending } from '@core/components/ColorBlending';
import { CMYKHalftone } from '@core/components/Halftone/CMYKHalftone';
import { Main } from '@core/components/Main';
import Seo from '@core/components/Seo';

export default function Test() {
  // UI state (updates immediately)
  const [dotSize, setDotSize] = React.useState(8);
  const [cyanAngle, setCyanAngle] = React.useState(15);
  const [magentaAngle, setMagentaAngle] = React.useState(75);
  const [yellowAngle, setYellowAngle] = React.useState(0);
  const [blackAngle, setBlackAngle] = React.useState(45);

  // Debounced values for expensive canvas rendering
  const debouncedDotSize = useDebouncedValue(dotSize, 100);
  const debouncedCyanAngle = useDebouncedValue(cyanAngle, 100);
  const debouncedMagentaAngle = useDebouncedValue(magentaAngle, 100);
  const debouncedYellowAngle = useDebouncedValue(yellowAngle, 100);
  const debouncedBlackAngle = useDebouncedValue(blackAngle, 100);

  const imageUrl = '/static/images/sample3.jpg';

  return (
    <Main>
      <Seo title="Color Blending Test" />
      <Grid
        css={{
          position: 'relative',
          minHeight: '100vh',
          width: '100%',
          backgroundColor: 'var(--background)',
          padding: '40px 20px',
        }}
        gapX={2}
        templateColumns="1fr minmax(auto, 700px) 1fr"
      >
        <Flex
          as={Grid.Item}
          direction="column"
          justifyContent="center"
          col={2}
          gap="4"
        >
          {/* <Flex alignItems="start" gap="10">
            <Flex
              direction="column"
              gap="2"
              css={{ marginBottom: '20px', width: '100px' }}
            >
              <label>
                Dot Size: {dotSize}
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={dotSize}
                  onChange={(e) => setDotSize(Number(e.target.value))}
                  style={{ display: 'block', marginTop: '8px' }}
                />
              </label>

              <label>
                Cyan Angle: {cyanAngle}°
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={cyanAngle}
                  onChange={(e) => setCyanAngle(Number(e.target.value))}
                  style={{ display: 'block', marginTop: '8px' }}
                />
              </label>

              <label>
                Magenta Angle: {magentaAngle}°
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={magentaAngle}
                  onChange={(e) => setMagentaAngle(Number(e.target.value))}
                  style={{ display: 'block', marginTop: '8px' }}
                />
              </label>

              <label>
                Yellow Angle: {yellowAngle}°
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={yellowAngle}
                  onChange={(e) => setYellowAngle(Number(e.target.value))}
                  style={{ display: 'block', marginTop: '8px' }}
                />
              </label>

              <label>
                Black Angle: {blackAngle}°
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={blackAngle}
                  onChange={(e) => setBlackAngle(Number(e.target.value))}
                  style={{ display: 'block', marginTop: '8px' }}
                />
              </label>
            </Flex>
            <CMYKHalftone
              imageUrl={imageUrl}
              dotSize={debouncedDotSize}
              width={800}
              height={800}
              cyanAngle={debouncedCyanAngle}
              magentaAngle={debouncedMagentaAngle}
              yellowAngle={debouncedYellowAngle}
              blackAngle={debouncedBlackAngle}
              style={{
                border: '2px solid var(--gray-300)',
                overflow: 'hidden',
                borderRadius: '16px',
                backgroundColor: 'white',
              }}
            />
          </Flex> */}

          <ColorBlending
            mode="RGB"
            width={600}
            height={400}
            style={{
              borderRadius: '16px',
            }}
          />

          <ColorBlending
            mode="CMY"
            width={600}
            height={400}
            style={{
              borderRadius: '16px',
            }}
          />
        </Flex>
      </Grid>
    </Main>
  );
}
