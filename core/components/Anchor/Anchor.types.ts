export type ArrowPosition = 'left' | 'right';

interface BaseAnchor extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  as?: React.ElementType;
  /** This prop makes the Anchor component color typography tertiary to blend more with corpus */
  discreet?: boolean;
}

interface UnderlineAnchorProps extends BaseAnchor {
  arrow?: never;
  /** This prop makes the Anchor component render an underline only visible on hover */
  underline?: boolean;
  external?: never;
  favicon?: never;
}
interface ArrowAnchorProps extends BaseAnchor {
  /** This prop makes the Anchor component render an arrow to the left or the right of the text */
  arrow?: ArrowPosition;
  underline?: never;
  external?: never;
  favicon?: never;
}

interface ExternalAnchorProps extends BaseAnchor {
  arrow?: never;
  underline?: boolean;
  /** This prop makes the Anchor component render an external link icon */
  external?: boolean;
  favicon?: never;
}

interface FaviconAnchorProps extends BaseAnchor {
  arrow?: never;
  underline?: never;
  external?: never;
  /** This prop makes the Anchor component render a favicon corresponding to the domain name passed in the href prop (only Twitter and Github are supported) */
  favicon?: boolean;
}

export type AnchorProps =
  | ArrowAnchorProps
  | FaviconAnchorProps
  | UnderlineAnchorProps
  | ExternalAnchorProps;
