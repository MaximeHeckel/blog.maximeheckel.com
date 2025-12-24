import { Card, Flex, InlineCode } from '@maximeheckel/design-system';
import React from 'react';

import { Slider } from '@core/components/Slider';

import { AnimationCardContent, Form } from '../Components';

const lightness = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10];

const PaletteGenerator = () => {
  const [hue, setHue] = React.useState(320);
  const [saturation, setSaturation] = React.useState(89);

  const cssVariable = `--base-color: ${hue}, ${saturation}`;

  return (
    <Card depth={1}>
      <AnimationCardContent>
        <Flex
          justifyContent="center"
          wrap="wrap"
          css={{
            padding: '0px 30px',
            height: '100px',
          }}
        >
          {lightness.map((light, index) => (
            <div
              key={index}
              style={{
                marginLeft: '-12px',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: `hsla(${hue}, ${saturation}%, ${light}%, 100%)`,
                willChange: 'background-color',
              }}
            />
          ))}
        </Flex>
        <InlineCode>{cssVariable}</InlineCode>
        <Form>
          <Flex direction="column" gap={5}>
            <Slider
              id="hue"
              label="Hue"
              aria-label="Hue"
              min={0}
              max={359}
              value={hue}
              onChange={(value) => setHue(value)}
            />
            <Slider
              id="saturation"
              label="Saturation"
              aria-label="Saturation"
              min={1}
              max={100}
              value={saturation}
              onChange={(value) => setSaturation(value)}
            />
          </Flex>
        </Form>
      </AnimationCardContent>
    </Card>
  );
};

export default PaletteGenerator;
