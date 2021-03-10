import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useTheme } from '@theme/context/ThemeContext';
import useScrollSpy from '@theme/hooks/useScrollSpy';
import React from 'react';
import InlineCode from '../../InlineCode';
import {
  AnimationCard,
  AnimationCardContent,
  Form,
  HighlightedValue,
} from './Components';

const BrowserWindow = styled('div')<{ dark?: boolean }>`
  border-radius: var(--border-radius-1);
  background: ${(p) => (p.dark ? '#38393A' : '#ffffff')};
  width: 100%;
  box-shadow: var(--maximeheckel-shadow-3);
`;

const BrowserHeader = styled('div')<{ dark?: boolean }>`
  height: 53px;
  padding: 0px 20px;
  background: ${(p) => (p.dark ? '#191C1F' : '#ffffff')};
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  box-shadow: 0px 0.5px 0px rgba(0, 0, 0, 0.15),
    inset 0px -0.5px 0px rgba(0, 0, 0, 0.05);
  border-radius: var(--border-radius-1) var(--border-radius-1) 0px 0px;
`;

const SearchBar = styled('div')<{ dark?: boolean }>`
  background: ${(p) => (p.dark ? '#0C0F12' : 'rgba(0, 0, 0, 0.05)')};
  border-radius: 6px;
  height: 28px;
  width: 250px;
`;

const TrafficLights = styled('div')`
  width: 60px;
  height: 15px;
  flex-direction: row;
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

const Section = styled('section')<{ intersecting?: boolean }>`
  margin-bottom: 20px;
  background: ${(p) =>
    p.intersecting
      ? `linear-gradient(to right bottom, rgb(147, 197, 253), rgb(196, 181, 253));`
      : `var(--maximeheckel-colors-foreground);`}
  display: flex;
  flex-direction: column;
  gap: 20px;
  justify-content: center;
  align-items: center;
  color: var(--maximeheckel-colors-typeface-0);
  border-radius: var(--border-radius-2);
  border: 1px solid var(--maximeheckel-colors-emphasis);
  box-shadow: var(--maximeheckel-shadow-2);
`;

const ScrollSpyWidget = () => {
  const { dark } = useTheme();
  const ids = React.useMemo(() => ['section1', 'section2', 'section3'], []);
  const [elements, setElements] = React.useState<Element[]>([]);
  const [offset, setOffset] = React.useState(50);
  const [height, setHeight] = React.useState(200);

  const [index, , intersectionRatios] = useScrollSpy(elements, {
    root: document.querySelector('#widgetRoot')!,
    offset,
  });

  React.useEffect(() => {
    const widgetElements = ids.map(
      (item) => document.querySelector(`section[id="${item}"]`)!
    );

    setElements(widgetElements);
  }, [ids]);

  return (
    <>
      <BrowserWindow dark={dark}>
        <BrowserHeader dark={dark}>
          <TrafficLights>
            <div
              css={css`
                background: #ee6a5f;
                height: 12px;
                width: 12px;
                border-radius: 50px;
                box-sizing: border-box;
                box-shadow: inset 0px 0px 6px #ec6d62;
              `}
            />
            <div
              css={css`
                background: #f5bd4f;
                height: 12px;
                width: 12px;
                border-radius: 50px;
                box-sizing: border-box;
                box-shadow: inset 0px 0px 6px #f5c451;
              `}
            />
            <div
              css={css`
                background: #61c454;
                height: 12px;
                width: 12px;
                border-radius: 50px;
                box-sizing: border-box;
                box-shadow: inset 0px 0px 6px #68cc58;
              `}
            />
          </TrafficLights>
          <SearchBar dark={dark} />
          <div
            css={css`
              width: 50px;
            `}
          />
        </BrowserHeader>
        <div
          css={css`
            position: relative;
            width: 100%;
          `}
        >
          <div
            css={css`
              position: absolute;
              height: ${offset}px;
              width: 98%;
              z-index: 2;
              background: repeating-linear-gradient(
                -45deg,
                var(--maximeheckel-colors-foreground),
                var(--maximeheckel-colors-foreground) 5px,
                var(--maximeheckel-colors-emphasis) 5px,
                var(--maximeheckel-colors-emphasis) 10px
              );
            `}
          />
          <div
            id="widgetRoot"
            css={css`
              position: relative;
              box-sizing: border-box;
              overflow-y: scroll;
              height: 400px;

              ::-webkit-scrollbar {
                -webkit-appearance: none;
                width: 8px;
              }

              ::-webkit-scrollbar-track {
                background-color: hsla(var(--palette-gray-30), 0.2);
                border-radius: 8px;
              }

              ::-webkit-scrollbar-thumb {
                border-radius: 8px;
                background-color: var(--maximeheckel-colors-typeface-2);
              }
              padding: 0px 20px;
            `}
          >
            {ids.map((id, idIndex) => (
              <div key={id}>
                <p
                  css={css`
                    font-weight: 700;
                    margin-bottom: 8px;
                  `}
                >
                  Section {idIndex + 1}
                </p>
                <Section
                  css={css`
                    height: ${height}px;
                  `}
                  key={id}
                  id={id}
                  intersecting={index === idIndex}
                >
                  <div>
                    This section {index === idIndex ? 'is' : 'is not'}{' '}
                    intersecting
                  </div>
                  <div>
                    Intersection Ratio:{' '}
                    <HighlightedValue>
                      {intersectionRatios && intersectionRatios[idIndex]
                        ? intersectionRatios[idIndex].toFixed(3)
                        : '0.000'}
                    </HighlightedValue>
                  </div>
                </Section>
              </div>
            ))}

            <div
              css={css`
                height: 200px;
                margin-bottom: 40px;
                display: flex;
                justify-content: center;
                align-items: center;
                color: var(--maximeheckel-colors-typeface-0);
              `}
            />
          </div>
        </div>
      </BrowserWindow>
      <AnimationCard>
        <AnimationCardContent
          css={css`
            height: 250px;
          `}
        >
          <Form>
            <div
              css={css`
                display: grid;
                margin-bottom: 32px;
              `}
            >
              <label htmlFor="offset">
                Offset: <HighlightedValue>{-offset}</HighlightedValue>
              </label>
              <input
                id="offset"
                type="range"
                min="0"
                max="400"
                value={offset}
                onChange={(e) => setOffset(parseInt(e.target.value, 10))}
              />
              <InlineCode>rootMargin: -{offset}px 0px 0px 0px</InlineCode>
            </div>
            <div css={{ display: 'grid' }}>
              <label htmlFor="height">
                Section Height: <HighlightedValue>{height}</HighlightedValue>
              </label>
              <input
                id="height"
                type="range"
                step="10"
                min="100"
                max="500"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value, 10))}
              />
            </div>
          </Form>
        </AnimationCardContent>
      </AnimationCard>
    </>
  );
};

export default ScrollSpyWidget;
