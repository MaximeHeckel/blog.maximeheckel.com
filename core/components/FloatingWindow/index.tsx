import { Flex, IconButton, Text, Tooltip } from '@maximeheckel/design-system';
import { motion, useReducedMotion } from 'motion/react';
import { KeyboardEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { CustomGlassMaterial } from '../DialogGlass';
import { FloatingAnchor } from '../FloatingAnchor';
import type { WindowCorner } from '../FloatingAnchor/geometry';
import { useAnchorTransition } from '../FloatingAnchor/useAnchorTransition';
import * as S from './FloatingWindow.styles';

export type FloatingWindowState = 'closed' | 'open' | 'minimized';

interface FloatingWindowProps {
  state: FloatingWindowState;
  onStateChange: (state: FloatingWindowState) => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const FloatingWindow = ({
  state,
  onStateChange,
  title,
  children,
  footer,
}: FloatingWindowProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const [corner, setCorner] = useState<WindowCorner>('bottom-right');
  const resumeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  useAnchorTransition(state, windowRef, resumeRef);
  const reduceMotion = useReducedMotion();
  const open = state === 'open';
  const previousStateRef = useRef(state);
  const animateTransition =
    !reduceMotion &&
    ((state === 'minimized' && previousStateRef.current === 'open') ||
      (open && previousStateRef.current === 'minimized'));

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
      panelRef.current?.focus({ preventScroll: true });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [state]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      <S.Window
        ref={windowRef}
        data-corner={corner}
        style={{
          pointerEvents: open ? 'auto' : 'none',
          visibility: open ? 'visible' : 'hidden',
        }}
        aria-hidden={!open}
        inert={!open}
      >
        <CustomGlassMaterial style={{ '--opacity': 0.925, '--blur': '4px' }} />
        <S.Interior
          as={motion.div}
          initial={false}
          ref={panelRef}
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
          <S.Header>
            <Text size="2" weight="2">
              {title}
            </Text>
            <Flex gap="1">
              <Tooltip id="ask-tooltip" content={`Minimize ${title}`}>
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
              <Tooltip id="ask-tooltip" content={`Close ${title}`}>
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
          <S.Body>{children}</S.Body>
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
