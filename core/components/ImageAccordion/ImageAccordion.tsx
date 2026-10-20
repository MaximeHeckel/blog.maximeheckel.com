import { cloudflareLoader } from 'lib/next-image-loader';
import { useReducedMotion } from 'motion/react';
import { FocusEvent, PointerEvent, useEffect, useRef, useState } from 'react';

import * as S from './ImageAccordion.styles';

export interface ImageAccordionImage {
  src: string;
  alt: string;
}

export interface ImageAccordionProps {
  images: ImageAccordionImage[];
  label?: string;
  /** Hovered image's percentage of the row width, excluding gaps. */
  expandedWidth?: number;
  /** Height of the entire accordion in pixels. */
  height?: number;
  reach?: number;
  bounce?: number;
  gap?: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

// Preserve Bencho's frame-normalized spring and its default motion tuning.
const useAccordionSpring = (
  target: number,
  bounce: number,
  instant: boolean
) => {
  const [value, setValue] = useState(target);
  const current = useRef(target);
  const velocity = useRef(0);

  useEffect(() => {
    if (instant) {
      current.current = target;
      velocity.current = 0;
      setValue(target);
      return;
    }

    const stiffness = 0.08 + (bounce / 100) * 0.16;
    const decay = 0.62 + (bounce / 100) * 0.2;
    let frame = 0;
    let previous = 0;

    const tick = (time: number) => {
      const dt = previous ? clamp((time - previous) / 16.67, 0, 2.5) : 1;
      previous = time;

      velocity.current += (target - current.current) * stiffness * dt;
      velocity.current *= Math.pow(decay, dt);
      current.current += velocity.current * dt;

      if (
        Math.abs(target - current.current) < 0.02 &&
        Math.abs(velocity.current) < 0.02
      ) {
        current.current = target;
        velocity.current = 0;
        setValue(target);
        return;
      }

      setValue(current.current);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, bounce, instant]);

  return value;
};

interface AccordionCellProps {
  image: ImageAccordionImage;
  target: number;
  bounce: number;
  radius: number;
  active: boolean;
  instant: boolean;
  onActivate: () => void;
}

const AccordionCell = ({
  image,
  target,
  bounce,
  radius,
  active,
  instant,
  onActivate,
}: AccordionCellProps) => {
  const share = useAccordionSpring(target, bounce, instant);

  return (
    <S.Cell
      type="button"
      aria-label={image.alt}
      aria-expanded={active}
      data-open={active || undefined}
      style={{ flexGrow: Math.max(0, share), borderRadius: radius }}
      onPointerEnter={onActivate}
      onFocus={onActivate}
      onClick={onActivate}
    >
      <S.Image
        src={image.src}
        alt=""
        loader={cloudflareLoader}
        width={800}
        height={1200}
        sizes="(max-width: 700px) 100vw, 700px"
        draggable={false}
      />
    </S.Cell>
  );
};

/** Adapted from https://bencho.dev/blocks/image-accordion, without audio. */
const ImageAccordion = ({
  images,
  label = 'Image accordion',
  expandedWidth = 40,
  height = 300,
  reach = 35,
  bounce = 10,
  gap = 8,
}: ImageAccordionProps) => {
  const [active, setActive] = useState<number | null>(null);
  const reducedMotion = useReducedMotion();
  const spacing = clamp(gap, 0, 20);
  const radius = Math.min(12, spacing);
  const spread = 0.35 + (clamp(reach, 0, 100) / 100) * 0.9;
  const restingShare = 100 / Math.max(1, images.length);
  const expandedShare = clamp(expandedWidth, restingShare, 100);

  // Keep the hovered share exact while retaining the reference's neighbour falloff.
  const weights = images.map((_, index) =>
    active === null || index === active
      ? 0
      : 1 + 1.8 * Math.exp(-((Math.abs(index - active) / spread) ** 2))
  );
  const remainingWeight = weights.reduce((sum, weight) => sum + weight, 0);

  return (
    <S.Strip
      role="group"
      aria-label={label}
      style={{ height, gap: spacing, borderRadius: radius }}
      onPointerOut={(event: PointerEvent<HTMLDivElement>) => {
        const next = event.relatedTarget as Node | null;
        if (!next || !event.currentTarget.contains(next)) setActive(null);
      }}
      onPointerCancel={() => setActive(null)}
      onBlur={(event: FocusEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setActive(null);
      }}
    >
      {images.map((image, index) => (
        <AccordionCell
          key={image.src}
          image={image}
          active={active === index}
          target={
            active === null || expandedShare === restingShare
              ? restingShare
              : index === active
                ? expandedShare
                : ((100 - expandedShare) * weights[index]) / remainingWeight
          }
          bounce={clamp(bounce, 0, 100)}
          radius={radius}
          instant={reducedMotion === true}
          onActivate={() => setActive(index)}
        />
      ))}
    </S.Strip>
  );
};

export default ImageAccordion;
