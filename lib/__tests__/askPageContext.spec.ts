// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';

import { captureAskPageContext } from '../askPageContext';

afterEach(() => {
  document.body.innerHTML = '';
  window.history.replaceState({}, '', '/');
});

it('captures the actual article and excludes Ask and embedded editor content', () => {
  window.history.replaceState({}, '', '/posts/shaders/');
  document.body.innerHTML =
    '<article data-ask-article-path="/posts/shaders/" data-ask-article-title="Shaders" data-ask-article-subtitle="Learn shaders"><p>Article introduction</p><h2>Lighting</h2><div class="sp-wrapper"><pre>Editor content</pre></div></article><div><p>Ask response</p></div>';
  expect(captureAskPageContext()).toEqual({
    kind: 'article',
    path: '/posts/shaders/',
    article: {
      title: 'Shaders',
      subtitle: 'Learn shaders',
      content: 'Article introduction\n\nLighting',
      truncated: false,
    },
  });
});

it('does not reuse an old article after route navigation', () => {
  document.body.innerHTML =
    '<article data-ask-article-path="/posts/old/"><p>Old article</p></article>';
  expect(captureAskPageContext()).toEqual({ kind: 'page', path: '/' });
});

it('marks bounded article context as incomplete', () => {
  document.body.innerHTML = `<article data-ask-article-path="/"><p>${'a'.repeat(20000)}</p></article>`;
  const context = captureAskPageContext();
  expect(context.kind).toBe('article');
  if (context.kind !== 'article') throw new Error('Expected article context');
  expect(context.article.content).toHaveLength(18000);
  expect(context.article.truncated).toBe(true);
});

it('identifies the article list without including catalog data', () => {
  document.body.innerHTML =
    '<main data-ask-list-path="/" data-ask-article-list></main>';

  expect(captureAskPageContext()).toEqual({ kind: 'article-list', path: '/' });

  window.history.replaceState({}, '', '/other/');

  expect(captureAskPageContext()).toEqual({ kind: 'page', path: '/other/' });
});
