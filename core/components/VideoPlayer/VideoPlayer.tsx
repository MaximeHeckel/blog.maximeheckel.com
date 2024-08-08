import { useDebouncedValue } from '@maximeheckel/design-system';
import { useInView, useReducedMotion } from 'framer-motion';
import React, { useRef } from 'react';
import * as S from './VideoPlayer.styles';

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
}

const VideoPlayer = (props: VideoPlayerProps) => {
  const {
    alt,
    autoPlay,
    controls = false,
    loop,
    muted,
    width,
    height,
    src,
  } = props;

  const ref = useRef(null);
  const isReducedMotionEnabled = useReducedMotion();
  const isInView = useInView(ref, {
    amount: 0.1,
  });

  const debouncedIsInView = useDebouncedValue(isInView, 200);

  return (
    <S.VideoContainer
      ref={ref}
      css={{
        aspectRatio: `${width} / ${height}`,
      }}
    >
      {debouncedIsInView ? (
        <S.Video
          aria-label={alt}
          autoPlay={autoPlay}
          controls={controls || isReducedMotionEnabled || false}
          loop={loop || isReducedMotionEnabled || false}
          muted={muted}
          playsInline
        >
          <source src={src} type="video/mp4" />
        </S.Video>
      ) : null}
    </S.VideoContainer>
  );
};

export { VideoPlayer };
