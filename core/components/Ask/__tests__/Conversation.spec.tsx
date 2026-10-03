import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { AskProvider, useAsk } from '../AskContext';

vi.mock('../Answer', () => ({
  Answer: ({ text }: { text: string }) => <p>{text}</p>,
}));

const Open = () => {
  const open = useAsk();
  return (
    <button
      onClick={() =>
        open({
          id: 'snippet',
          kind: 'code',
          code: 'const x = 1;',
          language: 'js',
        })
      }
    >
      Open
    </button>
  );
};

afterEach(() => vi.unstubAllGlobals());

it('keeps turns, attachment snapshots, and history across closing; explicitly starts fresh', async () => {
  const fetchMock = vi.fn().mockImplementation(
    async () =>
      new Response(
        JSON.stringify({
          answer:
            fetchMock.mock.calls.length === 1
              ? 'First answer'
              : 'Follow-up answer',
          sources: [{ title: 'Article', url: '/posts/article' }],
        })
      )
  );
  vi.stubGlobal('fetch', fetchMock);
  render(
    <AskProvider>
      <Open />
    </AskProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Open' }));
  const input = await screen.findByRole('textbox', { name: 'Ask a question' });
  fireEvent.change(input, { target: { value: 'Explain this code' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send question' }));
  await screen.findByText('First answer');
  await waitFor(() => expect(screen.queryByRole('status')).toBeNull());
  fireEvent.click(screen.getByRole('button', { name: 'Close Ask' }));
  fireEvent.click(screen.getByRole('button', { name: 'Open' }));
  expect(await screen.findByText('First answer')).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole('button', { name: 'Remove code attachment' })
  );
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'Explain that more simply' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Send question' }));
  await screen.findByText('Follow-up answer');
  expect(screen.getByText('First answer')).toBeInTheDocument();
  await waitFor(() =>
    expect(
      screen.getAllByRole('button', { name: 'Copy answer as Markdown' })
    ).toHaveLength(1)
  );
  expect(screen.getByText('Explain this code')).toBeInTheDocument();
  const request = JSON.parse(fetchMock.mock.calls[1][1].body);
  expect(request.attachments).toEqual([]);
  expect(request.history).toEqual([
    expect.objectContaining({
      role: 'user',
      content: 'Explain this code',
      attachments: [expect.objectContaining({ code: 'const x = 1;' })],
    }),
    expect.objectContaining({
      role: 'assistant',
      content: 'First answer',
      sources: [{ title: 'Article', url: '/posts/article' }],
    }),
  ]);
  fireEvent.click(screen.getByRole('button', { name: 'New conversation' }));
  expect(screen.queryByText('First answer')).toBeNull();
  expect(screen.queryByText('Follow-up answer')).toBeNull();
  expect(screen.getByRole('textbox')).toHaveValue('');
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'Fresh question' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Send question' }));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
  expect(JSON.parse(fetchMock.mock.calls[2][1].body).history).toEqual([]);
  await waitFor(() => expect(screen.queryByRole('status')).toBeNull());
});
