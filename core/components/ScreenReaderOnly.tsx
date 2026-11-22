import { styled } from 'lib/stitches.config';

import Box from '@core/components/Box';

export const ScreenReaderOnly = styled(Box, {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: '0',
});
