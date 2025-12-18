import {
  Grid,
  Flex,
  Box,
  IconButton,
  isElementOfType,
  Text,
  GlassMaterial,
} from '@maximeheckel/design-system';
import {
  Children,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { PlayIcon } from '@core/components/Code/components/CustomSandpackButtons/CustomSandpackButtons';
import { Main } from '@core/components/Main';

export const PauseIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      color="currentColor"
      fill="none"
    >
      <defs />
      <path
        fill="currentColor"
        d="M6.951,3.25 L7.049,3.25 C7.714,3.25 8.287,3.25 8.746,3.312 C9.237,3.378 9.709,3.527 10.091,3.909 C10.473,4.291 10.622,4.763 10.688,5.254 C10.75,5.712 10.75,6.284 10.75,6.947 L10.75,17.053 C10.75,17.716 10.75,18.288 10.688,18.746 C10.622,19.237 10.473,19.709 10.091,20.091 C9.709,20.473 9.237,20.622 8.746,20.688 C8.288,20.75 7.716,20.75 7.053,20.75 L6.947,20.75 C6.284,20.75 5.712,20.75 5.254,20.688 C4.763,20.622 4.291,20.473 3.909,20.091 C3.527,19.709 3.378,19.237 3.312,18.746 C3.25,18.287 3.25,17.714 3.25,17.049 L3.25,6.951 C3.25,6.286 3.25,5.713 3.312,5.254 C3.378,4.763 3.527,4.291 3.909,3.909 C4.291,3.527 4.763,3.378 5.254,3.312 C5.713,3.25 6.286,3.25 6.951,3.25 L6.951,3.25 Z M16.951,3.25 L17.049,3.25 C17.714,3.25 18.287,3.25 18.746,3.312 C19.237,3.378 19.709,3.527 20.091,3.909 C20.473,4.291 20.622,4.763 20.688,5.254 C20.75,5.712 20.75,6.284 20.75,6.947 L20.75,17.053 C20.75,17.716 20.75,18.288 20.688,18.746 C20.622,19.237 20.473,19.709 20.091,20.091 C19.709,20.473 19.237,20.622 18.746,20.688 C18.288,20.75 17.716,20.75 17.053,20.75 L16.947,20.75 C16.284,20.75 15.712,20.75 15.254,20.688 C14.762,20.622 14.291,20.473 13.909,20.091 C13.527,19.709 13.378,19.237 13.312,18.746 C13.25,18.288 13.25,17.716 13.25,17.053 L13.25,6.947 C13.25,6.284 13.25,5.712 13.312,5.254 C13.378,4.763 13.527,4.291 13.909,3.909 C14.291,3.527 14.762,3.378 15.254,3.312 C15.713,3.25 16.286,3.25 16.951,3.25 Z M14.97,4.97 C14.913,5.027 14.842,5.129 14.798,5.454 C14.752,5.801 14.75,6.272 14.75,7 L14.75,17 C14.75,17.728 14.752,18.199 14.798,18.546 C14.842,18.871 14.913,18.973 14.97,19.03 C15.027,19.087 15.129,19.158 15.454,19.202 C15.801,19.248 16.272,19.25 17,19.25 C17.728,19.25 18.199,19.248 18.546,19.202 C18.871,19.158 18.973,19.087 19.03,19.03 C19.087,18.973 19.158,18.871 19.202,18.546 C19.248,18.199 19.25,17.728 19.25,17 L19.25,7 C19.25,6.272 19.248,5.801 19.202,5.454 C19.158,5.129 19.087,5.027 19.03,4.97 C18.973,4.913 18.871,4.842 18.546,4.798 C18.199,4.752 17.728,4.75 17,4.75 C16.272,4.75 15.801,4.752 15.454,4.798 C15.129,4.842 15.027,4.913 14.97,4.97 Z M4.97,4.97 C4.913,5.027 4.842,5.129 4.798,5.454 C4.752,5.801 4.75,6.272 4.75,7 L4.75,17 C4.75,17.728 4.752,18.199 4.798,18.546 C4.842,18.871 4.913,18.973 4.97,19.03 C5.027,19.087 5.129,19.158 5.454,19.202 C5.801,19.248 6.272,19.25 7,19.25 C7.728,19.25 8.199,19.248 8.546,19.202 C8.871,19.158 8.973,19.087 9.03,19.03 C9.087,18.973 9.158,18.871 9.202,18.546 C9.248,18.199 9.25,17.728 9.25,17 L9.25,7 C9.25,6.272 9.248,5.801 9.202,5.454 C9.158,5.129 9.087,5.027 9.03,4.97 C8.973,4.913 8.871,4.842 8.546,4.798 C8.199,4.752 7.728,4.75 7,4.75 C6.272,4.75 5.801,4.752 5.454,4.798 C5.129,4.842 5.027,4.913 4.97,4.97 Z"
      />
    </svg>
  );
};

type MediaContextType = {
  isPlaying: boolean;
  togglePlay: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  progressBarRef: React.RefObject<HTMLDivElement | null>;
  currentTime: number;
  duration: number;
  seek: (time: number) => void;
  videoProps: React.VideoHTMLAttributes<HTMLVideoElement>;
};

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (!context)
    throw new Error('Media components must be wrapped in MediaPlayer.Root');
  return context;
};

interface MediaPlayerRootProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  children: React.ReactNode;
}

const MediaPlayerRoot = (props: MediaPlayerRootProps) => {
  const { children, loop, autoPlay, ...rest } = props;
  const [isPlaying, setIsPlaying] = useState(autoPlay || false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const lastTimeUpdateRef = useRef<number>(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    if (video.readyState >= 1) {
      handleLoadedMetadata();
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  // Use requestAnimationFrame for smooth 60fps progress bar (direct DOM manipulation)
  // Only update currentTime state every ~250ms for the time display
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = (timestamp: number) => {
      if (video.duration) {
        const progress = (video.currentTime / video.duration) * 100;

        // Direct DOM update for progress bar (no re-render)
        if (progressBarRef.current) {
          progressBarRef.current.style.transform = `scaleX(${progress / 100})`;
        }

        // Throttle state updates for time display (~4 updates/sec)
        if (timestamp - lastTimeUpdateRef.current > 250) {
          setCurrentTime(video.currentTime);
          lastTimeUpdateRef.current = timestamp;
        }

        if (!loop && video.currentTime >= video.duration) {
          setIsPlaying(false);
          video.pause();
        }
      }
      rafRef.current = requestAnimationFrame(updateProgress);
    };

    if (isPlaying) {
      rafRef.current = requestAnimationFrame(updateProgress);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, loop]);

  const videoChildren = Children.toArray(children).filter((child) =>
    isElementOfType(child, MediaPlayerVideo)
  );
  const nonVideoChildren = Children.toArray(children).filter(
    (child) => !isElementOfType(child, MediaPlayerVideo)
  );

  if (!videoChildren.length) {
    throw new Error('MediaPlayer.Root must have a MediaPlayer.Video child');
  }

  const togglePlay = () => {
    if (isPlaying) videoRef.current?.pause();
    else videoRef.current?.play();
    setIsPlaying((prev) => !prev);
  };

  const seek = (time: number) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    video.currentTime = time;
    setCurrentTime(time);

    // Update progress bar immediately
    if (progressBarRef.current) {
      const progress = (time / video.duration) * 100;
      progressBarRef.current.style.transform = `scaleX(${progress / 100})`;
    }
  };

  return (
    <MediaContext.Provider
      value={{
        isPlaying,
        togglePlay,
        videoRef,
        progressBarRef,
        currentTime,
        duration,
        seek,
        videoProps: { loop, autoPlay, ...rest },
      }}
    >
      <Box
        css={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: 16,
          display: 'block',
          overflow: 'hidden',
          isolation: 'isolate',
        }}
      >
        {videoChildren}
        <Box
          css={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1,
            padding: 'var(--space-2)',
          }}
        >
          <Flex
            alignItems="center"
            css={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              padding:
                'var(--space-1) var(--space-4) var(--space-1) var(--space-1)',
              borderRadius: 10,
            }}
            justifyContent="space-between"
          >
            <GlassMaterial border={false} />
            {nonVideoChildren}
          </Flex>
        </Box>
      </Box>
    </MediaContext.Provider>
  );
};

MediaPlayerRoot.displayName = 'MediaPlayerRoot';

interface MediaPlayerVideoProps {
  width?: number;
  height?: number;
  aspectRatio?: string | number;
  children: React.ReactNode;
}

const MediaPlayerVideo = (props: MediaPlayerVideoProps) => {
  const { aspectRatio, children, width, height } = props;
  const { videoRef, videoProps, togglePlay } = useMedia();
  return (
    <Box
      css={{
        width: '100%',
        height: '100%',
        transform: 'scale(1) translateZ(0)',
      }}
      style={{
        aspectRatio: aspectRatio
          ? `${aspectRatio}`
          : width && height
            ? `${width / height}`
            : undefined,
      }}
    >
      <Box
        as="video"
        {...videoProps}
        css={{
          width: '100%',
          height: '100%',
          display: 'block',
          objectFit: 'cover',
          cursor: 'pointer',
        }}
        onClick={togglePlay}
        ref={videoRef}
      >
        {children}
      </Box>
    </Box>
  );
};

MediaPlayerVideo.displayName = 'MediaPlayerVideo';

const MediaPlayerPlaybackControls = () => {
  const { isPlaying, togglePlay } = useMedia();
  return (
    <IconButton
      style={{ color: 'var(--primary)' }}
      onClick={togglePlay}
      variant="tertiary"
    >
      {isPlaying ? <PauseIcon /> : <PlayIcon />}
    </IconButton>
  );
};

MediaPlayerPlaybackControls.displayName = 'MediaPlayerPlaybackControls';

const MediaPlayerTrack = ({ children }: { children: React.ReactNode }) => {
  const { seek, duration } = useMedia();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoveredTime, setHoveredTime] = useState(0);

  const getPercentageFromEvent = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return 0;

    const rect = track.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return x / rect.width;
  };

  const seekFromEvent = (clientX: number) => {
    if (!duration) return;
    const percentage = getPercentageFromEvent(clientX);
    seek(percentage * duration);
  };

  const updateCursorPosition = (clientX: number) => {
    const wrapper = wrapperRef.current;
    const cursor = cursorRef.current;
    if (!wrapper || !cursor) return;

    const rect = wrapper.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    cursor.style.transform = `translateX(${x}px)`;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    seekFromEvent(e.clientX);

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const wrapper = wrapperRef.current;
        const cursor = cursorRef.current;
        if (!wrapper || !cursor) return;

        const rect = wrapper.getBoundingClientRect();
        if (e.clientX < rect.left || e.clientX > rect.right) return;
        seekFromEvent(e.clientX);
        updateCursorPosition(e.clientX);
        setHoveredTime(getPercentageFromEvent(e.clientX) * duration);
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updateCursorPosition(e.clientX);
    if (!duration) return;
    setHoveredTime(getPercentageFromEvent(e.clientX) * duration);
  };

  const id = useId();

  return (
    <Flex
      ref={wrapperRef}
      id={`${id}-track-wrapper`}
      css={{
        flex: 1,
        height: '24px',
        cursor: 'pointer',
        position: 'relative',
        margin: '0 12px 0 0',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Box
        ref={cursorRef}
        css={{
          position: 'absolute',
          opacity: isHovering ? 1 : 0,
          transition: 'opacity 0.15s ease',
          height: '32px',
          zIndex: 4,
          userSelect: 'none',

          '&:before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: '50%',
            bottom: 0,
            width: '2px',
            height: '66%',
            transform: 'translateY(-50%)',
            backgroundColor: 'var(--white)',
            pointerEvents: 'none',
            borderRadius: '9999px',
            boxShadow: '0 0 0 0.25px oklch(from var(--gray-100) l c h / 0.25)',
          },
        }}
      >
        <Text
          css={{
            position: 'absolute',
            fontSize: '11px',
            fontVariantNumeric: 'tabular-nums',
            top: '-66%',
            left: '50%',
            width: '70px',
            transform: 'translateX(-50%)',
          }}
          weight="4"
        >
          {formatTime(hoveredTime)} / {formatTime(duration)}
        </Text>
      </Box>
      <Box
        ref={trackRef}
        id={`${id}-track`}
        css={{
          position: 'relative',
          height: 4,
          backgroundColor: 'rgba(255,255,255,0.16)',
          alignSelf: 'center',
          borderRadius: '9999px',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {children}
      </Box>
    </Flex>
  );
};

MediaPlayerTrack.displayName = 'MediaPlayerTrack';

const MediaPlayerRange = ({ type }: { type: 'played' | 'buffered' }) => {
  const { progressBarRef } = useMedia();
  const isPlayed = type === 'played';

  return (
    <Box
      ref={isPlayed ? progressBarRef : undefined}
      css={{
        position: 'absolute',
        left: 0,
        width: '100%',
        height: '100%',
        transformOrigin: 'left',
      }}
      style={{
        transform: 'scaleX(0)',
        backgroundColor: isPlayed ? 'var(--white)' : 'rgba(255,255,255,0.2)',
        zIndex: isPlayed ? 2 : 1,
      }}
    />
  );
};

MediaPlayerRange.displayName = 'MediaPlayerRange';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const MediaPlayerTime = (props: { variant?: 'duration' | 'remaining' }) => {
  const { variant = 'duration' } = props;
  const { currentTime, duration } = useMedia();

  const [currentVariant, setCurrentVariant] = useState<typeof variant>(variant);

  const toggleVariant = () => {
    setCurrentVariant((prev) =>
      prev === 'duration' ? 'remaining' : 'duration'
    );
  };

  return (
    <Box
      as="button"
      css={{
        border: 'none',
        background: 'none',
        padding: 0,
        margin: 0,
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={toggleVariant}
    >
      <Text
        css={{
          fontSize: '12px',
          fontVariantNumeric: 'tabular-nums',
        }}
        weight="4"
        variant="primary"
      >
        {currentVariant === 'duration'
          ? `${formatTime(currentTime)} / ${formatTime(duration)}`
          : `-${formatTime(duration - currentTime)}`}
      </Text>
    </Box>
  );
};

MediaPlayerTime.displayName = 'MediaPlayerTime';

const MediaPlayer = {
  Root: MediaPlayerRoot,
  Video: MediaPlayerVideo,
  PlaybackControls: MediaPlayerPlaybackControls,
  Track: MediaPlayerTrack,
  Range: MediaPlayerRange,
  Time: MediaPlayerTime,
};

const Test = () => {
  return (
    <Main>
      <Grid
        css={{
          position: 'relative',
          height: 'auto',
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
          <MediaPlayer.Root autoPlay loop>
            <MediaPlayer.Video width={700} height={498}>
              <source
                src="https://d2xl4m2ghaywko.cloudfront.net/glass-webgpu.mp4"
                type="video/mp4"
              />
            </MediaPlayer.Video>
            <MediaPlayer.PlaybackControls />
            <MediaPlayer.Track>
              <MediaPlayer.Range type="played" />
            </MediaPlayer.Track>
            <MediaPlayer.Time />
          </MediaPlayer.Root>
        </Flex>
      </Grid>
    </Main>
  );
};

export default Test;
