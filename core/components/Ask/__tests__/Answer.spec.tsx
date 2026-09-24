import { act, render, screen, waitFor } from '@testing-library/react';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Answer } from '../Answer';

vi.mock('next-mdx-remote/serialize', () => ({ serialize: vi.fn() }));
vi.mock('next-mdx-remote', () => ({
  MDXRemote: ({ compiledSource }: { compiledSource: string }) => (
    <p>{compiledSource}</p>
  ),
}));
const compiled = (text: string) => ({
  compiledSource: text,
  scope: {},
  frontmatter: {},
});
afterEach(() => vi.clearAllMocks());

describe('Answer', () => {
  it('ignores stale compilation results and avoids recompiling unchanged text', async () => {
    let resolveOld!: (value: MDXRemoteSerializeResult) => void;
    vi.mocked(serialize)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveOld = resolve;
          })
      )
      .mockResolvedValueOnce(compiled('Latest answer'));
    const onRender = vi.fn();
    const { rerender } = render(<Answer text="Old" onRender={onRender} />);
    rerender(<Answer text="Latest" onRender={onRender} />);
    await screen.findByText('Latest answer');
    await act(async () => resolveOld(compiled('Old answer')));
    expect(screen.queryByText('Old answer')).not.toBeInTheDocument();
    rerender(<Answer text="Latest" onRender={onRender} />);
    expect(serialize).toHaveBeenCalledTimes(2);
    expect(onRender).toHaveBeenCalledTimes(1);
    expect(serialize).toHaveBeenLastCalledWith(
      'Latest',
      expect.objectContaining({
        mdxOptions: expect.objectContaining({ format: 'md' }),
      })
    );
  });

  it('retains the last answer on compilation failure and clears on reset', async () => {
    vi.mocked(serialize)
      .mockResolvedValueOnce(compiled('Visible answer'))
      .mockRejectedValueOnce(new Error('Incomplete'));
    const onRender = vi.fn();
    const { container, rerender } = render(
      <Answer text="Valid" onRender={onRender} />
    );
    await screen.findByText('Visible answer');
    rerender(<Answer text="Incomplete" onRender={onRender} />);
    await waitFor(() => expect(serialize).toHaveBeenCalledTimes(2));
    expect(screen.getByText('Visible answer')).toBeInTheDocument();
    rerender(<Answer text="" onRender={onRender} />);
    expect(container).toBeEmptyDOMElement();
  });
});
