import { animate, useMotionValue } from 'motion/react';
import { PointerEvent, useCallback, useEffect, useRef, useState } from 'react';

interface SlideshowDragOptions {
  active: number;
  count: number;
  orientation: 'horizontal' | 'vertical';
  loop: boolean;
  reducedMotion: boolean;
  onDragStart: () => void;
  onNavigate: (index: number) => void;
}

interface DragSession {
  pointerId: number;
  pointerType: string;
  element: HTMLDivElement;
  startX: number;
  startY: number;
  active: number;
  count: number;
  orientation: 'horizontal' | 'vertical';
  size: number;
  initialOffset: number;
  phase: 'pending' | 'dragging' | 'settling';
  target?: number;
  settleOffset?: number;
  samples: { distance: number; time: number }[];
}

const releaseCapture = (drag: DragSession) => {
  if (drag.element.hasPointerCapture?.(drag.pointerId)) {
    drag.element.releasePointerCapture(drag.pointerId);
  }
};

export const useSlideshowDrag = ({
  active,
  count,
  orientation,
  loop,
  reducedMotion,
  onDragStart,
  onNavigate,
}: SlideshowDragOptions) => {
  const offset = useMotionValue(0);
  const session = useRef<DragSession | null>(null);
  const latestActive = useRef(active);

  latestActive.current = active;

  const animation = useRef<ReturnType<typeof animate> | null>(null);
  const [preview, setPreview] = useState<{
    index: number;
    radius: number;
  } | null>(null);
  const [grabbing, setGrabbing] = useState(false);

  const reset = useCallback(() => {
    const drag = session.current;

    session.current = null;
    animation.current?.stop();
    animation.current = null;

    if (drag) releaseCapture(drag);

    // Keep the settled image in place until React removes the preview.
    setPreview(null);
    setGrabbing(false);
  }, []);

  useEffect(() => {
    const drag = session.current;

    if (
      drag &&
      (drag.count !== count ||
        drag.orientation !== orientation ||
        (drag.active !== active && drag.target !== active))
    ) {
      reset();
    }
  }, [active, count, orientation, reset]);

  useEffect(() => {
    window.addEventListener('resize', reset);

    return () => {
      window.removeEventListener('resize', reset);
      animation.current?.stop();

      const drag = session.current;
      session.current = null;

      if (drag) releaseCapture(drag);
    };
  }, [reset]);

  const settle = (drag: DragSession, targetOffset: number, velocity = 0) => {
    drag.settleOffset = targetOffset;

    const shouldReduceMotion =
      reducedMotion ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
    const remaining = targetOffset - offset.get();

    // Carry the release momentum into the spring without overshooting the image.
    const releaseVelocity =
      Math.sign(remaining) === Math.sign(velocity)
        ? Math.sign(velocity) *
          Math.min(Math.abs(velocity), Math.abs(remaining) * 20, 2000)
        : 0;

    animation.current = animate(
      offset,
      targetOffset,
      shouldReduceMotion
        ? { duration: 0 }
        : {
            type: 'spring',
            stiffness: 400,
            damping: 40,
            velocity: releaseVelocity,
            restDelta: 0.5,
            restSpeed: 10,
          }
    );

    animation.current.then(() => {
      if (session.current !== drag) return;

      // A controlled owner can decline a selection; return to its current image.
      if (drag.target !== undefined && latestActive.current !== drag.target) {
        drag.target = undefined;
        settle(drag, 0);
      } else {
        reset();
      }
    });
  };

  const move = (event: PointerEvent<HTMLDivElement>) => {
    const drag = session.current;

    if (
      !drag ||
      drag.pointerId !== event.pointerId ||
      drag.phase === 'settling'
    )
      return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    const distance = orientation === 'horizontal' ? dx : dy;
    const crossDistance = orientation === 'horizontal' ? dy : dx;

    if (drag.phase === 'pending') {
      if (Math.max(Math.abs(distance), Math.abs(crossDistance)) < 6) return;

      if (
        drag.pointerType !== 'mouse' &&
        Math.abs(crossDistance) > Math.abs(distance)
      ) {
        reset();

        return;
      }

      if (Math.abs(distance) < 6) return;

      drag.phase = 'dragging';
      onDragStart();
      setPreview({
        index: drag.active,
        radius: Math.ceil(Math.abs(drag.initialOffset) / drag.size) + 1,
      });
    }

    const atEdge =
      !loop &&
      ((drag.active === 0 && distance > 0) ||
        (drag.active === count - 1 && distance < 0));
    const resisted = atEdge ? distance * 0.2 : distance;
    const position =
      drag.initialOffset + Math.max(-drag.size, Math.min(drag.size, resisted));

    const now = performance.now();
    const latest = drag.samples.at(-1);

    // Ignore stationary events and tiny release jitter when measuring a flick.
    if (!latest || Math.abs(position - latest.distance) >= 3) {
      drag.samples = drag.samples.slice(-1);
      drag.samples.push({ distance: position, time: now });
    }

    offset.set(position);
  };

  const finish = (event: PointerEvent<HTMLDivElement>, cancelled = false) => {
    // Fast flicks can release before the browser delivers the final move event.
    if (!cancelled) move(event);

    const drag = session.current;

    if (
      !drag ||
      drag.pointerId !== event.pointerId ||
      drag.phase === 'settling'
    ) {
      return;
    }

    if (drag.phase === 'pending') {
      if (preview !== null) {
        drag.phase = 'settling';
        setGrabbing(false);
        releaseCapture(drag);
        settle(drag, 0);
      } else {
        reset();
      }

      return;
    }

    drag.phase = 'settling';
    setGrabbing(false);
    releaseCapture(drag);

    const distance = offset.get() - drag.initialOffset;

    const now = performance.now();
    const previous = drag.samples.at(-2);
    const latest = drag.samples.at(-1);
    const elapsed = latest && previous ? latest.time - previous.time : 0;
    const velocity =
      latest && previous && elapsed > 0 && now - latest.time < 100
        ? ((latest.distance - previous.distance) * 1000) / elapsed
        : 0;

    const flick =
      Math.abs(distance) >= 6 &&
      Math.sign(velocity) === Math.sign(distance) &&
      Math.abs(velocity) >= 300;

    const direction = distance < 0 ? 1 : -1;
    const next = drag.active + direction;
    const canNavigate = loop || (next >= 0 && next < count);
    const intentional = Math.abs(distance) >= 10 || flick;

    if (!cancelled && canNavigate && intentional) {
      drag.target = (next + count) % count;
      onNavigate(drag.target);
      settle(drag, -direction * drag.size, velocity);
    } else {
      settle(drag, 0);
    }
  };

  return {
    offset,
    preview,
    grabbing,
    handlers: {
      onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
        if (event.isPrimary === false) {
          reset();

          return;
        }

        if (count < 2 || event.button !== 0) return;

        const interrupted = session.current;

        if (interrupted && interrupted.phase !== 'settling') return;

        const element = event.currentTarget;
        const size =
          orientation === 'horizontal'
            ? element.clientWidth
            : element.clientHeight;

        if (!size) return;

        if (event.pointerType === 'mouse') event.preventDefault();

        let initialOffset = 0;

        if (interrupted) {
          let visualOffset = offset.get();
          const track = element.querySelector<HTMLElement>(
            '[data-drag-preview]'
          );

          if (track && element.offsetWidth && element.offsetHeight) {
            const frame = element.getBoundingClientRect();
            const bounds = track.getBoundingClientRect();
            const horizontal = orientation === 'horizontal';
            const scale = horizontal
              ? frame.width / element.offsetWidth
              : frame.height / element.offsetHeight;

            visualOffset = horizontal
              ? (bounds.left - frame.left) / scale - element.clientLeft
              : (bounds.top - frame.top) / scale - element.clientTop;
          }

          animation.current?.stop();
          animation.current = null;

          // Rebase the still-visible image around the accepted selection without jumping.
          initialOffset =
            visualOffset -
            (interrupted.target === active
              ? (interrupted.settleOffset ?? 0)
              : 0);

          setPreview({
            index: active,
            radius: Math.ceil(Math.abs(initialOffset) / size) + 1,
          });
        }

        offset.set(initialOffset);

        session.current = {
          pointerId: event.pointerId,
          pointerType: event.pointerType,
          element,
          startX: event.clientX,
          startY: event.clientY,
          active,
          count,
          orientation,
          size,
          initialOffset,
          phase: 'pending',
          samples: [{ distance: initialOffset, time: performance.now() }],
        };

        element.setPointerCapture?.(event.pointerId);
        setGrabbing(true);
      },
      onPointerMove: move,
      onPointerUp: (event: PointerEvent<HTMLDivElement>) => finish(event),
      onPointerCancel: (event: PointerEvent<HTMLDivElement>) =>
        finish(event, true),
      onLostPointerCapture: (event: PointerEvent<HTMLDivElement>) =>
        finish(event, true),
    },
  };
};
