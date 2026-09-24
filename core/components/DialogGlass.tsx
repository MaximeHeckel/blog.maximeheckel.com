import { GlassMaterial, styled } from '@maximeheckel/design-system';

export const CustomGlassMaterial = styled(GlassMaterial, {
  'background-color':
    'oklch(from var(--gray-300) l c h / var(--opacity, 0.75))',
  'backdrop-filter': 'blur(var(--blur, 6px)) saturate(var(--saturate, 1.15))',
  border:
    'var(--thickness, 1px) solid oklch(from var(--gray-900) l c h / 15%) !important',
});
