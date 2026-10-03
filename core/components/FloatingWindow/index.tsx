import {
  Flex,
  Icon,
  IconButton,
  Text,
  Tooltip,
} from '@maximeheckel/design-system';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  CSSProperties,
  KeyboardEvent,
  useId,
  ReactNode,
  RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { FloatingAnchor } from '../FloatingAnchor';
import type { WindowCorner } from '../FloatingAnchor/geometry';
import { useAnchorTransition } from '../FloatingAnchor/useAnchorTransition';
import * as S from './FloatingWindow.styles';
import { useVerticalResize } from './useVerticalResize';

export type FloatingWindowState = 'closed' | 'open' | 'minimized';

interface FloatingWindowProps {
  state: FloatingWindowState;
  onStateChange: (state: FloatingWindowState) => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  headerActions?: ReactNode;
  showScrollToLatest?: boolean;
  scrollToBottomRequest?: string;
  scrollBoundaryRef?: RefObject<HTMLElement | null>;
  bottomOverlayHeight?: string;
  initialFocusRef?: RefObject<HTMLElement | null>;
}

export const FloatingWindow = ({
  state,
  onStateChange,
  title,
  children,
  footer,
  headerActions,
  showScrollToLatest = false,
  scrollToBottomRequest,
  scrollBoundaryRef,
  bottomOverlayHeight = '0px',
  initialFocusRef,
}: FloatingWindowProps) => {
  const bodyRef = useRef<HTMLDivElement>(null);
  const bodyContentRef = useRef<HTMLDivElement>(null);
  const [hasContentBelow, setHasContentBelow] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const [corner, setCorner] = useState<WindowCorner>('bottom-right');
  const windowId = useId();
  const anchoredAtTop = corner.startsWith('top');
  const { height, viewportStyle, handleProps } = useVerticalResize(
    windowRef,
    anchoredAtTop
  );
  const resumeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  useAnchorTransition(state, windowRef, resumeRef);
  const reduceMotion = useReducedMotion();
  const open = state === 'open';
  const previousStateRef = useRef<FloatingWindowState>('closed');
  const animateTransition =
    !reduceMotion &&
    ((state === 'minimized' && previousStateRef.current === 'open') ||
      (open && previousStateRef.current !== 'open'));

  useEffect(() => {
    previousStateRef.current = state;
    if (state === 'minimized') {
      resumeRef.current?.focus({ preventScroll: true });
      return;
    }
    if (state === 'closed') {
      triggerRef.current?.focus({ preventScroll: true });
      return;
    }
    const active = document.activeElement;
    if (
      active instanceof HTMLElement &&
      !panelRef.current?.contains(active) &&
      active !== resumeRef.current
    ) {
      triggerRef.current = active;
    }
    // Allow the command menu to finish restoring focus first.
    const timer = window.setTimeout(() => {
      (initialFocusRef?.current ?? panelRef.current)?.focus({
        preventScroll: true,
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [state, initialFocusRef]);

  useEffect(() => {
    const body = bodyRef.current;
    const content = bodyContentRef.current;
    if (!open || !showScrollToLatest || !body || !content) {
      setHasContentBelow(false);
      return;
    }

    const update = () => {
      setHasContentBelow(
        body.scrollHeight - body.clientHeight - body.scrollTop > 8
      );
    };
    update();
    body.addEventListener('scroll', update, { passive: true });
    // Streaming Markdown and composer resizing can change overflow without a scroll event.
    const observer =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(update);
    observer?.observe(body);
    observer?.observe(content);
    return () => {
      body.removeEventListener('scroll', update);
      observer?.disconnect();
    };
  }, [open, showScrollToLatest]);

  useEffect(() => {
    const body = bodyRef.current;
    const content = bodyContentRef.current;
    if (!open || !scrollToBottomRequest || !body || !content) return;
    if (!scrollBoundaryRef) {
      body.scrollTo?.({
        top: body.scrollHeight,
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
      return;
    }

    let following = true;
    let previousTop = body.scrollTop;
    const follow = () => {
      const boundary = scrollBoundaryRef.current;
      if (!following || !boundary) return;
      const limit = Math.max(
        0,
        body.scrollTop +
          boundary.getBoundingClientRect().bottom -
          body.getBoundingClientRect().top
      );
      const bottom = Math.max(0, body.scrollHeight - body.clientHeight);
      // Stop once the latest question leaves the viewport instead of chasing a long answer.
      body.scrollTop = Math.min(bottom, limit);
      previousTop = body.scrollTop;
      if (bottom >= limit) following = false;
    };
    const onScroll = () => {
      if (body.scrollTop < previousTop) following = false;
      previousTop = body.scrollTop;
    };
    const onWheel = (event: WheelEvent) => {
      if (event.deltaY < 0) following = false;
    };
    follow();
    const observer =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(follow);
    observer?.observe(body);
    observer?.observe(content);
    body.addEventListener('scroll', onScroll, { passive: true });
    body.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      observer?.disconnect();
      body.removeEventListener('scroll', onScroll);
      body.removeEventListener('wheel', onWheel);
    };
  }, [open, scrollToBottomRequest, scrollBoundaryRef, reduceMotion]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      <S.Window
        ref={windowRef}
        data-corner={corner}
        style={
          {
            ...viewportStyle,
            '--resized-window-height':
              height === null ? undefined : `${height}px`,
            pointerEvents: open ? 'auto' : 'none',
            visibility: open ? 'visible' : 'hidden',
            display: open ? undefined : 'none',
          } as CSSProperties
        }
        aria-hidden={!open}
        inert={!open}
      >
        <S.Interior
          as={motion.div}
          initial={reduceMotion ? false : { opacity: 0 }}
          ref={panelRef}
          id={windowId}
          role="dialog"
          aria-label={title}
          aria-modal={false}
          aria-hidden={!open}
          inert={!open}
          tabIndex={-1}
          animate={{ opacity: open ? 1 : 0 }}
          transition={{ duration: animateTransition ? 0.12 : 0 }}
          style={{ pointerEvents: open ? 'auto' : 'none' }}
          onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
            if (event.key === 'Escape' && !event.defaultPrevented) {
              event.stopPropagation();
              onStateChange('minimized');
            }
          }}
        >
          <S.ResizeHandle
            {...handleProps}
            aria-label={`Resize ${title} height`}
            aria-controls={windowId}
            data-edge={anchoredAtTop ? 'bottom' : 'top'}
          />
          <S.Header>
            <Text size="2" weight="2">
              {title}
            </Text>
            <Flex gap="1">
              {headerActions}
              <Tooltip
                id={`${windowId}-minimize`}
                content={`Minimize ${title}`}
              >
                <IconButton
                  aria-label={`Minimize ${title}`}
                  variant="tertiary"
                  size="small"
                  rounded
                  onClick={() => onStateChange('minimized')}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 8h10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </IconButton>
              </Tooltip>
              <Tooltip id={`${windowId}-close`} content={`Close ${title}`}>
                <IconButton
                  aria-label={`Close ${title}`}
                  variant="tertiary"
                  size="small"
                  rounded
                  onClick={() => onStateChange('closed')}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="m4 4 8 8M12 4l-8 8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </IconButton>
              </Tooltip>
            </Flex>
          </S.Header>
          <S.BodyViewport>
            <S.Body ref={bodyRef} data-testid="floating-window-scroll-area">
              <div
                ref={bodyContentRef}
                style={{
                  minHeight: '100%',
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr)',
                }}
              >
                {children}
              </div>
            </S.Body>
            <S.LatestOverlay
              style={{
                bottom: `calc(${bottomOverlayHeight} + var(--space-3))`,
              }}
            >
              <AnimatePresence initial={false}>
                {open && showScrollToLatest && hasContentBelow ? (
                  <S.LatestButton
                    as={motion.button}
                    key="latest"
                    type="button"
                    aria-label="Scroll to latest"
                    initial={{ opacity: 0, y: reduceMotion ? 0 : 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: reduceMotion ? 0 : 4 }}
                    transition={{ duration: reduceMotion ? 0 : 0.15 }}
                    onClick={() => {
                      const body = bodyRef.current;
                      if (!body) return;
                      body.scrollTo({
                        top: body.scrollHeight,
                        behavior: reduceMotion ? 'auto' : 'smooth',
                      });
                      // Keep keyboard focus in the panel when the pill disappears.
                      (initialFocusRef?.current ?? panelRef.current)?.focus({
                        preventScroll: true,
                      });
                    }}
                  >
                    <Icon.Arrow
                      size="3"
                      style={{
                        color: 'var(--text-secondary)',
                        transform: 'translateY(-1px) rotate(90deg)',
                      }}
                    />
                  </S.LatestButton>
                ) : null}
              </AnimatePresence>
            </S.LatestOverlay>
          </S.BodyViewport>
          {footer ? <S.Footer>{footer}</S.Footer> : null}
        </S.Interior>
      </S.Window>
      <FloatingAnchor
        active={state === 'minimized'}
        buttonRef={resumeRef}
        label={`Resume ${title}`}
        onOpen={() => onStateChange('open')}
        onCornerChange={setCorner}
      />
    </>,
    document.body
  );
};
