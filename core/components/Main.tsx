import { styled } from '@maximeheckel/design-system';
import { ComponentProps } from 'react';

import { BrowserEdges } from './BrowserEdges';

const MainContainer = styled('main', {
  isolation: 'isolate',
  backgroundColor: 'var(--gray-000)',
  boxShadow: '0 0 128px 24px rgba(0, 0, 0, 0.8)',
});

export const Main = ({
  children,
  ...props
}: ComponentProps<typeof MainContainer>) => (
  <MainContainer {...props}>
    <BrowserEdges />
    {children}
  </MainContainer>
);
