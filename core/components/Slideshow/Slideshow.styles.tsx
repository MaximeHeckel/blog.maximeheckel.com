import { styled } from '@maximeheckel/design-system';

export const GalleryContainer = styled('div', {
  position: 'relative',
  width: '100%',
  overflow: 'visible',
});

export const ImageTrack = styled('div', {
  display: 'flex',
  height: '100%',
  gap: '12px',
});

export const ImageSlide = styled('button', {
  minWidth: '100%',
  height: '100%',
  cursor: 'pointer',
  border: 'none',
  background: 'none',
  outline: 'none',
  padding: 0,
  '&[data-current="true"]': {
    cursor: 'default',
  },

  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover', // Forces image to cover the entire container
    objectPosition: 'center', // Centers the image
    borderRadius: 'var(--border-radius-3)',
    border: '2px solid var(--border-color)',
  },
});

export const IndicatorWrapper = styled('div', {
  '--thickness': '1.0px',

  padding: 'var(--thickness)',
  overflow: 'hidden',
  backdropFilter: 'blur(2px)',
  width: 'max-content',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

export const IndicatorContainer = styled('div', {
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  borderRadius: 'var(--border-radius-2)',
  padding: '10px',
  width: 'fit-content',
  position: 'relative',
  margin: 0,
});

export const Indicator = styled('div', {
  '--dot-size': '10px',
  height: 'var(--dot-size)',
  backgroundColor: 'var(--gray-900)',
  borderRadius: 'var(--border-radius-2)',
  transition: 'all 0.4s ease-in-out',

  variants: {
    active: {
      true: {
        width: 'calc(var(--dot-size) * 3.5)',
        cursor: 'default',
      },
      false: {
        cursor: 'pointer',
        width: 'var(--dot-size)',
        opacity: 0.5,
      },
    },
  },
});
