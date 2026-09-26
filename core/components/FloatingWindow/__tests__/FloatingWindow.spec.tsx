import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';

import { FloatingWindow, FloatingWindowState } from '..';

it('keeps drafts through minimizing and closing without blocking the page', async () => {
  const read = vi.fn();
  const Example = () => {
    const [state, setState] = useState<FloatingWindowState>('closed');
    return (
      <>
        <button onClick={() => setState('open')}>Open Ask</button>
        <button onClick={read}>Article interaction</button>
        <button onClick={() => setState('closed')}>
          Close panel externally
        </button>
        <FloatingWindow title="Ask" state={state} onStateChange={setState}>
          <textarea aria-label="Draft" />
        </FloatingWindow>
      </>
    );
  };
  render(<Example />);
  const trigger = screen.getByRole('button', { name: 'Open Ask' });
  trigger.focus();
  fireEvent.click(trigger);
  await waitFor(() =>
    expect(screen.getByRole('dialog', { name: 'Ask' })).toHaveFocus()
  );
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft' }), {
    target: { value: 'Explain this' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Article interaction' }));
  expect(read).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole('button', { name: 'Minimize Ask' }));
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Resume Ask' })).toHaveFocus();
  fireEvent.click(screen.getByRole('button', { name: 'Resume Ask' }));
  expect(screen.getByRole('textbox')).toHaveValue('Explain this');
  fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole('button', { name: 'Close Ask' }));
  expect(
    screen.queryByRole('button', { name: 'Resume Ask' })
  ).not.toBeInTheDocument();
  fireEvent.click(trigger);
  expect(screen.getByRole('textbox')).toHaveValue('Explain this');
});

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
});
