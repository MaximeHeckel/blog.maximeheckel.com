import ComponentOrText from '../ComponentOrText';
import { StyledContent } from './Details.styles';
import { ContentProps } from './Details.types';

const Content = (props: ContentProps) => {
  const { children } = props;

  return (
    <StyledContent>
      <ComponentOrText variant="secondary">{children}</ComponentOrText>
    </StyledContent>
  );
};

Content.displayName = 'Content';

export default Content;
