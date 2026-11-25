// Keep the experiment off in dev and production deployments.
export function shouldInlinePanda() {
  return (
    process.env.NODE_ENV !== 'development' &&
    process.env.VERCEL_ENV !== 'production' &&
    (process.env.BLOG_INLINE_PANDA_CSS === '1' ||
      (process.env.VERCEL_ENV === 'preview' &&
        process.env.VERCEL_GIT_COMMIT_REF === 'codex/panda-inline-refresh'))
  );
}

export const inlinePandaPath = 'styled-system/inline-panda.css';
