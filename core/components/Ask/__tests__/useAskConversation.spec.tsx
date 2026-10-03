import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { useAskConversation } from '../useAskConversation';

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
  window.history.replaceState({}, '', '/');
});

it('preserves a stopped partial answer and includes it in the next turn', async () => {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(new Response(stream.readable))
    .mockImplementation(
      async () =>
        new Response(JSON.stringify({ answer: 'Next answer', sources: [] }))
    );
  vi.stubGlobal('fetch', fetchMock);
  const { result } = renderHook(() => useAskConversation());
  let first!: Promise<void>;
  act(() => {
    first = result.current.send('First question', []);
  });
  await act(async () => {
    await writer.write(new TextEncoder().encode('{"answer":"Partial answer'));
  });
  await waitFor(() => expect(result.current.streamData).toBe('Partial answer'));
  act(() => result.current.abort());
  await act(() => first);
  expect(result.current.status).toBe('done');
  expect(result.current.messages.at(-1)?.content).toBe('Partial answer');
  await act(() => result.current.send('Continue', []));
  expect(result.current.messages.map((message) => message.content)).toEqual([
    'First question',
    'Partial answer',
    'Continue',
    'Next answer',
  ]);
  expect(JSON.parse(fetchMock.mock.calls[1][1].body).history[1].content).toBe(
    'Partial answer'
  );
});

it('ignores an old request after starting a new conversation', async () => {
  let resolve!: (response: Response) => void;
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<Response>((done) => {
            resolve = done;
          })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ answer: 'Fresh answer', sources: [] }))
      )
  );
  const { result } = renderHook(() => useAskConversation());
  let first!: Promise<void>;
  act(() => {
    first = result.current.send('Old question', []);
  });
  act(() => result.current.reset());
  await act(() => result.current.send('Fresh question', []));
  await act(async () => {
    resolve(
      new Response(JSON.stringify({ answer: 'Stale answer', sources: [] }))
    );
    await first;
  });
  expect(result.current.messages.map((message) => message.content)).toEqual([
    'Fresh question',
    'Fresh answer',
  ]);
});

it('snapshots current page context separately for each turn after navigation', async () => {
  const fetchMock = vi
    .fn()
    .mockImplementation(
      async () =>
        new Response(JSON.stringify({ answer: 'Answer', sources: [] }))
    );
  vi.stubGlobal('fetch', fetchMock);
  window.history.replaceState({}, '', '/posts/first/');
  const article = document.createElement('article');
  article.dataset.askArticlePath = '/posts/first/';
  article.dataset.askArticleTitle = 'First article';
  article.innerHTML = '<p>First article content</p>';
  document.body.append(article);
  const { result } = renderHook(() => useAskConversation());
  await act(() => result.current.send('What is this article about?', []));
  window.history.replaceState({}, '', '/posts/second/');
  article.dataset.askArticlePath = '/posts/second/';
  article.dataset.askArticleTitle = 'Second article';
  article.innerHTML = '<p>Second article content</p>';
  await act(() => result.current.send('And this one?', []));
  const request = JSON.parse(fetchMock.mock.calls[1][1].body);
  expect(request.pageContext.article.title).toBe('Second article');
  expect(request.history[0].pageContext.article.title).toBe('First article');
});
