import styled from '@emotion/styled';
import { CardWrapperProps } from './types';

const DEFAULT_TAG = 'div';

export const CardWrapper = styled(DEFAULT_TAG)<CardWrapperProps>`
  position: relative;
  background: ${(p) =>
    p.glass
      ? 'var(--maximeheckel-colors-foreground)'
      : 'var(--maximeheckel-card-background-color)'};
  backdrop-filter: ${(p) => (p.glass ? 'blur(6px)' : '')};
  border-radius: var(--border-radius-2);
  box-shadow: ${(p) =>
    p.depth === 0 ? 'none' : `var(--maximeheckel-shadow-${p.depth || '1'})`};
  border: 1px solid var(--maximeheckel-border-color);
  overflow: hidden;
`;

export const CardHeader = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: var(--border-radius-1);
  border-top-right-radius: var(--border-radius-1);
  min-height: 50px;
  padding: 0px 24px;
  color: var(--maximeheckel-colors-typeface-tertiary);
  font-weight: 500;
  border-bottom: 1px solid var(--maximeheckel-colors-emphasis);
  font-size: 16px;
`;

export const CardBody = styled('div')`
  padding: 36px 24px;
  position: relative;
  overflow: hidden;
`;
