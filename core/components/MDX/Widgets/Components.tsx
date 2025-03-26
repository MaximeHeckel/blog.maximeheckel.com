import { styled } from '@maximeheckel/design-system';

export const TransitionGridWrapper = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gridGap: '32px',

  '@media (max-width: 950px)': {
    padding: '0',
  },

  '> div': {
    width: '100%',
    maxWidth: '400px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
});

export const AnimationCardContent = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-around',
  height: '475px',
  padding: '12px 0px',
});

export const HighlightedValue = styled('div', {
  borderRadius: 'var(--border-radius-0)',
  backgroundColor: 'var(--emphasis)',
  color: 'var(--accent)',
  border: '1px solid var(--accent)',
  padding: '1px 3px',
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--font-size-1)',
  display: 'inline-flex',
  justifyContent: 'center',
  lineHeight: '1rem',
  marginLeft: '4px',
});

export const Wrapper = styled('div', {
  margin: '30px 0px',

  '@media (min-width: 1100px)': {
    position: 'relative',
    maxWidth: '1000px',
    width: 'calc(100% + 300px)',
    margin: '30px -150px',
  },
});

export const Form = styled('form', {
  margin: '20px 0',
  width: '70%',
  zIndex: '1',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  fontSize: '14px',

  label: {
    marginBottom: '8px',
  },

  input: {
    marginBottom: '24px',
  },

  select: {
    border: '1px solid var(--accent)',
    boxShadow: 'none',
    backgroundColor: 'var(--emphasis)',
    color: 'var(--accent)',
    height: '30px',
    borderRadius: 'var(--border-radius-0)',
    padding: '5px',
  },
});
