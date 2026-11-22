import { StyledInlineCode } from './InlineCode.styles';
import { InlineCodeProps } from './InlineCode.types';

const InlineCode = (props: InlineCodeProps) => {
  return <StyledInlineCode>{props.children}</StyledInlineCode>;
};

export default InlineCode;
