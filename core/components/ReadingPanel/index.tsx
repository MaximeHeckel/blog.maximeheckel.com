import { KeyboardEvent, ReactNode, useEffect, useRef } from 'react';

import * as S from './ReadingPanel.styles';

export type ReadingPanelState = 'closed' | 'open' | 'minimized';

interface ReadingPanelProps {
  state: ReadingPanelState;
  onStateChange: (state: ReadingPanelState) => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** A nonmodal reading companion. Its contents stay mounted when hidden. */
export const ReadingPanel = ({
  state,
  onStateChange,
  title,
  children,
  footer,
}: ReadingPanelProps) => {
  const panelRef = useRef<HTMLElement>(null);
  const resumeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (state !== 'open') return;
    // Let the command menu restore its focus before focusing the panel.
    const timer = window.setTimeout(() => {
      panelRef.current?.focus({ preventScroll: true });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [state]);

  useEffect(() => {
    if (state === 'minimized')
      resumeRef.current?.focus({ preventScroll: true });
  }, [state]);

  return (
    <>
      <S.Panel
        ref={panelRef}
        data-open={state === 'open'}
        aria-hidden={state !== 'open'}
        inert={state !== 'open'}
        tabIndex={-1}
        aria-label={title}
        onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
          if (event.key === 'Escape' && !event.defaultPrevented) {
            event.stopPropagation();
            onStateChange('minimized');
          }
        }}
      >
        <S.Body>{children}</S.Body>
        {footer ? <S.Footer>{footer}</S.Footer> : null}
      </S.Panel>
      {state === 'minimized' ? (
        <S.Resume
          ref={resumeRef}
          variant="secondary"
          onClick={() => onStateChange('open')}
          aria-label={`Resume ${title}`}
        >
          {title} ↗
        </S.Resume>
      ) : null}
    </>
  );
};
