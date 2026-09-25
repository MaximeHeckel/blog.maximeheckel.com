import { act, renderHook, waitFor } from '@testing-library/react';
import * as partialJson from 'lib/partialJson';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useAICompletion } from '../useAICompletion';

const streamResponse = (text: string) =>
  new Response(
    new ReadableStream({
      start(controller) {
        for (const character of text) {
          controller.enqueue(new TextEncoder().encode(character));
        }
        controller.close();
      },
    })
  );

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('useAICompletion', () => {
  it('coalesces token bursts and flushes the final answer and sources', async () => {
    const data = {
      answer: 'A streamed answer with ```js\nconst x = 1;\n```',
      sources: [{ title: 'Article', url: '/posts/article/' }],
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(streamResponse(JSON.stringify(data)))
    );
    vi.spyOn(performance, 'now').mockReturnValue(0);
    const parse = vi.spyOn(partialJson, 'parsePartialJson');
    const { result } = renderHook(() => useAICompletion());

    await act(() => result.current.submitQuery('Question'));

    expect(result.current.streamData).toBe(data.answer);
    expect(result.current.sources).toEqual(data.sources);
    expect(result.current.status).toBe('done');
    expect(parse).toHaveBeenCalledTimes(2);
  });

  it('streams the answer but only publishes valid sources on completion', async () => {
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(stream.readable))
    );
    let now = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => (now += 100));
    const { result } = renderHook(() => useAICompletion());
    let request!: Promise<void>;
    act(() => {
      request = result.current.submitQuery('Question');
    });
    await act(async () => {
      await writer.write(
        new TextEncoder().encode(
          '{"sources":[{"title":"Article","url":"/posts/article/"},{"title":"Missing URL"},{"url":"/missing-title/"}],"answer":"First'
        )
      );
    });
    await waitFor(() => expect(result.current.streamData).toBe('First'));
    expect(result.current.sources).toBeUndefined();

    await act(async () => {
      await writer.write(new TextEncoder().encode(' second"}'));
    });
    await waitFor(() => expect(result.current.streamData).toBe('First second'));
    expect(result.current.sources).toBeUndefined();
    expect(result.current.status).toBe('loading');

    await act(async () => {
      await writer.close();
      await request;
    });
    expect(result.current.sources).toEqual([
      { title: 'Article', url: '/posts/article/' },
    ]);
    expect(result.current.status).toBe('done');
  });

  it('finishes an empty stream', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(streamResponse('')));
    const { result } = renderHook(() => useAICompletion());

    await act(() => result.current.submitQuery('Question'));

    expect(result.current.status).toBe('done');
    expect(result.current.streamData).toBe('');
    expect(result.current.error).toBeNull();
  });

  it('clears an HTTP error and the previous query on reset', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response('Failed', { status: 500, statusText: 'Server error' })
        )
    );
    const { result } = renderHook(() => useAICompletion());

    await act(() => result.current.submitQuery('Question'));

    expect(result.current.status).toBe('initial');
    expect(result.current.error).toEqual({
      status: 500,
      statusText: 'Server error',
    });
    act(() => result.current.reset());
    expect(result.current.query).toBe('');
    expect(result.current.error).toBeNull();
    expect(result.current.sources).toBeUndefined();
  });

  it('ignores a response that arrives after reset', async () => {
    let resolveResponse!: (response: Response) => void;
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveResponse = resolve;
          })
      )
    );
    const { result } = renderHook(() => useAICompletion());
    let request!: Promise<void>;
    act(() => {
      request = result.current.submitQuery('Old question');
    });
    act(() => result.current.reset());
    await act(async () => {
      resolveResponse(new Response('Failed', { status: 500 }));
      await request;
    });
    expect(result.current.status).toBe('initial');
    expect(result.current.query).toBe('');
    expect(result.current.error).toBeNull();
    expect(result.current.streamData).toBe('');
  });

  it('does not let an older failed request overwrite a new answer', async () => {
    let rejectOld!: (error: Error) => void;
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockImplementationOnce(
          () =>
            new Promise((_resolve, reject) => {
              rejectOld = reject;
            })
        )
        .mockResolvedValueOnce(
          streamResponse(JSON.stringify({ answer: 'New answer', sources: [] }))
        )
    );
    const { result } = renderHook(() => useAICompletion());
    let oldRequest!: Promise<void>;
    act(() => {
      oldRequest = result.current.submitQuery('Old');
    });
    await act(() => result.current.submitQuery('New'));
    await act(async () => {
      rejectOld(new Error('Old network failure'));
      await oldRequest;
    });
    expect(result.current.query).toBe('New');
    expect(result.current.streamData).toBe('New answer');
    expect(result.current.status).toBe('done');
    expect(result.current.error).toBeNull();
  });
});
