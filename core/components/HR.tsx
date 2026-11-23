import { styled } from 'styled-system/jsx';

import Box from '@core/components/Box';

export const HR = styled(Box, {
  base: {
    width: '100%',
    height: '1px',
    border: 'none',
    backgroundColor: 'var(--border-color)',
  },
});
