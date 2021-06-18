import { css } from '@emotion/react';
import Card from '@theme/components/Card';
import InlineCode from '@theme/components/MDX/InlineCode';
import React from 'react';
import { AnimationCardContent, Form, HighlightedValue } from './Components';

const lightness = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10];

const PaletteGenerator = () => {
  const [hue, setHue] = React.useState(320);
  const [saturation, setSaturation] = React.useState(89);

  const cssVariable = `--base-color: ${hue}, ${saturation}`;

  return (
    <Card
      depth={1}
      css={css`
        margin-bottom: 2.25rem;
      `}
    >
      <AnimationCardContent>
        <div
          css={css`
            display: flex;
            flex-flow: wrap;
            justify-content: center;
            padding: 0px 30px;
          `}
        >
          {lightness.map((light, index) => (
            <div
              key={index}
              css={css`
                margin-left: -12px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background-color: hsla(${hue}, ${saturation}%, ${light}%, 100%);
                will-change: background-color;
              `}
            />
          ))}
        </div>
        <InlineCode>{cssVariable}</InlineCode>
        <Form
          css={css`
            max-width: 350px;
          `}
        >
          <div style={{ display: 'grid' }}>
            <label htmlFor="hue">
              Hue: <HighlightedValue>{hue}</HighlightedValue>
            </label>
            <input
              id="hue"
              type="range"
              min="0"
              max="359"
              value={hue}
              onChange={(e) => setHue(parseInt(e.target.value, 10))}
            />
          </div>
          <div style={{ display: 'grid' }}>
            <label htmlFor="saturation">
              Saturation: <HighlightedValue>{saturation}</HighlightedValue>
            </label>
            <input
              id="saturation"
              type="range"
              min="1"
              max="100"
              value={saturation}
              onChange={(e) => setSaturation(parseInt(e.target.value, 10))}
            />
          </div>
        </Form>
      </AnimationCardContent>
    </Card>
  );
};

export default PaletteGenerator;
