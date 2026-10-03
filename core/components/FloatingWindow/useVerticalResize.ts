import {
  CSSProperties,
  KeyboardEvent,
  PointerEvent,
  RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';

export const useVerticalResize = (
  windowRef: RefObject<HTMLDivElement | null>,
  anchoredAtTop: boolean
) => {
  const [height, setHeight] = useState<number | null>(null);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [viewportOffsets, setViewportOffsets] = useState({ top: 0, bottom: 0 });
  const [inset, setInset] = useState(8);
  const drag = useRef<{ pointerId: number; y: number; height: number } | null>(
    null
  );
  const maxHeight = Math.max(0, viewportHeight - 2 * inset);
  const minHeight = Math.min(420, maxHeight);
  const currentHeight = Math.min(
    maxHeight,
    Math.max(minHeight, height ?? viewportHeight / 2)
  );
  const clamp = (value: number) =>
    Math.min(maxHeight, Math.max(minHeight, value));

  useEffect(() => {
    const update = () => {
      const visualViewport = window.visualViewport;
      const viewport = visualViewport?.height ?? window.innerHeight;
      const top = visualViewport?.offsetTop ?? 0;

      setViewportOffsets({
        top,
        bottom: Math.max(0, window.innerHeight - viewport - top),
      });
      const style = windowRef.current
        ? getComputedStyle(windowRef.current)
        : null;
      // Read the resolved corner inset, including safe areas, from the same CSS as the window.
      const nextInset =
        Number.parseFloat(style?.right ?? '') ||
        Number.parseFloat(style?.left ?? '') ||
        8;
      setInset(nextInset);
      setViewportHeight(viewport);
      // Keep the chosen height so dismissing the keyboard restores the window.
      // Rendering and drag bounds clamp it to the currently visible viewport.
    };
    update();
    const visualViewport = window.visualViewport;

    window.addEventListener('resize', update);
    visualViewport?.addEventListener('resize', update);
    visualViewport?.addEventListener('scroll', update);

    return () => {
      window.removeEventListener('resize', update);
      visualViewport?.removeEventListener('resize', update);
      visualViewport?.removeEventListener('scroll', update);
    };
  }, [windowRef]);

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointerId !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return {
    height: height === null ? null : currentHeight,
    viewportStyle: {
      '--visible-viewport-height': viewportHeight
        ? `${viewportHeight}px`
        : undefined,
      '--viewport-offset-top': `${viewportOffsets.top}px`,
      '--viewport-offset-bottom': `${viewportOffsets.bottom}px`,
    } as CSSProperties,
    handleProps: {
      role: 'separator',
      tabIndex: 0,
      'aria-orientation': 'horizontal' as const,
      'aria-valuemin': Math.round(minHeight),
      'aria-valuemax': Math.round(maxHeight),
      'aria-valuenow': Math.round(currentHeight),
      onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = {
          pointerId: event.pointerId,
          y: event.clientY,
          height:
            windowRef.current?.getBoundingClientRect().height || currentHeight,
        };
      },
      onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
        if (!drag.current || drag.current.pointerId !== event.pointerId) return;
        const delta =
          (event.clientY - drag.current.y) * (anchoredAtTop ? 1 : -1);
        setHeight(clamp(drag.current.height + delta));
      },
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onLostPointerCapture: () => {
        drag.current = null;
      },
      onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
        if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key))
          return;
        event.preventDefault();
        const delta =
          (event.key === 'ArrowUp' ? -32 : 32) * (anchoredAtTop ? 1 : -1);
        setHeight(
          event.key === 'Home'
            ? minHeight
            : event.key === 'End'
              ? maxHeight
              : clamp(currentHeight + delta)
        );
      },
    },
  };
};
