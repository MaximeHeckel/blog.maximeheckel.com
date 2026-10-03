import { EnvConfig, normalizeTokens, PrismLib } from 'prism-react-renderer';

import { Prism } from './prism';

type PrismToken = InstanceType<PrismLib['Token']>;

const diffSections = new Set([
  'inserted-sign',
  'inserted-arrow',
  'deleted-sign',
  'deleted-arrow',
  'unchanged',
  'diff',
]);

const tokenText = (content: PrismToken['content']): string => {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map(tokenText).join('');
  }
  return tokenText(content.content);
};

export const createDiffHighlighter = (language: string) => {
  const normalizedLanguage = language.toLowerCase();
  if (!normalizedLanguage.startsWith('diff-')) {
    return { prism: Prism, syntaxHighlighted: false };
  }

  const baseLanguage = normalizedLanguage.slice(5);
  const grammar = Prism.languages[baseLanguage];
  const syntaxHighlighted = Boolean(grammar && typeof grammar === 'object');

  // Keep the virtual diff language local to this renderer's Prism facade.
  const prism: PrismLib = {
    ...Prism,
    languages: {
      ...Prism.languages,
      [normalizedLanguage]: Prism.languages.diff,
    },
    tokenize(code, diffGrammar) {
      const tokens = Prism.tokenize(code, diffGrammar);
      if (!syntaxHighlighted) return tokens;

      return tokens.flatMap((token) => {
        if (typeof token === 'string' || !diffSections.has(token.type)) {
          return [token];
        }

        const source = tokenText(token.content);
        // Retain the original line endings and omit the trailing split sentinel.
        const lines = source
          .match(/[^\r\n]*(?:\r\n|\r|\n|$)/g)!
          .filter(Boolean);
        const env: EnvConfig = {
          code: lines.map((line) => line.slice(1)).join(''),
          grammar,
          language: baseLanguage,
          tokens: [],
        };

        // Tokenize the entire section so multiline syntax and JSX hooks work.
        Prism.hooks.run('before-tokenize', env);
        env.tokens = Prism.tokenize(env.code, env.grammar);
        Prism.hooks.run('after-tokenize', env);
        const highlightedLines = normalizeTokens(env.tokens);
        const status = token.type.startsWith('inserted')
          ? 'inserted'
          : token.type.startsWith('deleted')
            ? 'deleted'
            : 'unchanged';

        return lines.flatMap((line, index) => [
          new Prism.Token('prefix', line[0], status),
          ...highlightedLines[index].map(
            (part) =>
              new Prism.Token(
                part.types[0],
                part.empty ? '' : part.content,
                part.types.slice(1)
              )
          ),
          line.match(/(?:\r\n|\r|\n)$/)?.[0] ?? '',
        ]);
      });
    },
  };

  return { prism, syntaxHighlighted };
};
