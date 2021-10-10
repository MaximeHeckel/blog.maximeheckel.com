import { StyledInlineCode } from './Styles';
import { InlineCodeProps } from './types';

const InlineCode = (props: InlineCodeProps) => {
  return <StyledInlineCode>{props.children}</StyledInlineCode>;
};

export default InlineCode;
