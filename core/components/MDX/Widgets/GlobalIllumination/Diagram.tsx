import { Card, Icon, IconButton, styled } from '@maximeheckel/design-system';
import { animate, useInView, useReducedMotion } from 'motion/react';
import {
  KeyboardEvent,
  ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { Viewport } from './geometry';

export interface DiagramStep<State> {
  title: string;
  description: string;
  state: State;
}

interface DiagramProps<State extends Record<string, number>> {
  label: string;
  className?: string;
  steps: readonly [DiagramStep<State>, ...DiagramStep<State>[]];
  children: (state: State, viewport: Viewport) => ReactNode;
}

const Root = styled(Card, {
  width: '100%',
  minWidth: 0,
  borderRadius: 24,
  '--card-bg': 'oklch(from var(--card-background) 0.17 c h / 100%)',
  '--border': '1px solid oklch(from var(--border-color) l c h / 40%)',
  '--gi-edge':
    'color-mix(in oklch, var(--text-primary) 60%, var(--background))',
});

const Stage = styled('div', {
  width: '100%',
  height: 490,
  overflow: 'visible',
  '& > svg': {
    display: 'block',
    width: '100%',
    height: '100%',
    overflow: 'visible',
  },
  '& text': { fontFamily: 'inherit', fontSize: 12, fontWeight: 400 },
  '@media (max-width: 540px)': { height: 410 },
});

const Controls = styled('div', {
  position: 'relative',
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: 'var(--space-3)',
  padding: 'var(--space-3) var(--space-4)',
  '& span': {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--font-size-1)',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-1px',
    color: 'var(--text-tertiary)',
  },
});

const Status = styled('span', {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
});

/** Shared step controls and animation; scene geometry remains in the caller. */
export function Diagram<State extends Record<string, number>>({
  label,
  className,
  steps,
  children,
}: DiagramProps<State>) {
  const id = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const previousRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const focusAfterNavigation = useRef<'previous' | 'next' | null>(null);
  const inView = useInView(stageRef);
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [viewport, setViewport] = useState<Viewport>({
    width: 736,
    height: 490,
  });
  const [state, setState] = useState(steps[0].state);
  const currentState = useRef(state);
  const selectedStep = steps[step];

  useEffect(() => {
    // Wait for the destination button to become enabled, including Home/End jumps.
    const destination = focusAfterNavigation.current;
    const button = destination === 'previous' ? previousRef : nextRef;
    if (destination) button.current?.focus({ preventScroll: true });
    focusAfterNavigation.current = null;
  }, [step]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const resize = () => {
      if (stage.clientWidth > 0 && stage.clientHeight > 0) {
        setViewport({ width: stage.clientWidth, height: stage.clientHeight });
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const target = selectedStep.state;
    const update = (value: State) => {
      currentState.current = value;
      setState(value);
    };

    // No animation on mount, offscreen, or when reduced motion is requested.
    if (reducedMotion || !inView || currentState.current === target) {
      update(target);
      return;
    }

    const from = currentState.current;
    const animation = animate(0, 1, {
      duration: 0.95,
      ease: (progress) =>
        progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2,
      onUpdate: (progress) => {
        const next = { ...target };
        for (const key in target) {
          next[key] = (from[key] +
            (target[key] - from[key]) * progress) as State[typeof key];
        }
        update(next);
      },
      onComplete: () => update(target),
    });

    // Stop before starting a new transition; reversals continue from the current pose.
    return () => animation.stop();
  }, [selectedStep, inView, reducedMotion]);

  const navigate = (index: number) => {
    const next = Math.max(0, Math.min(steps.length - 1, index));
    if (next === step) return;

    // Preserve keyboard navigation when the focused button becomes disabled.
    if (
      next === steps.length - 1 &&
      document.activeElement === nextRef.current
    ) {
      focusAfterNavigation.current = 'previous';
    } else if (next === 0 && document.activeElement === previousRef.current) {
      focusAfterNavigation.current = 'next';
    }
    setStep(next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const destinations: Record<string, number> = {
      ArrowLeft: step - 1,
      ArrowRight: step + 1,
      Home: 0,
      End: steps.length - 1,
    };
    const destination = destinations[event.key];
    if (destination === undefined) return;

    event.preventDefault();
    navigate(destination);
  };

  return (
    <Root className={className} depth={1} onKeyDown={onKeyDown}>
      <Stage ref={stageRef}>
        <svg
          role="img"
          aria-label={label}
          aria-describedby={`${id}-description`}
          viewBox={`0 0 ${viewport.width} ${viewport.height}`}
        >
          <desc id={`${id}-description`}>
            {selectedStep.title}. {selectedStep.description}
          </desc>
          {children(state, viewport)}
        </svg>
      </Stage>
      <Status role="status" aria-live="polite" aria-atomic="true">
        Step {step + 1} of {steps.length}: {selectedStep.title}.{' '}
        {selectedStep.description}
      </Status>
      <Controls role="group" aria-label={`${label} steps`}>
        <IconButton
          rounded
          size="small"
          type="button"
          variant="tertiary"
          aria-label="Reset diagram"
          css={{ marginRight: 'auto' }}
          onClick={() => navigate(0)}
        >
          <Icon.Repeat aria-hidden="true" />
        </IconButton>
        <IconButton
          ref={previousRef}
          rounded
          size="small"
          type="button"
          variant="tertiary"
          aria-label="Previous step"
          disabled={step === 0}
          onClick={() => navigate(step - 1)}
        >
          <Icon.Arrow
            aria-hidden="true"
            style={{ transform: 'rotate(180deg)' }}
          />
        </IconButton>
        <span aria-hidden="true">
          {String(step + 1).padStart(2, '0')} /{' '}
          {String(steps.length).padStart(2, '0')}
        </span>
        <IconButton
          ref={nextRef}
          rounded
          size="small"
          type="button"
          variant="tertiary"
          aria-label="Next step"
          disabled={step === steps.length - 1}
          onClick={() => navigate(step + 1)}
        >
          <Icon.Arrow aria-hidden="true" />
        </IconButton>
      </Controls>
    </Root>
  );
}
