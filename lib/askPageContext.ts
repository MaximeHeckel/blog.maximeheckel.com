import { z } from 'zod';

const pathSchema = z.string().max(1000);
export const askPageContextSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('article'),
    path: pathSchema,
    article: z.object({
      title: z.string().max(500),
      subtitle: z.string().max(2000),
      content: z.string().max(18000),
      truncated: z.boolean(),
    }),
  }),
  z.object({
    kind: z.literal('article-list'),
    path: pathSchema,
  }),
  z.object({ kind: z.literal('page'), path: pathSchema }),
]);

export type AskPageContext = z.infer<typeof askPageContextSchema>;

// Read at send time, not when the conversation opens. Never include the Ask UI.
export const captureAskPageContext = (): AskPageContext => {
  const path = window.location.pathname;
  const article = document.querySelector<HTMLElement>(
    '[data-ask-article-path]'
  );

  if (
    !article ||
    article.dataset.askArticlePath?.replace(/\/$/, '') !==
      path.replace(/\/$/, '')
  ) {
    const list = document.querySelector<HTMLElement>('[data-ask-article-list]');

    if (list?.dataset.askListPath === path) {
      return { kind: 'article-list', path };
    }

    return { kind: 'page', path };
  }

  const content = Array.from(article.querySelectorAll('p, h2, h3, h4, li, pre'))
    .filter(
      (node) =>
        !node.parentElement?.closest(
          'pre, li, [data-ask-selection-ignore], .sp-wrapper, .cm-editor, .monaco-editor'
        )
    )
    .map((node) => node.textContent?.trim())
    .filter(Boolean)
    .join('\n\n');

  return {
    kind: 'article',
    path,
    article: {
      title: article.dataset.askArticleTitle ?? '',
      subtitle: article.dataset.askArticleSubtitle ?? '',
      content: content.slice(0, 18000),
      truncated: content.length > 18000,
    },
  };
};
