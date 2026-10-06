import { act, render, screen, waitFor } from '@testing-library/react';
import { motionValue, useReducedMotion, useVelocity } from 'motion/react';
import { beforeEach, expect, it, vi } from 'vitest';

import { FloatingAnchor } from '..';

vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('motion/react')>()),
  useVelocity: vi.fn(),
  useReducedMotion: vi.fn(),
}));

const velocityX = motionValue(0);
const velocityY = motionValue(0);

beforeEach(() => {
  velocityX.set(0);
  velocityY.set(0);
  vi.mocked(useVelocity)
    .mockReset()
    .mockReturnValueOnce(velocityX)
    .mockReturnValueOnce(velocityY);
  vi.mocked(useReducedMotion).mockReturnValue(false);
});

const renderAnchor = () => {
  render(
    <FloatingAnchor
      active
      label="Resume Ask"
      buttonRef={null}
      onOpen={vi.fn()}
      onCornerChange={vi.fn()}
    />
  );
  return screen
    .getByRole('button')
    .querySelector(':scope > span') as HTMLElement;
};

it('blurs only the icon with movement speed, caps fast movement, and clears at rest', async () => {
  const icon = renderAnchor();
  expect(icon.style.filter).toBe('blur(0px)');

  act(() => velocityX.set(600));
  await waitFor(() => expect(icon.style.filter).toBe('blur(1px)'));
  act(() => {
    velocityX.set(-600);
    velocityY.set(800);
  });
  await waitFor(() =>
    expect(parseFloat(icon.style.filter.slice(5))).toBeGreaterThan(1)
  );
  act(() => velocityY.set(10000));
  await waitFor(() => expect(icon.style.filter).toBe('blur(3px)'));
  expect(screen.getByRole('button').style.filter).toBe('');

  act(() => {
    velocityX.set(0);
    velocityY.set(0);
  });
  await waitFor(() => expect(icon.style.filter).toBe('blur(0px)'));
});

it('keeps the icon sharp when reduced motion is preferred', () => {
  vi.mocked(useReducedMotion).mockReturnValue(true);
  const icon = renderAnchor();
  act(() => {
    velocityX.set(3000);
    velocityY.set(3000);
  });
  expect(icon.style.filter).toBe('none');
});
