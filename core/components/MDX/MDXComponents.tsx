import dynamic from 'next/dynamic';

// Components
import Anchor from '@theme/components/Anchor';
import Blockquote from '@theme/components/Blockquote';
import Button from '@theme/components/Button';
import Callout from '@theme/components/Callout';
import Card from '@theme/components/Card';
import Code from '@theme/components/Code';
import InlineCode from '@theme/components/InlineCode';
import List from '@theme/components/List';
import Pill from '@theme/components/Pill';
import VideoPlayer from '@theme/components/VideoPlayer';

// MDX only components
import Image from './Image';

// Widgets (used in blog post for interactive experiences)
const ClipboardAnimationDetails = dynamic(
  () => import('./Widgets/ClipboardAnimationDetails')
);
const HeartRateWidget = dynamic(() => import('./Widgets/HeartRateWidget'));
const SEOStats = dynamic(() => import('./Widgets/SEOStats'));
const FramerMotionPropagation = dynamic(
  () => import('./Widgets/FramerMotionPropagation')
);
const FramerMotionAnimationLayout = dynamic(
  () => import('./Widgets/FramerMotionAnimationLayout')
);
const FramerMotionAnimatePresence = dynamic(
  () => import('./Widgets/FramerMotionAnimatePresence')
);
const SpringPhysics = dynamic(() => import('./Widgets/SpringPhysics'));
const HighlightSection = dynamic(() => import('./Widgets/HighlightSection'));
const AnimationTypes = dynamic(() => import('./Widgets/AnimationTypes'));
const Orchestration = dynamic(() => import('./Widgets/Orchestration'));
const ThemePicker = dynamic(() => import('./Widgets/ThemePicker'));
const HSLAShowcase = dynamic(() => import('./Widgets/HSLAShowcase'));
const PaletteGenerator = dynamic(() => import('./Widgets/PaletteGenerator'));
const ScrollSpyWidget = dynamic(() => import('./Widgets/ScrollSpyWidget'), {
  ssr: false,
  // eslint-disable-next-line react/display-name
  loading: () => <div style={{ width: '100%', height: '705px' }} />,
});
const OpenAIPlayground = dynamic(() => import('./Widgets/OpenAIPlayground'));
const CubicBezierVisualizer = dynamic(
  () => import('./Widgets/CubicBezierVisualizer')
);
const BezierCurve = dynamic(() => import('./Widgets/BezierCurve'));

const customComponents = {
  AnimationTypes,
  ClipboardAnimationDetails,
  HSLAShowcase,
  Orchestration,
  PaletteGenerator,
  ThemePicker,
  HeartRateWidget,
  Card,
  CardBody: Card.Body,
  ScrollSpyWidget,
  SEOStats,
  SpringPhysics,
  HighlightSection,
  FramerMotionPropagation,
  FramerMotionAnimatePresence,
  FramerMotionAnimationLayout,
  OpenAIPlayground,
  CubicBezierVisualizer,
  BezierCurve,
};

const MDXComponents = {
  // Replace the default anchor tag by the Anchor component with underline set to true: this is the default link
  // eslint-disable-next-line react/display-name
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <Anchor underline {...props} />
  ),
  Anchor,
  Button,
  blockquote: Blockquote,
  Callout,
  Image,
  inlineCode: InlineCode,
  li: List.Item,
  // eslint-disable-next-line react/display-name
  ol: (props: React.OlHTMLAttributes<HTMLOListElement>) => (
    <List variant="ordered" {...props} />
  ),
  Pill,
  pre: Code,
  ul: List,
  VideoPlayer,
  ...customComponents,
};

export default MDXComponents;
