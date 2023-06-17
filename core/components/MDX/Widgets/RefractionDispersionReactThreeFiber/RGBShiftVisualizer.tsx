import { Box, Card, Flex, Range, Text, css } from '@maximeheckel/design-system';
import React from 'react';
import { HighlightedValue } from '../Components';

const channelSplit = css({
  position: 'absolute',
  top: 0,
  left: 0,
  width: 100,
  height: 100,
  borderRadius: '50%',
  mixBlendMode: 'color-dodge',
})();

const RGBShiftVisualizer = (props: { enableSampling?: boolean }) => {
  const { enableSampling } = props;
  const [split, setSplit] = React.useState(5);
  const [samples, setSamples] = React.useState(1);

  const samplesArray = new Array(samples).fill(0);

  const title = enableSampling
    ? 'RGB Shift/Chromatic Aberration effect visualizer with samples'
    : 'RGB Shift/Chromatic Aberration effect visualizer';

  return (
    <Card className="maximeheckel-dark" title={title}>
      <Card.Body as={Flex} direction="column" dotMatrix gap="6">
        <Box
          css={{
            margin: '0 auto',
            position: 'relative',
            width: 'fit-content',
            color: 'white !important',
          }}
          id="wrapper"
          key="foo"
        >
          <Box
            css={{ margin: 0, opacity: 0, width: 100, height: 100 }}
            id="static"
          />

          {samplesArray.map((_, index) => {
            return (
              <React.Fragment key={index}>
                <Box
                  className={channelSplit}
                  css={{
                    background: '#f00',
                    transform: `translate(${
                      -1 * (split * 5 + index * split)
                    }px, 0)`,
                    willChange: 'transform',
                  }}
                  id="red"
                  key={`${index}-red`}
                />
                <Box
                  className={channelSplit}
                  css={{
                    background: '#0f0',
                    transform: `translate(${
                      index % 2 ? index * split : -1 * index * split
                    }px, 0)`,
                    willChange: 'transform',
                  }}
                  id="green"
                  key={`${index}-green`}
                />
                <Box
                  className={channelSplit}
                  css={{
                    background: '#00f',
                    transform: `translate(${split * 5 + index * split}px, 0)`,
                    willChange: 'transform',
                  }}
                  id="green"
                  key={`${index}-blue`}
                />
              </React.Fragment>
            );
          })}
        </Box>
        <Flex
          direction="column"
          gap="2"
          alignItems="start"
          css={{ width: '50%' }}
        >
          <Box>
            <Text as="span" size="2">
              Shift intensity:
            </Text>{' '}
            <HighlightedValue>{split}</HighlightedValue>
          </Box>
          <Range
            id="split"
            aria-label="Split"
            min={0}
            max={10}
            step={0.1}
            value={split}
            onChange={(value) => {
              setSplit(value);
            }}
          />
          {enableSampling ? (
            <>
              <Box>
                <Text as="span" size="2">
                  Samples:
                </Text>{' '}
                <HighlightedValue>{samples}</HighlightedValue>
              </Box>
              <Range
                id="samples"
                aria-label="Samples"
                min={1}
                max={10}
                step={1}
                value={samples}
                onChange={(value) => {
                  setSamples(value);
                }}
              />
            </>
          ) : null}
        </Flex>
      </Card.Body>
    </Card>
  );
};

export default RGBShiftVisualizer;
