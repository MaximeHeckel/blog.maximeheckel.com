import { Box, styled } from '@maximeheckel/design-system';

export const HR = styled(Box, {
  width: '100%',
  height: '1px',
  border: 'none',
  backgroundImage:
    'linear-gradient(to right,var(--border-color) 50%, var(--background) 0)',
  backgroundSize: '8px 1px',
  backgroundRepeat: 'repeat-x',
  marginTop: '0.25rem',
});
