import styled from '@emotion/styled';
import { InlineCodeProps } from './types';

const InlineCode = (props: InlineCodeProps) => {
  return <InlineCodeWrapper>{props.children}</InlineCodeWrapper>;
};

export default InlineCode;

const InlineCodeWrapper = styled('code')`
  border-radius: var(--border-radius-1);
  background-color: var(--maximeheckel-colors-emphasis);
  color: var(--maximeheckel-colors-brand);
  padding-top: 2px;
  padding-bottom: 2px;
  padding-left: 6px;
  padding-right: 6px;
  font-size: 16px;
  font-weight: 400 !important;
`;
