// Shared by Prism code blocks and the Sandpack editor.
export const syntaxTheme = {
  '--token-chroma-scale-low': '0.9',
  '--token-chroma-scale': '1.1',
  '--token-chroma-scale-high': '1.2',
  '--token-text':
    'oklch(from light-dark(var(--blue-1100), var(--blue-600)) l calc(c * var(--token-chroma-scale)) h)',
  '--token-comment': 'var(--text-tertiary)',
  '--token-punctuation':
    'color-mix(in oklch, var(--token-text) 55%, var(--text-secondary))',
  '--token-operator': 'var(--text-secondary)',
  '--token-keyword':
    'oklch(from light-dark(var(--blue-900), var(--blue-700)) l calc(c * var(--token-chroma-scale)) h)',
  '--token-function':
    'oklch(from light-dark(var(--pink-1000), var(--pink-600)) l calc(c * var(--token-chroma-scale-high)) h)',
  '--token-type':
    'color-mix(in oklch, var(--token-keyword) 60%, var(--token-function))',
  '--token-string':
    'oklch(from light-dark(var(--green-1100), var(--green-900)) l calc(c * var(--token-chroma-scale-low)) h)',
  '--token-number':
    'oklch(from var(--orange-1100) l calc(c * var(--token-chroma-scale)) h)',
};
