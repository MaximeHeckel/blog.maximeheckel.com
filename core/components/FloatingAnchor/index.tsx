import { Icon, styled } from '@maximeheckel/design-system';
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react';
import {
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  Ref,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ATTACH_DISTANCE,
  CAPSULE_PATH,
  HEIGHT,
  WIDTH,
  Point,
  Viewport,
  WindowCorner,
  clampPoint,
  anchorShape,
  cornerForPoint,
  dragPoint,
  settlePoint,
} from './geometry';

const Button = styled(motion.button, {
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 101,
  width: WIDTH,
  height: HEIGHT,
  padding: 0,
  display: 'grid',
  placeItems: 'center',
  border: 'none',
  borderRadius: HEIGHT / 2,
  background: 'transparent',
  color: 'var(--text-primary)',
  cursor: 'grab',
  touchAction: 'none',
  userSelect: 'none',
  '&:active': { cursor: 'grabbing' },
  '&:focus-visible': { outline: 'none' },
});

interface FloatingAnchorProps {
  active: boolean;
  label: string;
  buttonRef: Ref<HTMLButtonElement>;
  onOpen: () => void;
  onCornerChange: (corner: WindowCorner) => void;
}

export const FloatingAnchor = ({
  active,
  label,
  buttonRef,
  onOpen,
  onCornerChange,
}: FloatingAnchorProps) => {
  const reduceMotion = useReducedMotion();
  const [viewport, setViewport] = useState<Viewport>(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  const initialPosition = settlePoint(
    { x: viewport.width - WIDTH - 16, y: viewport.height - HEIGHT - 96 },
    viewport
  );
  const x = useMotionValue(initialPosition.x);
  const y = useMotionValue(initialPosition.y);
  const drag = useRef<{
    id: number;
    start: Point;
    origin: Point;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);
  const animation = useRef<(() => void) | null>(null);
  const attachmentOpacity = useTransform(
    [x, y],
    ([px, py]) =>
      anchorShape({ x: Number(px), y: Number(py) }, viewport).attachmentOpacity
  );
  const capsuleOpacity = useTransform(attachmentOpacity, (value) => 1 - value);
  const path = useTransform(
    [x, y],
    ([px, py]) => anchorShape({ x: Number(px), y: Number(py) }, viewport).path
  );
  const iconX = useTransform(
    [x, y],
    ([px, py]) => anchorShape({ x: Number(px), y: Number(py) }, viewport).iconX
  );

  useEffect(() => {
    const resize = () => {
      animation.current?.();
      const next = { width: window.innerWidth, height: window.innerHeight };
      const point = clampPoint({ x: x.get(), y: y.get() }, next);
      x.set(point.x);
      y.set(point.y);
      setViewport(next);
      onCornerChange(cornerForPoint(point, next));
    };
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      animation.current?.();
    };
  }, [x, y, onCornerChange]);

  const settle = (point: Point) => {
    const target = settlePoint(point, viewport);
    onCornerChange(cornerForPoint(target, viewport));
    animation.current?.();
    const options = reduceMotion
      ? { duration: 0 }
      : { type: 'spring' as const, stiffness: 650, damping: 32, mass: 0.6 };
    const ax = animate(x, target.x, options);
    const ay = animate(y, target.y, options);
    animation.current = () => {
      ax.stop();
      ay.stop();
    };
  };

  return (
    <Button
      ref={buttonRef}
      type="button"
      aria-label={label}
      aria-description="Drag to reposition, or use arrow keys. Enter opens the window."
      aria-hidden={!active}
      inert={!active}
      tabIndex={active ? 0 : -1}
      style={{
        x,
        y,
        visibility: active ? 'visible' : 'hidden',
        pointerEvents: active ? 'auto' : 'none',
      }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 650, damping: 42, mass: 0.7 }
      }
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
        if (event.button !== 0 || drag.current) return;
        animation.current?.();
        suppressClick.current = false;
        drag.current = {
          id: event.pointerId,
          start: { x: event.clientX, y: event.clientY },
          origin: { x: x.get(), y: y.get() },
          moved: false,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event: PointerEvent<HTMLButtonElement>) => {
        const current = drag.current;
        if (!current || current.id !== event.pointerId) return;
        const dx = event.clientX - current.start.x;
        const dy = event.clientY - current.start.y;
        if (!current.moved && Math.hypot(dx, dy) < 6) return;
        current.moved = true;
        const point = dragPoint(
          { x: current.origin.x + dx, y: current.origin.y + dy },
          viewport
        );
        x.set(point.x);
        y.set(point.y);
      }}
      onPointerUp={(event: PointerEvent<HTMLButtonElement>) => {
        const current = drag.current;
        if (!current || current.id !== event.pointerId) return;
        suppressClick.current = current.moved;
        if (current.moved) settle({ x: x.get(), y: y.get() });
        drag.current = null;
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onLostPointerCapture={(event: PointerEvent<HTMLButtonElement>) => {
        if (drag.current?.id !== event.pointerId) return;
        suppressClick.current = true;
        drag.current = null;
        settle({ x: x.get(), y: y.get() });
      }}
      onPointerCancel={(event: PointerEvent<HTMLButtonElement>) => {
        if (drag.current?.id !== event.pointerId) return;
        suppressClick.current = true;
        drag.current = null;
        settle({ x: x.get(), y: y.get() });
      }}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        if (event.detail !== 0 && suppressClick.current) {
          suppressClick.current = false;
          return;
        }
        onOpen();
      }}
      onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
        const directions: Record<string, Point> = {
          ArrowLeft: { x: -1, y: 0 },
          ArrowRight: { x: 1, y: 0 },
          ArrowUp: { x: 0, y: -1 },
          ArrowDown: { x: 0, y: 1 },
        };
        const direction = directions[event.key];
        if (!direction) return;
        event.preventDefault();
        const step = event.shiftKey ? 96 : ATTACH_DISTANCE + 8;
        settle({
          x: x.get() + direction.x * step,
          y: y.get() + direction.y * step,
        });
      }}
    >
      <svg
        aria-hidden="true"
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'visible',
          pointerEvents: 'none',
          isolation: 'isolate',
          filter: 'drop-shadow(0 3px 8px oklch(0% 0 0 / 20%))',
        }}
      >
        <motion.path
          d={CAPSULE_PATH}
          opacity={capsuleOpacity}
          style={{ mixBlendMode: 'plus-lighter' }}
          fill="oklch(from var(--gray-300) calc(l + 0.035) c h)"
        />
        <motion.path
          d={path}
          opacity={attachmentOpacity}
          style={{ mixBlendMode: 'plus-lighter' }}
          fill="oklch(from var(--gray-300) calc(l + 0.035) c h)"
        />
      </svg>
      <motion.span style={{ x: iconX, display: 'flex', pointerEvents: 'none' }}>
        <Icon.Arrow
          variant="primary"
          style={{
            position: 'relative',
            transform: 'rotate(-45deg)',
            pointerEvents: 'none',
          }}
        />
      </motion.span>
    </Button>
  );
};
