import { Card, Flex, InlineCode, Range } from '@maximeheckel/design-system';
import React from 'react';
import { AnimationCardContent, Form, HighlightedValue } from '../Components';

const HSLAShowcase = () => {
  const [hue, setHue] = React.useState(222);
  const [saturation, setSaturation] = React.useState(89);
  const [lightness, setLightness] = React.useState(55);
  const [alpha, setAlpha] = React.useState(100);

  const cssBackgroundColor = `background-color: hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha}%)`;

  return (
    <Card
      depth={1}
      css={{
        marginBottom: '2.25rem',
      }}
    >
      <AnimationCardContent
        css={{
          height: '700px',
        }}
      >
        <Flex
          css={{
            width: '350px',

            '@media (max-width: 700px)': {
              width: '100%',
            },
          }}
          justifyContent="space-between"
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
            style={{
              position: 'relative',
              height: '150px',
              width: '150px',
              borderRadius: '50%',
              opacity: `${alpha}%`,
              background: `radial-gradient(
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
                )`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                height: '150px',
                width: '150px',
                borderRadius: '50%',
                backgroundColor: `hsla(0, 0%, ${lightness}%, 100%)`,
                opacity: `${Math.abs(lightness - 50) * 2}%`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '0',
                right: '0',
                top: '0',
                bottom: '0',
                margin: 'auto',
                transform: `rotate(${hue}deg)`,
                height: `${saturation}%`,
              }}
            >
              <div
                style={{
                  width: '2px',
                  height: '50%',
                  margin: '0 auto',
                  backgroundColor: 'var(--maximeheckel-colors-brand)',
                  transform: 'rotate(180deg)',
                }}
              />
            </div>
          </div>
        </Flex>
        <InlineCode>{cssBackgroundColor}</InlineCode>
        <Form>
          <Range
            id="hue1"
            label={
              <span>
                Hue: <HighlightedValue>{hue}</HighlightedValue>
              </span>
            }
            aria-label="Hue"
            min={0}
            max={359}
            value={hue}
            onChange={(value) => setHue(value)}
          />
          <Range
            id="saturation1"
            label={
              <span>
                Saturation: <HighlightedValue>{saturation}</HighlightedValue>
              </span>
            }
            aria-label="Saturation"
            min={1}
            max={100}
            value={saturation}
            onChange={(value) => setSaturation(value)}
          />
          <Range
            id="lightness"
            label={
              <span>
                Lightness: <HighlightedValue>{lightness}</HighlightedValue>
              </span>
            }
            aria-label="Lightness"
            min={0}
            max={100}
            value={lightness}
            onChange={(value) => setLightness(value)}
          />
          <Range
            id="alpha"
            label={
              <span>
                Alpha: <HighlightedValue>{alpha}</HighlightedValue>
              </span>
            }
            aria-label="Alpha"
            min={0}
            max={100}
            value={alpha}
            onChange={(value) => setAlpha(value)}
          />
        </Form>
      </AnimationCardContent>
    </Card>
  );
};

export default HSLAShowcase;
