import {
  Flex,
  Box,
  IconButton,
  isElementOfType,
  Text,
  GlassMaterial,
  Tooltip,
} from '@maximeheckel/design-system';
import { isIOS, isMobileDevice } from 'lib/device';
import { motion, useReducedMotion } from 'motion/react';
import {
  Children,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import {
  PauseIcon,
  PlayIcon,
  VolumeMuteIcon,
  VolumeDownIcon,
  VolumeUpIcon,
  FullscreenIcon,
  PiPExitIcon,
  PiPIcon,
} from './Icons';
import { formatTime } from './utils';

type MediaContextType = {
  isPlaying: boolean;
  togglePlay: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  progressBarRef: React.RefObject<HTMLDivElement | null>;
  currentTime: number;
  duration: number;
  seek: (time: number) => void;
  videoProps: React.VideoHTMLAttributes<HTMLVideoElement>;
  isPiP: boolean;
  isFullscreen: boolean;
  togglePiP: () => void;
  toggleFullscreen: () => void;
  toggleVolume: () => void;
  setVolumeValue: (volume: number) => void;
  volume: number;
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
  const { children, loop, autoPlay, muted, ...rest } = props;
  const [isPlaying, setIsPlaying] = useState(autoPlay || false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPiP, setIsPiP] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(muted ? 0 : 1);
  const [prevVolume, setPrevVolume] = useState(1);
  const [isFocusWithin, setIsFocusWithin] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const lastTimeUpdateRef = useRef<number>(0);

  const isReducedMotionEnabled = useReducedMotion();

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
  const glowChildren = Children.toArray(children).filter((child) =>
    isElementOfType(child, MediaPlayerGlow)
  );
  const videoOverlayChildren = Children.toArray(children).filter((child) =>
    isElementOfType(child, MediaPlayerVideoOverlay)
  );

  const nonVideoChildren = Children.toArray(children).filter(
    (child) =>
      !isElementOfType(child, MediaPlayerVideo) &&
      !isElementOfType(child, MediaPlayerGlow) &&
      !isElementOfType(child, MediaPlayerVideoOverlay)
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

    if (progressBarRef.current) {
      const progress = (time / video.duration) * 100;
      progressBarRef.current.style.transform = `scaleX(${progress / 100})`;
    }
  };

  const toggleVolume = () => {
    if (!videoRef.current) return;

    if (volume === 0) {
      // Currently muted → unmute
      videoRef.current.muted = false;
      videoRef.current.volume = prevVolume;
      setVolume(prevVolume);
    } else {
      // Currently audible → mute
      setPrevVolume(volume);
      videoRef.current.muted = true;
      videoRef.current.volume = 0;
      setVolume(0);
    }
  };

  const setVolumeValue = (volume: number) => {
    if (!videoRef.current) return;
    videoRef.current.muted = volume === 0;
    videoRef.current.volume = volume;
    setVolume(volume);
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch {
      // eslint-disable-next-line no-console
      console.error('PiP not supported or failed');
    }
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await container.requestFullscreen();
      }
    } catch {
      // eslint-disable-next-line no-console
      console.error('Fullscreen not supported or failed');
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnterPiP = () => setIsPiP(true);
    const handleLeavePiP = () => setIsPiP(false);

    video.addEventListener('enterpictureinpicture', handleEnterPiP);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPiP);
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <MediaContext.Provider
      value={{
        isPlaying,
        togglePlay,
        videoRef,
        containerRef,
        progressBarRef,
        currentTime,
        duration,
        seek,
        videoProps: { loop, autoPlay, muted, ...rest },
        isPiP,
        isFullscreen,
        togglePiP,
        toggleFullscreen,
        toggleVolume,
        setVolumeValue,
        volume,
      }}
    >
      <Box>
        <Box
          ref={containerRef}
          as={motion.div}
          initial={
            isPlaying && !isFocusWithin && !isMobileDevice()
              ? 'hidden'
              : 'visible'
          }
          animate={
            isPlaying && !isFocusWithin && !isMobileDevice()
              ? 'hidden'
              : 'visible'
          }
          whileHover="visible"
          onFocus={(event: React.FocusEvent<HTMLDivElement>) => {
            const target = event.target as HTMLElement;
            // Small delay to let the browser apply :focus-visible
            requestAnimationFrame(() => {
              if (target.matches(':focus-visible')) {
                setIsFocusWithin(true);
              }
            });
          }}
          onBlur={(event: React.FocusEvent<HTMLDivElement>) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setIsFocusWithin(false);
            }
          }}
          css={{
            position: 'relative',
            width: '100%',
            borderRadius: 16,
            display: 'block',
            isolation: 'isolate',
          }}
        >
          {isPiP ? null : glowChildren}
          <Box
            css={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 16,
              zIndex: 1,
            }}
          >
            {videoChildren}
          </Box>
          <Box
            css={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 1,
              overflow: 'hidden',
              pointerEvents: 'none',
            }}
          >
            <Box
              as={motion.div}
              css={{
                width: '100%',
                pointerEvents: 'auto',
              }}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1 },
              }}
              transition={{ duration: 0.25 }}
            >
              {videoOverlayChildren}
            </Box>
            <Box
              as={motion.div}
              variants={{
                hidden: { y: 52 },
                visible: { y: 0 },
              }}
              transition={{
                duration: isReducedMotionEnabled ? 0 : 0.3,
                bounce: 0.17,
                type: 'spring',
              }}
              css={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1,
                padding: 'var(--space-2)',
                pointerEvents: 'auto',
              }}
            >
              <Flex
                alignItems="center"
                css={{
                  position: 'relative',
                  zIndex: 1,
                  width: '100%',
                  padding: 'var(--space-1)',
                  borderRadius: 10,
                }}
                justifyContent="space-between"
              >
                <GlassMaterial border={false} />
                {nonVideoChildren}
              </Flex>
            </Box>
          </Box>
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
  fit?: 'cover' | 'contain';
}

const MediaPlayerVideo = (props: MediaPlayerVideoProps) => {
  const { aspectRatio, children, width, height, fit = 'cover' } = props;
  const { videoRef, videoProps, togglePlay } = useMedia();
  const isReducedMotionEnabled = useReducedMotion();

  const autoPlay = videoProps.autoPlay && !isReducedMotionEnabled;

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
        autoPlay={autoPlay}
        css={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          display: 'block',

          cursor: 'pointer',
        }}
        onClick={togglePlay}
        onKeyDown={(event: React.KeyboardEvent<HTMLVideoElement>) => {
          if (event.key === 'Enter') {
            togglePlay();
          }
        }}
        ref={videoRef}
        style={{
          objectFit: fit,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

MediaPlayerVideo.displayName = 'MediaPlayerVideo';

interface MediaPlayerVideoOverlayProps {
  children: React.ReactNode;
}

const MediaPlayerVideoOverlay = (props: MediaPlayerVideoOverlayProps) => {
  const { children } = props;
  return (
    <Box
      css={{
        position: 'relative',
        width: '100%',
        height: '100%',
        padding: 'var(--space-5) var(--space-5)',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: 'hidden',
        backdropFilter: 'blur(0.5px)',
        background:
          'linear-gradient(to bottom, rgba(0, 0, 0, 0.25), transparent)',
      }}
    >
      {children}
    </Box>
  );
};

MediaPlayerVideoOverlay.displayName = 'MediaPlayerVideoOverlay';

interface MediaPlayerGlowProps {
  blur?: number;
  scaleX?: number;
  scaleY?: number;
  canvasWidth?: number;
  canvasHeight?: number;
  fps?: number;
}

const MediaPlayerGlow = (props: MediaPlayerGlowProps) => {
  const {
    blur = 100,
    scaleX = 1.2,
    scaleY = 1.2,
    canvasWidth = 256,
    canvasHeight = 144,
    fps = 15,
  } = props;
  const { videoRef } = useMedia();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (canvasRef.current) {
      ctxRef.current = canvasRef.current.getContext('2d');
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const ctx = ctxRef.current;
    if (!video || !ctx) return;

    const interval = 1000 / fps;
    let lastDrawTime = 0;

    const drawGlow = (timestamp: number) => {
      if (timestamp - lastDrawTime >= interval) {
        ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);
        lastDrawTime = timestamp;
      }

      rafRef.current = requestAnimationFrame(drawGlow);
    };

    rafRef.current = requestAnimationFrame(drawGlow);

    return () => cancelAnimationFrame(rafRef.current);
  }, [videoRef, canvasWidth, canvasHeight, fps]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '90%',
        transform: `translate(-50%, -50%) scale(${scaleX}, ${scaleY})`,
        willChange: 'transform',
        filter: `blur(${blur}px) saturate(1.25)`,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

MediaPlayerGlow.displayName = 'MediaPlayerGlow';

const MediaPlayerPlaybackControls = () => {
  const { isPlaying, togglePlay, toggleVolume, volume, setVolumeValue } =
    useMedia();

  const volumePercent = volume * 100;

  const [isVolumeBlockHovering, setIsVolumeBlockHovering] = useState(false);

  const handleVolumeBlockMouseEnter = () => {
    if (isMobileDevice()) return;
    setIsVolumeBlockHovering(true);
  };

  const handleVolumeBlockMouseLeave = () => {
    if (isMobileDevice()) return;
    setIsVolumeBlockHovering(false);
  };

  return (
    <Flex alignItems="center" gap="0">
      <Tooltip content={isPlaying ? 'Pause' : 'Play'}>
        <IconButton
          aria-label={isPlaying ? 'Pause' : 'Play'}
          style={{ color: 'var(--white)' }}
          onClick={togglePlay}
          variant="tertiary"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </IconButton>
      </Tooltip>
      <Box
        css={{ position: 'relative' }}
        onPointerEnter={handleVolumeBlockMouseEnter}
        onPointerLeave={handleVolumeBlockMouseLeave}
        onFocus={handleVolumeBlockMouseEnter}
        onBlur={handleVolumeBlockMouseLeave}
      >
        <Box
          css={{
            position: 'absolute',
            left: '50%',
            bottom: 0,
            transform: 'translateX(-50%)',
            width: 32,
            paddingBottom: 44,
          }}
          style={{
            opacity: isVolumeBlockHovering ? 1 : 0,
          }}
        >
          <Box
            css={{
              position: 'relative',
              width: '100%',
              height: 102,
              borderRadius: 6,
              overflow: 'hidden',
            }}
          >
            <GlassMaterial border={false} />
            <Box
              as="input"
              aria-hidden="true"
              tabIndex={-1}
              type="range"
              min={0}
              max={100}
              value={volumePercent}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setVolumeValue(Number(e.target.value) / 100);
              }}
              css={{
                position: 'absolute',
                width: 80,
                height: 24,
                left: '50%',
                top: '50%',

                transform: 'translate(-50%, -50%) rotate(-90deg)',
                transformOrigin: 'center center',
                margin: 0,
                appearance: 'none',
                background: 'transparent',
                cursor: 'pointer',

                '&::-webkit-slider-runnable-track': {
                  height: 4,
                  borderRadius: 9999,
                  background: 'var(--track-gradient)',
                },

                '&::-moz-range-track': {
                  height: 4,
                  borderRadius: 9999,
                  background: 'rgba(255, 255, 255, 0.3)',
                },

                '&::-moz-range-progress': {
                  height: 4,
                  borderRadius: 9999,
                  background: 'white',
                },

                '&::-webkit-slider-thumb': {
                  appearance: 'none',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: 'white',
                  marginTop: -4,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                },

                '&::-moz-range-thumb': {
                  border: 'none',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: 'white',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                },
              }}
              style={
                {
                  // Dynamic gradient for WebKit (filled vs unfilled)
                  '--track-gradient': `linear-gradient(to right, white ${volumePercent}%, rgba(255, 255, 255, 0.3) ${volumePercent}%)`,
                } as React.CSSProperties
              }
            />
          </Box>
        </Box>
        <Tooltip content={volumePercent === 0 ? 'Unmute' : 'Mute'}>
          <IconButton
            aria-label={volumePercent === 0 ? 'Unmute' : 'Mute'}
            style={{ color: 'var(--white)' }}
            variant="tertiary"
            onClick={toggleVolume}
            onKeyDown={(event: React.KeyboardEvent<HTMLButtonElement>) => {
              if (event.key === 'ArrowUp') {
                event.preventDefault();
                setVolumeValue(volume + 0.05);
              }

              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setVolumeValue(volume - 0.05);
              }
            }}
          >
            {volumePercent === 0 ? (
              <VolumeMuteIcon />
            ) : volumePercent < 50 ? (
              <VolumeDownIcon />
            ) : (
              <VolumeUpIcon />
            )}
          </IconButton>
        </Tooltip>
      </Box>
    </Flex>
  );
};

MediaPlayerPlaybackControls.displayName = 'MediaPlayerPlaybackControls';

const MediaPlayerTrack = ({ children }: { children: React.ReactNode }) => {
  const { seek, duration, currentTime } = useMedia();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoveredTime, setHoveredTime] = useState(0);
  const [currentVariant, setCurrentVariant] = useState<
    'duration' | 'remaining'
  >('duration');

  const toggleVariant = () => {
    setCurrentVariant((prev) =>
      prev === 'duration' ? 'remaining' : 'duration'
    );
  };

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

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    isDraggingRef.current = true;
    seekFromEvent(event.clientX);

    const handleMouseMove = (event: PointerEvent) => {
      if (isDraggingRef.current) {
        const wrapper = wrapperRef.current;
        const cursor = cursorRef.current;
        if (!wrapper || !cursor) return;

        const rect = wrapper.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right) return;
        seekFromEvent(event.clientX);
        updateCursorPosition(event.clientX);
        setHoveredTime(getPercentageFromEvent(event.clientX) * duration);
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('pointermove', handleMouseMove);
      document.removeEventListener('pointerup', handleMouseUp);
    };

    document.addEventListener('pointermove', handleMouseMove);
    document.addEventListener('pointerup', handleMouseUp);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updateCursorPosition(e.clientX);
    if (!duration) return;
    setHoveredTime(getPercentageFromEvent(e.clientX) * duration);
  };

  const id = useId();

  return (
    <>
      <Text
        css={{
          fontSize: '12px',
          fontVariantNumeric: 'tabular-nums',
        }}
        weight="4"
        variant="primary"
      >
        {formatTime(currentTime)}
      </Text>
      <Flex
        ref={wrapperRef}
        id={`${id}-track-wrapper`}
        css={{
          flex: 1,
          height: '24px',
          cursor: 'crosshair',
          position: 'relative',
          margin: '0 12px 0 12px',
        }}
        onPointerDown={handleMouseDown}
        onPointerMove={handleMouseMove}
        onMouseEnter={() => {
          if (isMobileDevice()) return;
          setIsHovering(true);
        }}
        onMouseLeave={() => {
          if (isMobileDevice()) return;
          setIsHovering(false);
        }}
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
              height: '80%',
              transform: 'translateY(-50%)',
              backgroundColor: 'var(--white)',
              pointerEvents: 'none',
              borderRadius: '9999px',
              boxShadow:
                '0 0 0 0.25px oklch(from var(--gray-100) l c h / 0.25)',
            },
          }}
        >
          <Text
            css={{
              position: 'absolute',
              fontSize: '11px',
              fontVariantNumeric: 'tabular-nums',
              top: '-80%',
              left: '50%',
              width: '70px',
              transform: 'translateX(-50%)',
              textAlign: 'center',
            }}
            weight="4"
            variant="primary"
          >
            {formatTime(hoveredTime)} / {formatTime(duration)}
          </Text>
        </Box>

        <Box
          ref={trackRef}
          id={`${id}-track`}
          tabIndex={0}
          role="slider"
          aria-label="Video track progress"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={currentTime}
          aria-valuetext={formatTime(currentTime)}
          css={{
            position: 'relative',
            height: 4,
            backgroundColor: 'rgba(255,255,255,0.16)',
            alignSelf: 'center',
            borderRadius: '9999px',
            width: '100%',
            overflow: 'hidden',
            '&:focus-visible': {
              outline: '2px solid oklch(from var(--gray-1200) l c h / 0.25)',
              outlineOffset: 4,
              borderRadius: 4,
            },
          }}
          onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key === 'ArrowLeft') {
              seek(currentTime - 1);
            }

            if (event.key === 'ArrowRight') {
              seek(currentTime + 1);
            }
          }}
        >
          {children}
        </Box>
      </Flex>
      <Box
        as="button"
        aria-label="Toggle time display format"
        css={{
          all: 'unset',
          cursor: 'pointer',
          userSelect: 'none',
          '&:focus-visible': {
            outline: '2px solid oklch(from var(--gray-1200) l c h / 0.25)',
            outlineOffset: 4,
            borderRadius: 4,
          },
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
            ? `${formatTime(duration)}`
            : `-${formatTime(duration - currentTime)}`}
        </Text>
      </Box>
    </>
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

const MediaPlayerScreenControls = () => {
  const { togglePiP, toggleFullscreen, isPiP } = useMedia();

  return (
    <Flex alignItems="center" gap="0">
      {isIOS() ? null : (
        <Tooltip content="Fullscreen">
          <IconButton
            aria-label="Toggle fullscreen"
            variant="tertiary"
            style={{ color: 'var(--white)' }}
            onClick={toggleFullscreen}
          >
            <FullscreenIcon />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip content="Picture in Picture">
        <IconButton
          aria-label="Toggle picture in picture"
          variant="tertiary"
          style={{ color: 'var(--white)' }}
          onClick={togglePiP}
        >
          {isPiP ? <PiPExitIcon /> : <PiPIcon />}
        </IconButton>
      </Tooltip>
    </Flex>
  );
};

MediaPlayerScreenControls.displayName = 'MediaPlayerScreenControls';

export const MediaPlayer = {
  Root: MediaPlayerRoot,
  Video: MediaPlayerVideo,
  Glow: MediaPlayerGlow,
  PlaybackControls: MediaPlayerPlaybackControls,
  Track: MediaPlayerTrack,
  Range: MediaPlayerRange,
  ScreenControls: MediaPlayerScreenControls,
  VideoOverlay: MediaPlayerVideoOverlay,
};
