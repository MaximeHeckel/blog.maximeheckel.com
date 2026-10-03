import { act, cleanup, render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { MarkdownArticle } from '../MarkdownArticle';

const animation = vi.hoisted(() => ({ reduced: false }));
vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('motion/react')>()),
  useReducedMotion: () => animation.reduced,
}));

const markdown = '# Article\n\n```tsx\nconst value = <Widget />;\n```\n';

beforeEach(() => {
  animation.reduced = false;
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it('renders the complete source on the server with no reveal for direct visits', () => {
  const html = renderToStaticMarkup(
    <MarkdownArticle markdown={markdown} animateReveal={false} />
  );
  const container = document.createElement('div');
  container.innerHTML = html;
  expect(container.querySelector('pre')).toHaveAttribute(
    'data-animate-reveal',
    'false'
  );
  expect(container.querySelector('code')?.textContent).toBe(markdown);
  expect(container.querySelector('widget')).toBeNull();
});

it('reveals UI switches and restores the exact source after the animation', () => {
  vi.useFakeTimers();
  const longSource = markdown + '\nparagraph\n'.repeat(100);
  render(<MarkdownArticle markdown={longSource} animateReveal />);
  const source = screen.getByLabelText('Article Markdown source');
  expect(source).toHaveAttribute('data-animate-reveal', 'true');
  expect(source.querySelector('code')?.textContent).toBe(longSource);
  act(() => vi.advanceTimersByTime(1200));
  expect(source).toHaveAttribute('data-animate-reveal', 'false');
  expect(source.textContent).toBe(longSource);
});

it('shows the full source immediately when reduced motion is enabled', () => {
  animation.reduced = true;
  render(<MarkdownArticle markdown={markdown} animateReveal />);
  const source = screen.getByLabelText('Article Markdown source');
  expect(source).toHaveAttribute('data-animate-reveal', 'false');
  expect(source.textContent).toBe(markdown);
});
