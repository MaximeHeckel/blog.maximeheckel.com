import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import AspectRatio from '..';

it('changes the crop and reports preset selection', async () => {
  const onValueChange = vi.fn();
  render(
    <AspectRatio onValueChange={onValueChange}>
      <img src="test.jpg" alt="Seascape" />
    </AspectRatio>
  );
  expect(screen.getByRole('radio', { name: '16:9' })).toBeChecked();
  fireEvent.click(screen.getByRole('radio', { name: '4:5' }));
  expect(screen.getByRole('radio', { name: '4:5' })).toBeChecked();
  expect(screen.getByAltText('Seascape').parentElement).toHaveAttribute(
    'data-aspect-ratio',
    '4:5'
  );
  expect(onValueChange).toHaveBeenCalledWith('4:5');
});

it('keeps a controlled selection until its parent updates', async () => {
  const onValueChange = vi.fn();
  const { rerender } = render(
    <AspectRatio value="1:1" onValueChange={onValueChange} />
  );
  fireEvent.click(screen.getByRole('radio', { name: '9:16' }));
  expect(onValueChange).toHaveBeenCalledWith('9:16');
  expect(screen.getByRole('radio', { name: '1:1' })).toBeChecked();
  rerender(<AspectRatio value="9:16" onValueChange={onValueChange} />);
  expect(screen.getByRole('radio', { name: '9:16' })).toBeChecked();
});

it('disables all presets', async () => {
  const onValueChange = vi.fn();
  render(<AspectRatio disabled onValueChange={onValueChange} />);
  for (const radio of screen.getAllByRole('radio'))
    expect(radio).toBeDisabled();
  screen.getByRole('radio', { name: '1:1' }).click();
  expect(onValueChange).not.toHaveBeenCalled();
});
