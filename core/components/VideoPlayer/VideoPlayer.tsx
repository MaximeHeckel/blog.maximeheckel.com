import { Box, useDebouncedValue } from '@maximeheckel/design-system';
import { useInView, useReducedMotion } from 'motion/react';
import React, { useRef } from 'react';

import { MediaPlayer } from './MediaPlayer';

interface VideoPlayerProps {
  autoPlay?: boolean;
  poster?: string;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  width?: number;
  height?: number;
  alt?: string;
  src: string;
  type?: string;
}

const VideoPlayer = (props: VideoPlayerProps) => {
  const {
    alt,
    autoPlay,
    loop,
    muted,
    width,
    height,
    src,
    type = 'video/mp4',
  } = props;

  const ref = useRef<HTMLDivElement>(null);

  const isInView = useInView(ref, {
    amount: 0.1,
  });

  const isReducedMotionEnabled = useReducedMotion();
  const debouncedIsInView = useDebouncedValue(isInView, 200);

  return (
    <Box
      ref={ref}
      css={{
        aspectRatio: `${width} / ${height}`,
        position: 'relative',
        margin: '0 auto',
        background: 'var(--foreground)',
        width: '100%',
        height: '100%',
      }}
    >
      {debouncedIsInView ? (
        <MediaPlayer.Root
          aria-label={alt}
          playsInline
          muted={muted}
          autoPlay={autoPlay || isReducedMotionEnabled || false}
          loop={loop || isReducedMotionEnabled || false}
        >
          <MediaPlayer.Video width={width} height={height}>
            <source src={src} type={type} />
          </MediaPlayer.Video>
          <MediaPlayer.PlaybackControls />
          <MediaPlayer.Track>
            <MediaPlayer.Range type="played" />
          </MediaPlayer.Track>
          <MediaPlayer.ScreenControls />
        </MediaPlayer.Root>
      ) : null}
    </Box>
  );
};

export { VideoPlayer };
