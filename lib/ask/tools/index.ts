import { ArticleSearch, searchArticlePassages } from '../articles';
import { createGetArticleCatalogTool } from './getArticleCatalog';
import { createRecommendArticlesTool } from './recommendArticles';
import { createRetrievePassagesTool } from './retrievePassages';

export const createAskTools = (
  search: ArticleSearch = searchArticlePassages
) => {
  let calls = 0;

  const boundedSearch: ArticleSearch = (query, options) => {
    if (++calls > 4) throw new Error('Article tool budget exhausted');

    return search(query, options);
  };

  return {
    getArticleCatalog: createGetArticleCatalogTool(),
    retrievePassages: createRetrievePassagesTool(boundedSearch),
    recommendArticles: createRecommendArticlesTool(boundedSearch),
  };
};
