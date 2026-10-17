import { useEffect, useState } from 'react';

interface AutoPlayOptions {
  count: number;
  active: number;
  onStepChange: (index: number) => void;
  stepDuration?: number;
  loop?: boolean;
  enabled?: boolean;
  suspended?: boolean;
}

export const useAutoPlay = ({
  count,
  active,
  onStepChange,
  stepDuration = 5000,
  loop = true,
  enabled = true,
  suspended = false,
}: AutoPlayOptions) => {
  const [paused, setPaused] = useState(false);

  const duration = Math.max(100, stepDuration);
  const atEnd = !loop && active >= count - 1;
  const playing = enabled && !paused && count > 1 && !atEnd;
  const filling = playing && !suspended;

  useEffect(() => {
    if (!filling) return;

    // A newly selected slide and its progress indicator start a full interval together.
    const timeout = window.setTimeout(() => {
      onStepChange((active + 1) % count);
    }, duration);

    return () => window.clearTimeout(timeout);
  }, [active, count, duration, onStepChange, filling]);

  return {
    playing,
    filling,
    fillDuration: duration,
    toggle: () => setPaused((value) => !value),
    pause: () => setPaused(true),
  };
};
