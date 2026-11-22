import { styled } from 'lib/stitches.config';

export const Root = styled('div', {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'var(--space-7)',
});

export const Stage = styled('div', {
  width: '100%',
  aspectRatio: '3 / 2',
  position: 'relative',
});

export const Frame = styled('div', {
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  overflow: 'hidden',
  borderRadius: 'var(--border-radius-2, 8px)',
  background: 'var(--gray-300)',
  boxShadow: '0 2px 4px rgb(0 0 0 / 4%), 0 12px 24px -12px rgb(0 0 0 / 20%)',
  '& > *': {
    width: '100%',
    height: '100%',
    display: 'block',
    objectFit: 'cover',
  },
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
});

export const Controls = styled('div', {
  display: 'inline-flex',
  gap: 'var(--space-1)',
  padding: 'var(--space-1)',
  borderRadius: 'var(--border-radius-2, 8px)',
  background: 'var(--gray-300)',
  boxShadow: 'inset 0 1px 2px rgb(0 0 0 / 3%)',
});

export const Option = styled('label', {
  width: '40px',
  height: '36px',
  position: 'relative',
  display: 'grid',
  placeItems: 'center',
  color: 'var(--text-tertiary)',
  cursor: 'pointer',
  '& input': {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    height: '100%',
    margin: 0,
    cursor: 'inherit',
  },
  '& .surface': {
    pointerEvents: 'none',
    position: 'absolute',
    inset: 0,
    borderRadius: '6px',
    transition: 'background 180ms, box-shadow 180ms',
  },
  '& input:checked + .surface': {
    background: 'var(--input-background)',
    boxShadow: '0 1px 4px rgb(0 0 0 / 10%)',
  },
  '& input:focus-visible + .surface': {
    outline: '2px solid var(--input-focus)',
    outlineOffset: '2px',
  },
  '& svg': { position: 'relative', pointerEvents: 'none' },
  '& input:checked ~ svg': { color: 'var(--text-primary)' },
  '&:has(input:disabled)': { opacity: 0.4, cursor: 'not-allowed' },
  '@media (prefers-reduced-motion: reduce)': {
    '& .surface': { transition: 'none' },
  },
});
