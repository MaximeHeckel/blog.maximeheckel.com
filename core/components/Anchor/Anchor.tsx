import { StyledAnchor } from './Styles';
import { AnchorProps } from './types';
import { getIconString } from './utils';

const Anchor = (props: AnchorProps) => {
  const {
    children,
    href,
    arrow,
    underline,
    favicon,
    discreet,
    ...rest
  } = props;

  const icon = getIconString(href, arrow);

  return (
    <StyledAnchor
      arrow={arrow}
      css={{
        '--icon': `url(${icon})`,
      }}
      discreet={discreet}
      favicon={favicon}
      href={href}
      underline={underline}
      {...rest}
    >
      {children}
    </StyledAnchor>
  );
};

Anchor.displayName = 'Anchor';

export default Anchor;
