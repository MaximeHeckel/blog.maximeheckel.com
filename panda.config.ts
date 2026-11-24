import { defineConfig } from '@pandacss/dev';

import { globalStyles } from './lib/globalStyles';

export default defineConfig({
  include: ['./{core,pages,lib}/**/*.{ts,tsx}'],
  globalCss: globalStyles,
  jsxFramework: 'react',
  jsxStyleProps: 'minimal',
  jsxMatchTag: [{ tag: /.+/ }],
  hash: { className: true, cssVar: false },
  preflight: false,
  outdir: 'styled-system',
});
