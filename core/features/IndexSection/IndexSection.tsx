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
          minHeight: 'clamp(400px, 90dvh, 800px)',
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
        <Box
          css={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            pointerEvents: 'auto',
            zIndex: 1,
            height: 170,
            width: 380,
            paddingTop: 24,
            maskImage: 'radial-gradient(ellipse, black 50%, transparent 72%)',
          }}
        >
          <Text
            as="h1"
            css={{
              letterSpacing: '-1.5px',
              lineHeight: 1.2,
              maxWidth: 400,
              textWrap: 'balance',
              textAlign: 'center',
            }}
            family="serif"
            size="8"
            variant="primary"
            weight="3"
          >
            Exploring the depths of the{' '}
            <Text
              as="span"
              css={{
                letterSpacing: 'inherit',
                fontSize: 'inherit',
                fontWeight: 'inherit',
                fontFamily: 'inherit',
                fontStyle: 'italic',
              }}
              variant="primary"
            >
              web
            </Text>
            .
          </Text>
        </Box>
      </Grid.Item>
      <Grid.Item col={2} justifySelf="center">
        <Flex css={{ maxWidth: 450, padding: '0 16px' }}>
          <Text
            as="p"
            css={{
              textAlign: 'center',
              textWrap: 'balance',
              letterSpacing: '-1.0px',
            }}
            variant="secondary"
            size="4"
            weight="3"
          >
            Hi I&apos;m Maxime, and this is my blog. In here, you&apos;ll find
            all the articles I wished I had when I was learning about web
            development, shaders, real-time 3D on the web, and more.
            <br />
            <br />
            Each piece I write aims to dive deep into the topics I&apos;m
            passionate about, while also making complex topics more accessible
            through interactive playgrounds, visualization, and well detailed
            walkthroughs. My goal is to give you the tools and intuition to
            explore further on your own.
          </Text>
        </Flex>
      </Grid.Item>
    </>
  );
};

export { IndexSection };
