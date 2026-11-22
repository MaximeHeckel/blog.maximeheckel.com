export const spanToCSSValue = (span?: number | 'auto') => {
  if (!span) {
    return undefined;
  }

  return span === 'auto' ? 'auto' : `span ${span}/span ${span}`;
};
