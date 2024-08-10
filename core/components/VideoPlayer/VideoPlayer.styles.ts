import { styled } from '@maximeheckel/design-system';

export const Video = styled('video', {
  width: '100%',
  height: '100%',
  display: 'block',
  objectFit: 'cover',
});

export const VideoContainer = styled('figure', {
  position: 'relative',
  margin: '0 auto',
  background: 'var(--foreground)',
  borderRadius: 'var(--border-radius-3)',
  border: '2px solid var(--border-color)',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  transform: 'scale(1) translateZ(0)',
});
