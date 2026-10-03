import { z } from 'zod';

const pathSchema = z.string().max(1000);
const catalogSchema = z.array(
  z.object({
    title: z.string().max(500),
    url: z.string().max(1000),
    publishedAt: z.string().max(100),
    description: z.string().max(2000),
  })
);

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
    articles: catalogSchema,
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
      try {
        const articles = catalogSchema.safeParse(
          JSON.parse(list.dataset.askArticleList ?? '')
        );
        if (articles.success)
          return { kind: 'article-list', path, articles: articles.data };
      } catch {
        // A missing or invalid catalog must not prevent sending a question.
      }
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
