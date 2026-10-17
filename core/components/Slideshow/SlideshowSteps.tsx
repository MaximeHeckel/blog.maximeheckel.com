import { GlassMaterial } from '@maximeheckel/design-system';
import { KeyboardEvent, useEffect, useId, useRef } from 'react';

import * as S from './Slideshow.styles';

export interface SlideshowStepsProps {
  count: number;
  active: number;
  onStepClick: (index: number) => void;
  orientation?: 'horizontal' | 'vertical';
  maxVisible?: number;
  autoPlay?: boolean;
  filling?: boolean;
  playing?: boolean;
  fillDuration?: number;
  /** The enclosing slideshow can own keyboard focus instead. */
  focusable?: boolean;
  /** Shared with the slideshow to associate tabs and panels. */
  id?: string;
}

export const SlideshowSteps = ({
  count,
  active,
  onStepClick,
  orientation = 'horizontal',
  maxVisible = 5,
  autoPlay = false,
  filling = false,
  playing = false,
  fillDuration = 5000,
  focusable = true,
  id,
}: SlideshowStepsProps) => {
  const generatedId = useId();
  const baseId = id ?? generatedId;

  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const focusRequested = useRef(false);

  useEffect(() => {
    if (orientation !== 'vertical') return;

    const tab = tabs.current[active];
    const container = tab?.parentElement;

    if (!tab || !container) return;

    if (tab.offsetTop < container.scrollTop) {
      container.scrollTop = tab.offsetTop;
    } else if (
      tab.offsetTop + tab.offsetHeight >
      container.scrollTop + container.clientHeight
    ) {
      container.scrollTop =
        tab.offsetTop + tab.offsetHeight - container.clientHeight;
    }
  }, [active, orientation]);

  useEffect(() => {
    if (!focusRequested.current) return;

    tabs.current[active]?.focus();
    focusRequested.current = false;
  }, [active]);

  const visible = Math.max(1, Math.floor(maxVisible));
  const start = Math.max(
    0,
    Math.min(active - Math.floor(visible / 2), count - visible)
  );
  const end = Math.min(count, start + visible);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!focusable) return;

    const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
    const previousKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';

    let index = active;

    if (event.key === nextKey) index = (active + 1) % count;
    else if (event.key === previousKey) index = (active - 1 + count) % count;
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = count - 1;
    else return;

    event.preventDefault();
    focusRequested.current = true;
    onStepClick(index);
  };

  if (count < 1) return null;

  return (
    <S.Steps
      role="tablist"
      aria-label="Slide Show steps"
      aria-orientation={orientation}
      data-orientation={orientation}
    >
      <GlassMaterial border={false} />
      {Array.from({ length: count }, (_, index) => (
        <S.Step
          key={index}
          ref={(element: HTMLButtonElement | null) => {
            tabs.current[index] = element;
          }}
          type="button"
          role="tab"
          id={`${baseId}-tab-${index}`}
          aria-controls={id ? `${baseId}-panel-${index}` : undefined}
          aria-label={`Step ${index + 1}`}
          aria-selected={index === active}
          tabIndex={focusable && index === active ? 0 : -1}
          data-orientation={orientation}
          // Keep every tab mounted so keyboard navigation can focus across the window.
          style={{
            display: index < start || index >= end ? 'none' : undefined,
          }}
          onClick={() => onStepClick(index)}
          onKeyDown={handleKeyDown}
        >
          <S.Dot
            aria-hidden="true"
            data-active={index === active}
            data-edge={
              index !== active &&
              ((index === start && start > 0) ||
                (index === end - 1 && end < count))
            }
            data-filling={filling && index === active}
            data-progress={autoPlay || filling}
            data-orientation={orientation}
          >
            {filling && index === active ? (
              <S.Fill
                data-orientation={orientation}
                style={{
                  animationDuration: `${fillDuration}ms`,
                  animationPlayState: playing ? 'running' : 'paused',
                }}
              />
            ) : null}
          </S.Dot>
        </S.Step>
      ))}
    </S.Steps>
  );
};
