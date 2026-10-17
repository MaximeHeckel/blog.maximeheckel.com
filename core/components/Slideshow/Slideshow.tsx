import { GlassMaterial, Icon } from '@maximeheckel/design-system';
import { cloudflareLoader } from 'lib/next-image-loader';
import { useInView, useReducedMotion } from 'motion/react';
import NextImage from 'next/image';
import {
  CSSProperties,
  DragEvent,
  FocusEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import * as S from './Slideshow.styles';
import { SlideshowSteps } from './SlideshowSteps';
import { useAutoPlay } from './useAutoPlay';
import { useSlideshowDrag } from './useSlideshowDrag';
import { useSlideshowKeyboard } from './useSlideshowKeyboard';

export interface SlideshowProps {
  images: string[];
  width?: number;
  height?: number;
  alt?: string;
  aspectRatio?: CSSProperties['aspectRatio'];
  active?: number;
  onStepChange?: (index: number) => void;
  orientation?: 'horizontal' | 'vertical';
  transition?: 'slide' | 'fade';
  maxVisible?: number;
  autoPlay?: boolean;
  stepDuration?: number;
  loop?: boolean;
}

const Chevron = ({
  direction,
}: {
  direction: 'left' | 'right' | 'up' | 'down';
}) => (
  <Icon.Chevron
    size={4}
    variant="default"
    aria-hidden="true"
    focusable="false"
    style={{
      // Shift toward the tip before rotation to balance all four directions.
      transform: `rotate(${{ left: 90, right: -90, up: 180, down: 0 }[direction]}deg) translateY(1px)`,
    }}
  />
);

export const Slideshow = ({
  images,
  width = 700,
  height = 400,
  alt = 'Image',
  aspectRatio = 16 / 9,
  active,
  onStepChange,
  orientation = 'horizontal',
  transition,
  maxVisible = 5,
  autoPlay = false,
  stepDuration = 5000,
  loop = false,
}: SlideshowProps) => {
  const id = useId();
  const imageTransition = transition ?? (autoPlay ? 'fade' : 'slide');

  const [internalIndex, setInternalIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const galleryRef = useRef<HTMLElement>(null);
  const isInView = useInView(galleryRef);
  const reducedMotion = useReducedMotion();

  const currentIndex = Math.max(
    0,
    Math.min(active ?? internalIndex, images.length - 1)
  );

  const select = useCallback(
    (index: number) => {
      setInternalIndex(index);
      onStepChange?.(index);
    },
    [onStepChange]
  );

  const playback = useAutoPlay({
    count: images.length,
    active: currentIndex,
    onStepChange: select,
    enabled: autoPlay && mounted && reducedMotion === false,
    suspended: !isInView,
    stepDuration,
    loop,
  });

  const navigate = (index: number) => {
    select((index + images.length) % images.length);
  };

  const drag = useSlideshowDrag({
    active: currentIndex,
    count: images.length,
    orientation,
    loop,
    reducedMotion: reducedMotion === true,
    onDragStart: playback.pause,
    onNavigate: select,
  });

  const canTogglePlayback =
    autoPlay &&
    mounted &&
    !reducedMotion &&
    (loop || currentIndex < images.length - 1);

  useSlideshowKeyboard({
    ref: galleryRef,
    orientation,
    active: currentIndex,
    count: images.length,
    loop,
    onNavigate: (index) => {
      playback.pause();
      select(index);
    },
    onTogglePlayback: canTogglePlayback ? playback.toggle : undefined,
  });

  const previewIndex = drag.preview?.index ?? null;
  const previewRadius = drag.preview?.radius ?? 1;

  if (images.length === 0) return null;

  return (
    <S.GalleryContainer
      ref={galleryRef}
      aria-label="Slide Show"
      aria-roledescription="carousel"
      aria-describedby={`${id}-instructions ${id}-status`}
      aria-keyshortcuts={
        orientation === 'vertical'
          ? 'ArrowUp ArrowDown'
          : 'ArrowLeft ArrowRight'
      }
      tabIndex={images.length > 1 ? 0 : undefined}
      data-slideshow={orientation}
      data-in-view={isInView && images.length > 1}
      onFocusCapture={(event: FocusEvent<HTMLElement>) => {
        const target = event.target as HTMLElement;

        if (
          !target.closest('[data-playback]') &&
          target.matches(':focus-visible')
        ) {
          playback.pause();
        }
      }}
    >
      <S.VisuallyHidden id={`${id}-instructions`}>
        {orientation === 'vertical'
          ? 'Use Up and Down arrow keys to change slides.'
          : 'Use Left and Right arrow keys to change slides.'}
        {canTogglePlayback ? ' Press Space to pause or play.' : ''}
      </S.VisuallyHidden>
      <S.VisuallyHidden
        id={`${id}-status`}
        aria-live={playback.playing ? 'off' : 'polite'}
        aria-atomic="true"
      >
        Slide {currentIndex + 1} of {images.length}.
      </S.VisuallyHidden>
      <S.GallerySurface>
        <S.Viewport
          data-orientation={orientation}
          data-swipeable={images.length > 1}
          data-grabbing={drag.grabbing}
          {...drag.handlers}
          onDragStart={(event: DragEvent<HTMLDivElement>) =>
            event.preventDefault()
          }
        >
          <S.ImageTrack
            data-transition={imageTransition}
            data-orientation={orientation}
            data-dragging={drag.preview !== null}
            style={{
              transform:
                imageTransition === 'slide' && orientation === 'horizontal'
                  ? `translateX(-${currentIndex * 100}%)`
                  : undefined,
            }}
          >
            {images.map((src, index) => (
              <S.ImageSlide
                key={`${index}-${src}`}
                data-active={index === currentIndex}
                data-transition={imageTransition}
                data-orientation={orientation}
                data-dragging={drag.preview !== null}
                role="tabpanel"
                id={`${id}-panel-${index}`}
                aria-labelledby={
                  images.length > 1 ? `${id}-tab-${index}` : undefined
                }
                aria-label={images.length === 1 ? 'Step 1' : undefined}
                aria-hidden={index !== currentIndex}
                inert={index !== currentIndex}
                style={{
                  aspectRatio,
                  transform:
                    imageTransition === 'slide' && orientation === 'vertical'
                      ? `translateY(${(index - currentIndex) * 100}%)`
                      : undefined,
                }}
              >
                <NextImage
                  loader={cloudflareLoader}
                  src={src}
                  alt={alt}
                  width={width}
                  height={height}
                  sizes="(max-width: 750px) 100vw, 700px"
                  draggable={false}
                />
              </S.ImageSlide>
            ))}
          </S.ImageTrack>
          {previewIndex !== null ? (
            <S.DragTrack
              aria-hidden="true"
              inert
              data-drag-preview
              style={
                orientation === 'horizontal'
                  ? { x: drag.offset }
                  : { y: drag.offset }
              }
            >
              {Array.from({ length: previewRadius * 2 + 1 }, (_, slot) => {
                const position = slot - previewRadius;
                const index = previewIndex + position;

                const src = loop
                  ? images[
                      ((index % images.length) + images.length) % images.length
                    ]
                  : images[index];

                return (
                  <S.DragSlide
                    key={index}
                    style={{
                      transform:
                        orientation === 'horizontal'
                          ? `translateX(${position * 100}%)`
                          : `translateY(${position * 100}%)`,
                    }}
                  >
                    {src ? (
                      <NextImage
                        loader={cloudflareLoader}
                        src={src}
                        alt=""
                        width={width}
                        height={height}
                        sizes="(max-width: 750px) 100vw, 700px"
                        draggable={false}
                        loading="eager"
                        decoding="sync"
                      />
                    ) : null}
                  </S.DragSlide>
                );
              })}
            </S.DragTrack>
          ) : null}
        </S.Viewport>
        {images.length > 1 ? (
          <S.Controls
            data-orientation={orientation}
            onMouseDownCapture={(event: MouseEvent<HTMLDivElement>) => {
              if (event.button === 0) event.preventDefault();
            }}
          >
            <S.ControlButton
              type="button"
              tabIndex={-1}
              aria-label="Previous image"
              disabled={!loop && currentIndex === 0}
              onClick={() => navigate(currentIndex - 1)}
            >
              <GlassMaterial border={false} />
              <Chevron direction={orientation === 'vertical' ? 'up' : 'left'} />
            </S.ControlButton>
            <SlideshowSteps
              id={id}
              focusable={false}
              count={images.length}
              active={currentIndex}
              onStepClick={navigate}
              orientation={orientation}
              maxVisible={maxVisible}
              autoPlay={autoPlay}
              filling={playback.filling}
              playing={playback.filling}
              fillDuration={playback.fillDuration}
            />
            <S.ControlButton
              type="button"
              tabIndex={-1}
              aria-label="Next image"
              disabled={!loop && currentIndex === images.length - 1}
              onClick={() => navigate(currentIndex + 1)}
            >
              <GlassMaterial border={false} />
              <Chevron
                direction={orientation === 'vertical' ? 'down' : 'right'}
              />
            </S.ControlButton>
            {autoPlay && mounted && !reducedMotion ? (
              <S.ControlButton
                type="button"
                tabIndex={-1}
                aria-label={
                  playback.playing ? 'Pause slideshow' : 'Play slideshow'
                }
                data-playback
                onClick={playback.toggle}
                disabled={!loop && currentIndex === images.length - 1}
              >
                <GlassMaterial border={false} />
                {playback.playing ? (
                  <Icon.Pause
                    size={4}
                    variant="default"
                    aria-hidden="true"
                    focusable="false"
                  />
                ) : (
                  <Icon.Play
                    size={4}
                    variant="default"
                    aria-hidden="true"
                    focusable="false"
                  />
                )}
              </S.ControlButton>
            ) : null}
          </S.Controls>
        ) : null}
      </S.GallerySurface>
    </S.GalleryContainer>
  );
};
