import dynamic from 'next/dynamic';

// Components
import {
  Anchor,
  Blockquote,
  Button,
  Callout,
  Card,
  InlineCode,
  List,
  Pill,
  Text,
  EM,
  H2,
  H3,
  Strong,
} from '@maximeheckel/design-system';
import Code from '@theme/components/Code';
import VideoPlayer from '@theme/components/VideoPlayer';

// MDX only components
import Image from './Image';

// Widgets (used in blog post for interactive experiences)
const ClipboardAnimationDetails = dynamic(
  () => import('./Widgets/GuideToFramerMotion/ClipboardAnimationDetails')
);
const HeartRateWidget = dynamic(() => import('./Widgets/HeartRateWidget'));
const SEOStats = dynamic(() => import('./Widgets/SEOStats'));
const FramerMotionPropagation = dynamic(
  () => import('./Widgets/AdvancedFramerMotion/FramerMotionPropagation')
);
const FramerMotionAnimationLayout = dynamic(
  () => import('./Widgets/AdvancedFramerMotion/FramerMotionAnimationLayout')
);
const FramerMotionAnimatePresence = dynamic(
  () => import('./Widgets/AdvancedFramerMotion/FramerMotionAnimatePresence')
);
const SpringPhysics = dynamic(
  () => import('./Widgets/SpringAnimation/SpringPhysics')
);
const HighlightSection = dynamic(
  () => import('./Widgets/Scrollspy/HighlightSection')
);
const AnimationTypes = dynamic(
  () => import('./Widgets/GuideToFramerMotion/AnimationTypes')
);
const Orchestration = dynamic(
  () => import('./Widgets/GuideToFramerMotion/Orchestration')
);
const ThemePicker = dynamic(
  () => import('./Widgets/CSSComposition/ThemePicker')
);
const HSLAShowcase = dynamic(
  () => import('./Widgets/CSSComposition/HSLAShowcase')
);
const PaletteGenerator = dynamic(
  () => import('./Widgets/CSSComposition/PaletteGenerator')
);
const ScrollSpyWidget = dynamic(
  () => import('./Widgets/Scrollspy/ScrollSpyWidget'),
  {
    ssr: false,
    // eslint-disable-next-line react/display-name
    loading: () => <div style={{ width: '100%', height: '705px' }} />,
  }
);
const OpenAIPlayground = dynamic(() => import('./Widgets/OpenAIPlayground'));
const CubicBezierVisualizer = dynamic(
  () => import('./Widgets/CubicBezierVisualizer')
);
const BezierCurve = dynamic(() => import('./Widgets/BezierCurve'));

const VaporwaveThreejsSandpacks = dynamic(
  () => import('./Widgets/VaporwaveThreejs/Sandpack')
);

const VaporwaveThreejsDisclaimer = dynamic(
  () => import('./Widgets/VaporwaveThreejs/CalloutGPUTier')
);

const FramerMotionLayoutAnimationsBasic = dynamic(
  () => import('./Widgets/FramerMotionLayoutAnimations/Basic')
);

const FramerMotionDistortions = dynamic(
  () => import('./Widgets/FramerMotionLayoutAnimations/Distortions')
);

const FramerMotionLayoutAnimationsLayoutProp = dynamic(
  () => import('./Widgets/FramerMotionLayoutAnimations/LayoutProp')
);

const FramerMotionLayoutAnimationsLayoutPosition = dynamic(
  () => import('./Widgets/FramerMotionLayoutAnimations/LayoutPosition')
);

const FramerMotionLayoutAnimationsSharedLayoutAnimationDetails = dynamic(
  () =>
    import(
      './Widgets/FramerMotionLayoutAnimations/SharedLayoutAnimationDetails'
    )
);

const FramerMotionLayoutAnimationListLayoutGroup = dynamic(
  () => import('./Widgets/FramerMotionLayoutAnimations/ListLayoutGroup')
);

const FramerMotionLayoutAnimationsTabsLayoutGroup = dynamic(
  () => import('./Widgets/FramerMotionLayoutAnimations/TabsLayoutGroup')
);

const FramerMotionAdvanceReorderExample = dynamic(
  () => import('./Widgets/FramerMotionLayoutAnimations/AdvanceReorderExample')
);

const FramerMotionToastNotificationSandpack = dynamic(
  () => import('./Widgets/FramerMotionLayoutAnimations/SandpackNotification')
);

const FramerMotionTabsSandpack = dynamic(
  () => import('./Widgets/FramerMotionLayoutAnimations/SandpackTabs')
);

const FramerMotionArrowListSandpack = dynamic(
  () => import('./Widgets/FramerMotionLayoutAnimations/SandpackArrowList')
);

const DesignSystemColorTokens = dynamic(
  () => import('./Widgets/DesignSystem/ColorTokens')
);

const DesignSystemMicroInteractionShowcase = dynamic(
  () => import('./Widgets/DesignSystem/MicroInteractionShowcase')
);

const DesignSystemTextShowcase = dynamic(
  () => import('./Widgets/DesignSystem/TextShowcase')
);

const DesignSystemFlexGridShowcase = dynamic(
  () => import('./Widgets/DesignSystem/FlexGridShowcase')
);

const FragmentShaderVisualizer = dynamic(
  () => import('./Widgets/ShaderReactThreeFiber/FragmentShaderVisualizer')
);

const R3FShaderSandpack = dynamic(
  () => import('./Widgets/ShaderReactThreeFiber/Sandpack')
);

const CSSCompositionSandpack = dynamic(
  () => import('./Widgets/CSSComposition/Sandpack')
);

const SpringAnimationSandpack = dynamic(
  () => import('./Widgets/SpringAnimation/Sandpack')
);

const ScrollSpySandpack = dynamic(() => import('./Widgets/Scrollspy/Sandpack'));

const GuideToFramerMotionSandpack = dynamic(
  () => import('./Widgets/GuideToFramerMotion/Sandpack')
);

const AdvancedFramerMotionSandpack = dynamic(
  () => import('./Widgets/AdvancedFramerMotion/Sandpack')
);

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
  VaporwaveThreejsDisclaimer,
  FramerMotionLayoutAnimationsBasic,
  FramerMotionDistortions,
  FramerMotionLayoutAnimationsLayoutProp,
  FramerMotionLayoutAnimationsLayoutPosition,
  FramerMotionLayoutAnimationsSharedLayoutAnimationDetails,
  FramerMotionLayoutAnimationsTabsLayoutGroup,
  FramerMotionLayoutAnimationListLayoutGroup,
  FramerMotionAdvanceReorderExample,
  DesignSystemColorTokens,
  DesignSystemMicroInteractionShowcase,
  DesignSystemTextShowcase,
  DesignSystemFlexGridShowcase,
  FragmentShaderVisualizer,
  // Sandpacks
  CSSCompositionSandpack,
  ScrollSpySandpack,
  SpringAnimationSandpack,
  GuideToFramerMotionSandpack,
  AdvancedFramerMotionSandpack,
  FramerMotionToastNotificationSandpack,
  FramerMotionTabsSandpack,
  FramerMotionArrowListSandpack,
  VaporwaveThreejsSandpacks,
  R3FShaderSandpack,
};

const MDXComponents = {
  // Replace the default anchor tag by the Anchor component with underline set to true: this is the default link
  a: function A(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
    return <Anchor underline {...props} />;
  },
  Anchor,
  Button,
  blockquote: Blockquote,
  Callout,
  em: EM,
  h2: H2,
  h3: H3,
  Image,
  code: InlineCode,
  li: List.Item,
  ol: function OL(props: React.OlHTMLAttributes<HTMLOListElement>) {
    return <List variant="ordered" {...props} />;
  },
  p: function P(props: React.HTMLAttributes<HTMLParagraphElement>) {
    return <Text as="p" {...props} />;
  },
  Pill,
  pre: Code,
  strong: Strong,
  ul: function UL(props: React.HTMLAttributes<HTMLUListElement>) {
    return <List variant="unordered" {...props} />;
  },
  VideoPlayer,
  ...customComponents,
};

export default MDXComponents;
