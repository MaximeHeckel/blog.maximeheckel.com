import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ScrambledText } from '../ScrambledText';

const preferences = vi.hoisted(() => ({ reducedMotion: false }));

vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('motion/react')>()),
  useReducedMotion: () => preferences.reducedMotion,
}));

afterEach(cleanup);

it.each([
  { disabled: true, reducedMotion: false },
  { disabled: false, reducedMotion: true },
  { disabled: false, reducedMotion: false },
])(
  'names an article link once ($disabled, $reducedMotion)',
  ({ disabled, reducedMotion }) => {
    preferences.reducedMotion = reducedMotion;

    render(
      <a href="/posts/example/">
        <ScrambledText disabled={disabled}>Shading Motion</ScrambledText>{' '}
        <ScrambledText disabled={disabled}>Aug 18</ScrambledText>
      </a>
    );

    expect(screen.getByRole('link')).toHaveAccessibleName(
      'Shading Motion Aug 18'
    );
  }
);
