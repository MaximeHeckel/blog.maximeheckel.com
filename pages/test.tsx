import { Flex, Grid, Text } from '@maximeheckel/design-system';

import { Main } from '@core/components/Main';
import { MediaPlayer } from '@core/components/VideoPlayer/MediaPlayer';

const Test = () => {
  return (
    <Main>
      <Grid
        css={{
          position: 'relative',
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          backgroundColor: 'var(--background)',
          paddingTop: 'var(--space-10)',
          borderBottomRightRadius: 4,
          borderBottomLeftRadius: 4,
        }}
        gapX={2}
        templateColumns="1fr minmax(auto, 700px) 1fr"
      >
        <Flex
          alignItems="center"
          as={Grid.Item}
          direction="column"
          col={2}
          gap="10"
        >
          <MediaPlayer.Root playsInline muted autoPlay loop>
            <MediaPlayer.Glow blur={70} scaleX={1.1} scaleY={1.3} />
            <MediaPlayer.VideoOverlay>
              <Text css={{ letterSpacing: '-0.022em' }} weight="3">
                WebGPU - Glass 02
              </Text>
            </MediaPlayer.VideoOverlay>
            <MediaPlayer.Video width={700} height={398} fit="cover">
              <source
                src="https://cdn.maximeheckel.com/work/glasswebgpu3.mp4"
                type="video/mp4"
              />
            </MediaPlayer.Video>
            <MediaPlayer.PlaybackControls />
            <MediaPlayer.Track>
              <MediaPlayer.Range type="played" />
            </MediaPlayer.Track>
            <MediaPlayer.ScreenControls />
          </MediaPlayer.Root>
        </Flex>
      </Grid>
    </Main>
  );
};

export default Test;
