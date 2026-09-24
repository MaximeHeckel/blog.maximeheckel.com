import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import AIPromptInput from '../AIPromptInput';

it('clears the field and Send button together after submitting a question', async () => {
  const onSubmit = vi.fn();
  render(<AIPromptInput status="initial" onSubmit={onSubmit} />);
  const input = screen.getByRole('textbox', { name: 'Ask a question' });
  fireEvent.change(input, { target: { value: '  How do shaders work?  ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send' }));
  expect(onSubmit).toHaveBeenCalledWith('How do shaders work?');
  expect(input).toHaveValue('');
  await waitFor(() =>
    expect(
      screen.queryByRole('button', { name: 'Send' })
    ).not.toBeInTheDocument()
  );
});
