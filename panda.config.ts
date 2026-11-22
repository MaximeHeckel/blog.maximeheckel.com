import { defineConfig } from '@pandacss/dev';

export default defineConfig({
  include: [
    './core/components/DesignPilot/**/*.{ts,tsx}',
    './core/components/Button/Button.recipe.ts',
    './core/components/Slider/SliderRoot.recipe.ts',
    './pages/design.tsx',
  ],
  jsxFramework: 'react',
  jsxStyleProps: 'minimal',
  hash: { className: true, cssVar: false },
  preflight: false,
  outdir: 'styled-system',
});
