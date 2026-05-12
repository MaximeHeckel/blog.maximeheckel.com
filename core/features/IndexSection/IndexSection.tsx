import { Box, Flex, Grid, Text } from '@maximeheckel/design-system';
import dynamic from 'next/dynamic';

const Scene = dynamic(() => import('./Scene').then((mod) => mod.Scene), {
  ssr: false,
});

const IndexSection = () => {
  return (
    <>
      <Scene />
      <Grid.Item
        col={2}
        justifySelf="center"
        css={{
          display: 'flex',
          alignItems: 'end',
          justifyContent: 'center',
          minHeight: 'clamp(400px, 70dvh, 600px)',
        }}
      >
        <Box
          id="index"
          css={{
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      </Grid.Item>
      <Grid.Item col={2}>
        <Flex
          alignItems="start"
          css={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 'var(--space-4)',
            padding: '0 var(--space-4)',

            '@media (min-width: 663px)': {
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 'var(--space-4)',
            },
          }}
        >
          <Flex
            css={{
              flexDirection: 'column',
              gap: 'var(--space-5)',
              alignItems: 'start',
              justifyContent: 'space-between',
            }}
          >
            <Text
              as="h1"
              css={{
                fontWeight: 510,
                letterSpacing: '-0.028em',
                lineHeight: 1.2,
                textWrap: 'balance',
                textAlign: 'left',
              }}
              family="display"
              size="6"
              variant="primary"
            >
              Experiments and essays on the modern web.
            </Text>
            <Text
              as="p"
              css={{
                textAlign: 'left',
                letterSpacing: '-0.25px',
              }}
              variant="secondary"
              size="3"
              weight="3"
            >
              Hi I&rsquo;m{' '}
              <Text as="span" variant="primary" weight="4" size="3">
                Maxime
              </Text>
              , and this is my blog. In here, you&rsquo;ll find all the articles
              I wished I had when I was learning about{' '}
              <Text as="span" variant="primary" weight="4" size="3">
                web development, shaders, real-time 3D on the web
              </Text>
              , and more.
            </Text>
          </Flex>
          <Text
            as="p"
            css={{
              textAlign: 'left',
              letterSpacing: '-0.25px',
            }}
            variant="secondary"
            size="3"
            weight="3"
          >
            Each piece I write aims to dive deep into the topics I&rsquo;m
            passionate about, while also making complex topics more accessible
            through{' '}
            <Text as="span" style={{ fontStyle: 'italic' }} weight="3" size="3">
              interactive playgrounds, visualization, and detailed walkthroughs
            </Text>
            . My goal is to give you the tools and intuition to explore further
            on your own.
          </Text>
        </Flex>
      </Grid.Item>
    </>
  );
};

export { IndexSection };
