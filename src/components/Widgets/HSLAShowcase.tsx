import { css } from '@emotion/core';
import { InlineCode } from 'gatsby-theme-maximeheckel/src/components/MDX/Code';
import React from 'react';
import {
  AnimationCard,
  AnimationCardContent,
  Form,
  HighlightedValue,
} from './Components';

const HSLAShowcase = () => {
  const [hue, setHue] = React.useState(222);
  const [saturation, setSaturation] = React.useState(89);
  const [lightness, setLightness] = React.useState(55);
  const [alpha, setAlpha] = React.useState(100);

  const cssBackgroundColor = `background-color: hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha}%)`;

  return (
    <AnimationCard>
      <AnimationCardContent
        css={css`
          height: 500px;
        `}
      >
        <div
          css={css`
            display: flex;
            justify-content: space-evenly;
            width: 350px;
          `}
        >
          <div
            style={{
              backgroundColor: `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha}%)`,
              height: '150px',
              width: '150px',
              borderRadius: '20px',
              willChange: 'background-color',
            }}
          />
          <div
            css={css`
              position: relative;
              height: 150px;
              width: 150px;
              border-radius: 50%;
              opacity: ${alpha}%;
              background: radial-gradient(
                  circle at 50% 0,
                  red,
                  rgba(242, 13, 13, 0.8) 10%,
                  rgba(230, 26, 26, 0.6) 20%,
                  rgba(204, 51, 51, 0.4) 30%,
                  rgba(166, 89, 89, 0.2) 40%,
                  hsla(0, 0%, 50%, 0) 50%
                ),
                radial-gradient(
                  circle at 85.35533905932738% 14.644660940672622%,
                  #ffbf00,
                  rgba(242, 185, 13, 0.8) 10%,
                  rgba(230, 179, 26, 0.6) 20%,
                  rgba(204, 166, 51, 0.4) 30%,
                  rgba(166, 147, 89, 0.2) 40%,
                  hsla(45, 0%, 50%, 0) 50%
                ),
                radial-gradient(
                  circle at 100% 50%,
                  #80ff00,
                  rgba(128, 242, 13, 0.8) 10%,
                  rgba(128, 230, 26, 0.6) 20%,
                  rgba(128, 204, 51, 0.4) 30%,
                  rgba(128, 166, 89, 0.2) 40%,
                  hsla(90, 0%, 50%, 0) 50%
                ),
                radial-gradient(
                  circle at 85.35533905932738% 85.35533905932738%,
                  #00ff40,
                  rgba(13, 242, 70, 0.8) 10%,
                  rgba(26, 230, 77, 0.6) 20%,
                  rgba(51, 204, 89, 0.4) 30%,
                  rgba(89, 166, 108, 0.2) 40%,
                  hsla(135, 0%, 50%, 0) 50%
                ),
                radial-gradient(
                  circle at 50.00000000000001% 100%,
                  #0ff,
                  rgba(13, 242, 242, 0.8) 10%,
                  rgba(26, 230, 230, 0.6) 20%,
                  rgba(51, 204, 204, 0.4) 30%,
                  rgba(89, 166, 166, 0.2) 40%,
                  hsla(180, 0%, 50%, 0) 50%
                ),
                radial-gradient(
                  circle at 14.64466094067263% 85.35533905932738%,
                  #0040ff,
                  rgba(13, 70, 242, 0.8) 10%,
                  rgba(26, 77, 230, 0.6) 20%,
                  rgba(51, 89, 204, 0.4) 30%,
                  rgba(89, 108, 166, 0.2) 40%,
                  hsla(225, 0%, 50%, 0) 50%
                ),
                radial-gradient(
                  circle at 0 50.00000000000001%,
                  #7f00ff,
                  rgba(128, 13, 242, 0.8) 10%,
                  rgba(128, 26, 230, 0.6) 20%,
                  rgba(128, 51, 204, 0.4) 30%,
                  rgba(128, 89, 166, 0.2) 40%,
                  hsla(270, 0%, 50%, 0) 50%
                ),
                radial-gradient(
                  circle at 14.644660940672615% 14.64466094067263%,
                  #ff00bf,
                  rgba(242, 13, 185, 0.8) 10%,
                  rgba(230, 26, 179, 0.6) 20%,
                  rgba(204, 51, 166, 0.4) 30%,
                  rgba(166, 89, 147, 0.2) 40%,
                  hsla(315, 0%, 50%, 0) 50%
                );
            `}
          >
            <div
              css={css`
                position: absolute;
                height: 150px;
                width: 150px;
                border-radius: 50%;
                background-color: hsla(0, 0%, ${lightness}%, 100%);
                opacity: ${Math.abs(lightness - 50) * 2}%;
              `}
            />
            <div
              css={css`
                position: absolute;
                left: 0;
                right: 0;
                top: 0;
                bottom: 0;
                margin: auto;
                transform: rotate(${hue}deg);
                height: ${saturation}%;
              `}
            >
              <div
                css={css`
                  width: 2px;
                  height: 50%;
                  margin: 0 auto;
                  background-color: var(--maximeheckel-colors-brand);
                  transform: rotate(180deg);
                `}
              />
            </div>
          </div>
        </div>
        <InlineCode>{cssBackgroundColor}</InlineCode>
        <Form
          css={css`
            max-width: 250px;
          `}
        >
          <div style={{ display: 'grid' }}>
            <label htmlFor="hue1">
              Hue: <HighlightedValue>{hue}</HighlightedValue>
            </label>
            <input
              id="hue1"
              type="range"
              min="0"
              max="359"
              value={hue}
              onChange={(e) => setHue(parseInt(e.target.value, 10))}
            />
          </div>
          <div style={{ display: 'grid' }}>
            <label htmlFor="saturation1">
              Saturation: <HighlightedValue>{saturation}</HighlightedValue>
            </label>
            <input
              id="saturation1"
              type="range"
              min="1"
              max="100"
              value={saturation}
              onChange={(e) => setSaturation(parseInt(e.target.value, 10))}
            />
          </div>
          <div style={{ display: 'grid' }}>
            <label htmlFor="lightness">
              Lightness: <HighlightedValue>{lightness}</HighlightedValue>
            </label>
            <input
              id="lightness"
              type="range"
              min="0"
              max="100"
              value={lightness}
              onChange={(e) => setLightness(parseInt(e.target.value, 10))}
            />
          </div>
          <div style={{ display: 'grid' }}>
            <label htmlFor="alpha">
              Alpha: <HighlightedValue>{alpha}</HighlightedValue>
            </label>
            <input
              id="alpha"
              type="range"
              min="0"
              max="100"
              value={alpha}
              onChange={(e) => setAlpha(parseInt(e.target.value, 10))}
            />
          </div>
        </Form>
      </AnimationCardContent>
    </AnimationCard>
  );
};

export default HSLAShowcase;
