import { css } from '@emotion/react';
import React from 'react';
import {
  AnimationCard,
  AnimationCardContent,
  Form,
  HighlightedValue,
} from './Components';
import { InlineCode } from '../../Code';

const lightness = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10];

const PaletteGenerator = () => {
  const [hue, setHue] = React.useState(320);
  const [saturation, setSaturation] = React.useState(89);

  const cssVariable = `--base-color: ${hue}, ${saturation}`;

  return (
    <AnimationCard>
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
      {/* <CodeBlock
        metastring=""
        language="css"
        codeString={`--base-color: ${hue}, ${saturation}% // Partial value assigned to a CSS variable 
// Each color uses this variable when defining its HSLA color
color-10: hsla(var(--base-color), 10%, 100%); 
color-20: hsla(var(--base-color), 20%, 100%);
color-30: hsla(var(--base-color), 30%, 100%);
color-40: hsla(var(--base-color), 40%, 100%);
color-50: hsla(var(--base-color), 50%, 100%);
color-60: hsla(var(--base-color), 60%, 100%);
color-70: hsla(var(--base-color), 70%, 100%);
color-80: hsla(var(--base-color), 80%, 100%);
color-90: hsla(var(--base-color), 90%, 100%);
color-100: hsla(var(--base-color), 100%, 100%);`}
      /> */}
    </AnimationCard>
  );
};

export default PaletteGenerator;
