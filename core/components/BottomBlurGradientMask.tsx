import { Box } from '@maximeheckel/design-system';

const BottomBlurGradientMask = () => (
  <Box
    css={{
      height: 96,
      width: '100%',
      transition: 'background 0.3s ease-in-out',
      background: 'oklch(from var(--background) l c h / 90%)',
      transform: 'translateZ(0)',
      willChange: 'transform',
      position: 'fixed',
      bottom: 0,
      right: 0,
      zIndex: 1,
      isolation: 'isolate',
      pointerEvents: 'none',
      backdropFilter: 'blur(4px)',
      maskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, black 100%)',
    }}
  />
);

export { BottomBlurGradientMask };
