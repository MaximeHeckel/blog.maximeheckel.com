import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ArticlesSection } from '..';

const navigation = vi.hoisted(() => ({ skip: false, reducedMotion: false }));
vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('motion/react')>()),
  useReducedMotion: () => navigation.reducedMotion,
}));
vi.mock('@core/hooks/useArticlesScrambleNavigation', () => ({
  useShouldSkipArticlesScramble: () => navigation.skip,
}));
vi.mock('@core/components/ViewTransitionLink', () => ({
  default: ({
    navigateOnPress: _navigateOnPress,
    passHref: _passHref,
    ...props
  }: ComponentProps<'a'> & {
    navigateOnPress?: boolean;
    passHref?: boolean;
  }) => <a {...props} />,
}));

const observers = new Map<Element, IntersectionObserverCallback>();
class MockIntersectionObserver {
  constructor(private callback: IntersectionObserverCallback) {}
  observe = (element: Element) => observers.set(element, this.callback);
  unobserve = (element: Element) => observers.delete(element);
  disconnect = () => {};
}

const posts = [2026, 2025, 2024].map((year) => ({
  title: `A long and readable article title from ${year}`,
  slug: `article-${year}`,
  date: `${year}-01-02`,
  updated: `${year}-01-02`,
  subtitle: '',
}));

const scrambleIntervals = (calls: readonly (readonly unknown[])[]) =>
  calls.filter(([, delay]) => delay === 30 / 1.75 || delay === 30 / 0.8);

const setVisible = (element: Element, visible: boolean) => {
  act(() => {
    observers.get(element)?.(
      [
        {
          target: element,
          isIntersecting: visible,
        } as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver
    );
  });
};

beforeEach(() => {
  vi.useFakeTimers();
  navigation.skip = false;
  navigation.reducedMotion = false;
  observers.clear();
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }))
  );
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('article row scrambles', () => {
  it('keeps distant rows readable without scheduling scramble timers', () => {
    const interval = vi.spyOn(globalThis, 'setInterval');
    render(<ArticlesSection posts={posts} />);

    for (const post of posts) {
      expect(
        screen.getByRole('link', { name: `${post.title} Jan 02` })
      ).toHaveAttribute('href', `/posts/${post.slug}/`);
    }
    act(() => vi.advanceTimersByTime(5000));
    expect(interval).not.toHaveBeenCalled();
  });

  it('only runs visible rows, cancels on exit, and does not replay on re-entry', () => {
    const interval = vi.spyOn(globalThis, 'setInterval');
    const clearInterval = vi.spyOn(globalThis, 'clearInterval');
    render(<ArticlesSection posts={posts} />);
    const [first, second] = screen.getAllByRole('link');

    setVisible(first, true);
    act(() => vi.advanceTimersByTime(500));
    expect(scrambleIntervals(interval.mock.calls)).toHaveLength(2);
    expect(first.querySelector('[aria-hidden]')).toBeInTheDocument();
    expect(second.querySelector('[aria-hidden]')).not.toBeInTheDocument();
    expect(first).toHaveAccessibleName(`${posts[0].title} Jan 02`);

    setVisible(first, false);
    expect(clearInterval).toHaveBeenCalled();
    expect(first.querySelector('[aria-hidden]')).not.toBeInTheDocument();
    setVisible(first, true);
    act(() => vi.advanceTimersByTime(5000));
    expect(scrambleIntervals(interval.mock.calls)).toHaveLength(2);

    setVisible(second, true);
    act(() => vi.advanceTimersByTime(600));
    expect(scrambleIntervals(interval.mock.calls)).toHaveLength(4);
  });

  it('cancels a pending stagger before it can start offscreen', () => {
    const interval = vi.spyOn(globalThis, 'setInterval');
    render(<ArticlesSection posts={posts} />);
    const [first] = screen.getAllByRole('link');
    setVisible(first, true);
    setVisible(first, false);
    act(() => vi.advanceTimersByTime(5000));
    expect(interval).not.toHaveBeenCalled();
  });

  it('reveals focused text immediately and preserves hover sessions', () => {
    const interval = vi.spyOn(globalThis, 'setInterval');
    render(<ArticlesSection posts={posts} />);
    const [first, second] = screen.getAllByRole('link');
    setVisible(first, true);
    fireEvent.mouseEnter(first);
    expect(first.closest('[data-article-year-section]')).toHaveAttribute(
      'data-active'
    );
    fireEvent.mouseEnter(second);
    expect(second.closest('[data-article-year-section]')).toHaveAttribute(
      'data-active'
    );
    fireEvent.focus(first);
    act(() => vi.advanceTimersByTime(5000));
    expect(interval).not.toHaveBeenCalled();
    expect(first.querySelector('[aria-hidden]')).not.toBeInTheDocument();
    expect(first).toHaveAccessibleName(`${posts[0].title} Jan 02`);
  });

  it('bounds the stagger for a distant row that scrolls into view', () => {
    const interval = vi.spyOn(globalThis, 'setInterval');
    const manyPosts = Array.from({ length: 50 }, (_, index) => ({
      ...posts[0],
      slug: `article-${index}`,
    }));
    render(<ArticlesSection posts={manyPosts} />);
    const last = screen.getAllByRole('link').at(-1)!;
    setVisible(last, true);
    act(() => vi.advanceTimersByTime(900));
    expect(scrambleIntervals(interval.mock.calls)).toHaveLength(2);
  });

  it('keeps visible rows static for reduced motion', () => {
    navigation.reducedMotion = true;
    const interval = vi.spyOn(globalThis, 'setInterval');
    render(<ArticlesSection posts={posts} />);
    screen.getAllByRole('link').forEach((link) => setVisible(link, true));
    act(() => vi.advanceTimersByTime(5000));
    expect(interval).not.toHaveBeenCalled();
    expect(
      screen.getByRole('link', { name: `${posts[0].title} Jan 02` })
    ).toBeVisible();
  });

  it('skips all row scrambles when returning from an article', () => {
    navigation.skip = true;
    const interval = vi.spyOn(globalThis, 'setInterval');
    render(<ArticlesSection posts={posts} />);
    screen.getAllByRole('link').forEach((link) => setVisible(link, true));
    act(() => vi.advanceTimersByTime(5000));
    expect(interval).not.toHaveBeenCalled();
    expect(screen.getAllByRole('link')).toHaveLength(posts.length);
  });
});
