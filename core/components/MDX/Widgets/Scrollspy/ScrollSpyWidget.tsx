import {
  Shadows,
  styled,
  Card,
  Flex,
  InlineCode,
  Range,
} from '@maximeheckel/design-system';
import React from 'react';

import { AnimationCardContent, Form, HighlightedValue } from '../Components';
import useScrollSpy from './useScrollSpy';

const BrowserWindow = styled('div', {
  borderRadius: 'var(--border-radius-1)',
  width: '100%',
  boxShadow: Shadows[2],

  variants: {
    dark: {
      true: {
        background: '#38393A',
      },
      false: {
        background: '#ffffff',
      },
    },
  },
});

const BrowserHeader = styled('div', {
  height: '53px',
  padding: '0px 20px',
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row',
  justifyContent: 'space-between',
  boxShadow: `0px 0.5px 0px rgba(0, 0, 0, 0.15),
    inset 0px -0.5px 0px rgba(0, 0, 0, 0.05)`,
  borderRadius: 'var(--border-radius-1) var(--border-radius-1) 0px 0px',

  variants: {
    dark: {
      true: {
        background: '#191C1F',
      },
      false: {
        background: '#ffffff',
      },
    },
  },
});

const SearchBar = styled('div', {
  borderRadius: '6px',
  height: '28px',
  minWidth: '150px',
  width: '50%',

  variants: {
    dark: {
      true: {
        background: '#0C0F12',
      },
      false: {
        background: 'rgba(0, 0, 0, 0.05)',
      },
    },
  },
});

const TrafficLightWrapper = styled(Flex, {
  width: '60px',
  height: '15px',
});

const TrafficLight = styled('div', {
  height: '12px',
  width: '12px',
  borderRadius: '50px',
  boxSizing: 'border-box',

  variants: {
    variant: {
      red: {
        background: '#ee6a5f',
        boxShadow: 'inset 0px 0px 6px #ec6d62',
      },
      yellow: {
        background: '#f5bd4f',
        boxShadow: 'inset 0px 0px 6px #f5c451',
      },
      green: {
        background: '#61c454',
        boxShadow: 'inset 0px 0px 6px #68cc58',
      },
    },
  },
});

const Section = styled('section', {
  marginBottom: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  justifyContent: 'center',
  alignItems: 'center',
  color: 'var(--text-primary)',
  borderRadius: 'var(--border-radius-2)',
  border: '1px solid var(--emphasis)',

  variants: {
    intersecting: {
      true: {
        background:
          'linear-gradient(to right bottom, rgb(147, 197, 253), rgb(196, 181, 253))',
      },
      false: {
        background: 'var(--foreground)',
      },
    },
  },
});

const Offset = styled('div', {
  position: 'absolute',

  width: '98%',
  zIndex: '2',
  background: `repeating-linear-gradient(
    -45deg,
    var(--foreground),
    var(--foreground) 5px,
    var(--emphasis) 5px,
    var(--emphasis) 10px
  )`,
});

const WidgetRoot = styled('div', {
  position: 'relative',
  boxSizing: 'border-box',
  overflowY: 'scroll',
  height: '400px',
  padding: '0px 20px',

  '&::-webkit-scrollbar': {
    WebkitAppearance: 'none',
    width: '8px',
  },

  '&::-webkit-scrollbar-track': {
    backgroundColor: 'var(--foreground)',
    borderRadius: '8px',
  },

  '&::-webkit-scrollbar-thumb': {
    borderRadius: '8px',
    backgroundColor: 'var(--text-tertiary)',
  },
});

const ScrollSpyWidget = () => {
  const ids = React.useMemo(() => ['section1', 'section2', 'section3'], []);
  const [elements, setElements] = React.useState<Element[]>([]);
  const [offset, setOffset] = React.useState(50);
  const [height, setHeight] = React.useState(200);

  const [index] = useScrollSpy(elements, {
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
      <BrowserWindow dark>
        <BrowserHeader dark>
          <TrafficLightWrapper
            alignItems="center"
            direction="row"
            justifyContent="space-around"
          >
            <TrafficLight variant="red" />
            <TrafficLight variant="yellow" />
            <TrafficLight variant="green" />
          </TrafficLightWrapper>
          <SearchBar dark />
          <div
            style={{
              width: '50px',
            }}
          />
        </BrowserHeader>
        <div
          style={{
            position: 'relative',
            width: '100%',
          }}
        >
          <Offset
            css={{
              height: `${offset}px`,
            }}
          />
          <WidgetRoot id="widgetRoot">
            {ids.map((id, idIndex) => (
              <div key={id}>
                <p
                  style={{
                    fontWeight: 700,
                    marginBottom: '8px',
                  }}
                >
                  Section {idIndex + 1}
                </p>
                <Section
                  css={{
                    height: `${height}px`,
                  }}
                  key={id}
                  id={id}
                  intersecting={index === idIndex}
                >
                  <div>
                    This section {index === idIndex ? 'is' : 'is not'}{' '}
                    intersecting
                  </div>
                </Section>
              </div>
            ))}

            <Flex
              alignItems="center"
              justifyContent="center"
              css={{
                height: '200px',
                marginBottom: '40px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'var(--text-primary)',
              }}
            />
          </WidgetRoot>
        </div>
      </BrowserWindow>
      <Card
        depth={1}
        css={{
          margin: '32px 0px',
        }}
      >
        <AnimationCardContent
          style={{
            height: '250px',
          }}
        >
          <Form>
            <Range
              id="offset"
              label={
                <span>
                  Offset: <HighlightedValue>{-offset}</HighlightedValue>
                </span>
              }
              aria-label="Offset"
              min={0}
              max={400}
              value={offset}
              onChange={(value) => setOffset(value)}
            />
            <InlineCode>rootMargin: -{offset}px 0px 0px 0px</InlineCode>
            <br />
            <Range
              id="height"
              label={
                <span>
                  Section Height: <HighlightedValue>{height}</HighlightedValue>
                </span>
              }
              aria-label="Section Height"
              step="10"
              min={100}
              max={500}
              value={height}
              onChange={(value) => setHeight(value)}
            />
          </Form>
        </AnimationCardContent>
      </Card>
    </>
  );
};

export default ScrollSpyWidget;
