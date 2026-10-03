import { fireEvent, render, screen } from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import type { NextRouter } from 'next/router';
import { expect, it, vi } from 'vitest';

import { AnswerLink } from '../AnswerLink';

it.each([
  '/posts/shaders/?example=1#lighting',
  'https://blog.maximeheckel.com/posts/shaders/?example=1#lighting',
])('uses client navigation for article link %s', (href) => {
  const push = vi.fn().mockResolvedValue(true);
  const router = {
    push,
    beforePopState: vi.fn(),
    prefetch: vi.fn().mockResolvedValue(undefined),
    pathname: '/',
    asPath: '/',
    route: '/',
    query: {},
    isReady: true,
    isFallback: false,
    basePath: '',
  } as unknown as NextRouter;
  render(
    <RouterContext.Provider value={router}>
      <AnswerLink href={href}>Shaders</AnswerLink>
    </RouterContext.Provider>
  );
  const link = screen.getByRole('link', { name: 'Shaders' });
  expect(link).toHaveAttribute('href', '/posts/shaders?example=1#lighting');
  expect(link).not.toHaveAttribute('target', '_blank');
  fireEvent.click(link);
  expect(push).toHaveBeenCalledWith(
    '/posts/shaders?example=1#lighting',
    '/posts/shaders?example=1#lighting',
    expect.any(Object)
  );
});

it('preserves genuinely external URLs', () => {
  render(
    <AnswerLink href="https://example.com/posts/shaders/">External</AnswerLink>
  );
  expect(screen.getByRole('link', { name: 'External' })).toHaveAttribute(
    'href',
    'https://example.com/posts/shaders/'
  );
});
