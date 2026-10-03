import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { AskButton } from '../AskButton';

const openAsk = vi.fn();
vi.mock('../AskContext', () => ({ useAsk: () => openAsk }));

it('opens the shared chat without passing the click event as an attachment', () => {
  render(<AskButton />);
  const button = screen.getByRole('button', { name: 'Ask' });
  expect(button.querySelector('svg')).toBeNull();
  fireEvent.click(button);
  expect(openAsk).toHaveBeenCalledExactlyOnceWith();
});
