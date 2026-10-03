import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';

import { AskPanel } from '../AskPanel';
import { useAICompletion } from '../useAICompletion';

vi.mock('../useAICompletion', () => ({ useAICompletion: vi.fn() }));
vi.mock('../Answer', () => ({ Answer: () => null }));

it('does not show sources for completed answers', () => {
  vi.mocked(useAICompletion).mockReturnValue({
    query: 'Explain shaders',
    streamData: 'A shader runs on the GPU.',
    sources: [{ title: 'Shader article', url: '/posts/shader/' }],
    status: 'done',
    error: null,
    submitQuery: vi.fn(),
    reset: vi.fn(),
    abort: vi.fn(),
  });
  render(<AskPanel state="open" onStateChange={vi.fn()} />);
  expect(screen.getByText('Explain shaders')).toBeInTheDocument();
  expect(screen.queryByText('Sources')).not.toBeInTheDocument();
  expect(
    screen.queryByRole('link', { name: 'Shader article' })
  ).not.toBeInTheDocument();
});

it('switches the composer send action to cancellation while streaming', () => {
  const submitQuery = vi.fn().mockResolvedValue(undefined);
  const reset = vi.fn();
  const completion = {
    query: '',
    streamData: '',
    sources: undefined,
    error: null,
    submitQuery,
    reset,
    abort: vi.fn(),
  };
  vi.mocked(useAICompletion).mockReturnValue({
    ...completion,
    status: 'initial',
  });
  const { rerender } = render(
    <AskPanel state="open" onStateChange={vi.fn()} />
  );
  expect(screen.getByRole('button', { name: 'Send question' })).toBeDisabled();
  fireEvent.change(screen.getByRole('textbox', { name: 'Ask a question' }), {
    target: { value: 'Explain shaders' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Send question' }));
  expect(submitQuery).toHaveBeenCalledWith('Explain shaders', [], [], {
    path: '/',
    kind: 'page',
  });

  vi.mocked(useAICompletion).mockReturnValue({
    ...completion,
    status: 'loading',
  });
  rerender(<AskPanel state="open" onStateChange={vi.fn()} />);
  const cancel = screen.getByRole('button', { name: 'Cancel response' });
  expect(cancel).toBeEnabled();
  expect(cancel).toHaveAttribute('type', 'button');
  expect(
    screen.queryByRole('button', { name: 'Send question' })
  ).not.toBeInTheDocument();
  fireEvent.click(cancel);
  expect(completion.abort).toHaveBeenCalledOnce();
  expect(reset).not.toHaveBeenCalled();
  expect(submitQuery).toHaveBeenCalledTimes(1);

  vi.mocked(useAICompletion).mockReturnValue({
    ...completion,
    status: 'initial',
  });
  rerender(<AskPanel state="open" onStateChange={vi.fn()} />);
  expect(screen.getByRole('button', { name: 'Send question' })).toBeDisabled();
});

it('copies the original Markdown of a completed answer', () => {
  const markdown =
    '**Shaders**\n\n- Run on the GPU\n\n```glsl\nvec3 color = vec3(1.0);\n```';
  const copy = vi.fn(() => {
    expect(document.querySelector('textarea[readonly]')).toHaveValue(markdown);
    return true;
  });
  Object.defineProperty(document, 'execCommand', {
    configurable: true,
    value: copy,
  });
  vi.mocked(useAICompletion).mockReturnValue({
    query: 'Explain shaders',
    streamData: markdown,
    sources: undefined,
    status: 'done',
    error: null,
    submitQuery: vi.fn(),
    reset: vi.fn(),
    abort: vi.fn(),
  });
  render(<AskPanel state="open" onStateChange={vi.fn()} />);
  fireEvent.click(
    screen.getByRole('button', { name: 'Copy answer as Markdown' })
  );
  expect(copy).toHaveBeenCalledWith('copy');
  expect(document.querySelector('textarea[readonly]')).toBeNull();
  Reflect.deleteProperty(document, 'execCommand');
});

it('preserves the draft and conversation on minimize and close', () => {
  const reset = vi.fn();
  const onStateChange = vi.fn();
  vi.mocked(useAICompletion).mockReturnValue({
    query: 'Explain shaders',
    streamData: 'A shader runs on the GPU.',
    sources: undefined,
    status: 'loading',
    error: null,
    submitQuery: vi.fn(),
    reset,
    abort: vi.fn(),
  });
  const { rerender } = render(
    <AskPanel state="open" onStateChange={onStateChange} />
  );
  fireEvent.change(screen.getByRole('textbox', { name: 'Ask a question' }), {
    target: { value: 'Follow-up question' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Minimize Ask' }));
  expect(onStateChange).toHaveBeenLastCalledWith('minimized');
  expect(reset).not.toHaveBeenCalled();
  rerender(<AskPanel state="minimized" onStateChange={onStateChange} />);
  fireEvent.click(screen.getByRole('button', { name: 'Resume Ask' }));
  rerender(<AskPanel state="open" onStateChange={onStateChange} />);
  expect(screen.getByRole('textbox', { name: 'Ask a question' })).toHaveValue(
    'Follow-up question'
  );
  fireEvent.click(screen.getByRole('button', { name: 'Close Ask' }));
  expect(onStateChange).toHaveBeenLastCalledWith('closed');
  expect(reset).not.toHaveBeenCalled();
  rerender(<AskPanel state="closed" onStateChange={onStateChange} />);
  rerender(<AskPanel state="open" onStateChange={onStateChange} />);
  expect(screen.getByRole('textbox', { name: 'Ask a question' })).toHaveValue(
    'Follow-up question'
  );
});

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
});

it('changes the activity status from thinking to writing when text arrives', () => {
  const completion = {
    query: 'Explain shaders',
    streamData: '',
    sources: undefined,
    status: 'loading' as const,
    error: null,
    submitQuery: vi.fn(),
    reset: vi.fn(),
    abort: vi.fn(),
  };
  vi.mocked(useAICompletion).mockReturnValue(completion);
  const { rerender } = render(
    <AskPanel state="open" onStateChange={vi.fn()} />
  );
  const status = screen.getByRole('status');
  expect(status).toHaveTextContent('Thinking…');

  vi.mocked(useAICompletion).mockReturnValue({
    ...completion,
    streamData: 'A shader runs on the GPU.',
  });
  rerender(<AskPanel state="open" onStateChange={vi.fn()} />);
  expect(screen.getByRole('status')).toHaveTextContent('Writing…');
});

it('focuses the composer on opening and restoring the window', async () => {
  vi.mocked(useAICompletion).mockReturnValue({
    query: '',
    streamData: '',
    sources: undefined,
    status: 'initial',
    error: null,
    submitQuery: vi.fn(),
    reset: vi.fn(),
    abort: vi.fn(),
  });
  const { rerender } = render(
    <AskPanel state="open" onStateChange={vi.fn()} />
  );
  await waitFor(() =>
    expect(
      screen.getByRole('textbox', { name: 'Ask a question' })
    ).toHaveFocus()
  );
  rerender(<AskPanel state="minimized" onStateChange={vi.fn()} />);
  expect(screen.getByRole('button', { name: 'Resume Ask' })).toHaveFocus();
  rerender(<AskPanel state="open" onStateChange={vi.fn()} />);
  await waitFor(() =>
    expect(
      screen.getByRole('textbox', { name: 'Ask a question' })
    ).toHaveFocus()
  );
});

it('reserves the copy control space while streaming and reveals the same control on completion', async () => {
  const completion = {
    query: 'Question',
    streamData: 'Answer',
    sources: undefined,
    error: null,
    submitQuery: vi.fn(),
    reset: vi.fn(),
    abort: vi.fn(),
  };
  vi.mocked(useAICompletion).mockReturnValue({
    ...completion,
    status: 'loading',
  });
  const { rerender, container } = render(
    <AskPanel state="open" onStateChange={vi.fn()} />
  );
  const copy = container.ownerDocument.querySelector(
    '[aria-label="Copy answer as Markdown"]'
  );
  expect(copy).not.toBeVisible();
  expect(copy).toBeInTheDocument();
  expect(screen.getByRole('status').compareDocumentPosition(copy!)).toBe(
    Node.DOCUMENT_POSITION_FOLLOWING
  );
  vi.mocked(useAICompletion).mockReturnValue({ ...completion, status: 'done' });
  rerender(<AskPanel state="open" onStateChange={vi.fn()} />);
  expect(screen.getByRole('button', { name: 'Copy answer as Markdown' })).toBe(
    copy
  );
  await waitFor(() => expect(copy).toBeVisible());
});
