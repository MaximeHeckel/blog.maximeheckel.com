import { styled } from 'lib/stitches.config';

const glassMaterialPrimitives = {
  'background-color': 'oklch(from var(--gray-900) l c h / var(--opacity, 0.3))',
  'backdrop-filter': 'blur(var(--blur, 12px)) saturate(var(--saturate, 1.15))',
  border:
    'var(--thickness, 1px) solid oklch(from var(--gray-1100) l c h / 15%)',
};

const GlassMaterial = styled('div', {
  borderRadius: 'inherit',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: glassMaterialPrimitives['background-color'],
  zIndex: -10,
  backdropFilter: glassMaterialPrimitives['backdrop-filter'],
  pointerEvents: 'none',

  variants: {
    border: {
      true: {
        border: glassMaterialPrimitives.border,
      },
      false: {
        border: 'none',
      },
    },
  },

  defaultVariants: {
    border: true,
  },
});

export { GlassMaterial, glassMaterialPrimitives };
