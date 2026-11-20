import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Slider } from '..';

afterEach(cleanup);

it('names each focusable slider from its visible label', () => {
  const props = { min: 0, max: 1, step: 0.01, value: 0.5, onChange: vi.fn() };

  render(
    <>
      <Slider {...props} id="motion-threshold" label="Threshold" />
      <Slider {...props} label="Decay" />
    </>
  );

  const threshold = screen.getByRole('slider', { name: 'Threshold' });
  const decay = screen.getByRole('slider', { name: 'Decay' });

  expect(threshold).toHaveAttribute('type', 'range');
  expect(decay).toHaveAttribute('type', 'range');
  act(() => threshold.focus());
  expect(threshold).toHaveFocus();
});
