import { act, renderHook } from '@testing-library/react';
import { getGPUTier } from 'detect-gpu';
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('detect-gpu', () => ({ getGPUTier: vi.fn() }));

beforeEach(() => {
  vi.resetModules();
  vi.mocked(getGPUTier).mockReset();
});

describe('useGPUTier', () => {
  it('shares detection across concurrent consumers, Strict Mode, and later mounts', async () => {
    let resolveDetection!: (
      result: Awaited<ReturnType<typeof getGPUTier>>
    ) => void;

    vi.mocked(getGPUTier).mockReturnValue(
      new Promise((resolve) => {
        resolveDetection = resolve;
      })
    );

    const { default: useGPUTier } = await import('../useGPUTier');
    const first = renderHook(() => useGPUTier(), { wrapper: StrictMode });
    const second = renderHook(() => useGPUTier());
    const removed = renderHook(() => useGPUTier());

    expect(first.result.current).toEqual({ tier: 0, loading: true });
    expect(second.result.current).toEqual({ tier: 0, loading: true });
    expect(getGPUTier).toHaveBeenCalledTimes(1);

    removed.unmount();

    await act(async () => {
      resolveDetection({ tier: 3, type: 'BENCHMARK' });
    });

    expect(first.result.current).toEqual({ tier: 3, loading: false });
    expect(second.result.current).toEqual({ tier: 3, loading: false });

    first.unmount();
    second.unmount();

    const later = renderHook(() => useGPUTier());

    await act(async () => {});

    expect(later.result.current).toEqual({ tier: 3, loading: false });
    expect(getGPUTier).toHaveBeenCalledTimes(1);
  });

  it('finishes loading with a conservative tier when detection fails', async () => {
    vi.mocked(getGPUTier).mockRejectedValue(new Error('Benchmark unavailable'));

    const { default: useGPUTier } = await import('../useGPUTier');
    const first = renderHook(() => useGPUTier());
    const second = renderHook(() => useGPUTier());

    await act(async () => {});

    expect(first.result.current).toEqual({ tier: 0, loading: false });
    expect(second.result.current).toEqual({ tier: 0, loading: false });

    const later = renderHook(() => useGPUTier());

    await act(async () => {});

    expect(later.result.current).toEqual({ tier: 0, loading: false });
    expect(getGPUTier).toHaveBeenCalledTimes(1);
  });

  it('does not start GPU detection during server rendering', async () => {
    const { default: useGPUTier } = await import('../useGPUTier');
    const Consumer = () => {
      const { tier, loading } = useGPUTier();

      return <span>{loading ? 'Loading' : tier}</span>;
    };

    expect(renderToString(<Consumer />)).toContain('Loading');
    expect(getGPUTier).not.toHaveBeenCalled();
  });
});
