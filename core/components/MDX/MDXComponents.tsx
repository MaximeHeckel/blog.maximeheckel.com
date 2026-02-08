// Components
import {
  Anchor,
  Blockquote,
  Button,
  Card,
  Details,
  InlineCode,
  List,
  Pill,
  Text,
  EM,
  Strong,
} from '@maximeheckel/design-system';
import dynamic from 'next/dynamic';

import BeforeAfterImage from '@core/components/BeforeAfterImage';
import Callout from '@core/components/Callout';
import Code from '@core/components/Code';
import { FootnoteRef, FootnotesList } from '@core/components/Footnotes';
import Fullbleed from '@core/components/Fullbleed';
import H2 from '@core/components/H2';
import VideoPlayer from '@core/components/VideoPlayer';

import SupportCallout from '../Callout/SupportCallout';
// MDX only components
import Image from './Image';

// Widgets (used in blog post for interactive experiences)
const ClipboardAnimationDetails = dynamic(
  () => import('./Widgets/GuideToFramerMotion/ClipboardAnimationDetails')
);

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
    import('./Widgets/FramerMotionLayoutAnimations/SharedLayoutAnimationDetails')
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

const AttributesVisualizer = dynamic(
  () => import('./Widgets/ParticlesReactThreeFiber/AttributesVisualizer')
);

const ParticlesShaderSandpack = dynamic(
  () => import('./Widgets/ParticlesReactThreeFiber/Sandpack')
);

const RGBShiftVisualizer = dynamic(
  () =>
    import('./Widgets/RefractionDispersionReactThreeFiber/RGBShiftVisualizer')
);

const ColorChannelSummary = dynamic(
  () =>
    import('./Widgets/RefractionDispersionReactThreeFiber/ColorChannelSummary')
);

const CosineSimilarity = dynamic(
  () => import('./Widgets/SemanticSearch/CosineSimilarity')
);

const Formatting = dynamic(() => import('./Widgets/SemanticSearch/Formatting'));

const DemoSearch = dynamic(() => import('./Widgets/SemanticSearch/DemoSearch'));

const DemoButton = dynamic(() => import('./Widgets/SemanticSearch/DemoButton'));

const RaymarchingVisualizer = dynamic(
  () => import('./Widgets/Raymarching/RaymarchingVisualizer')
);

const VolumetricRaymarchingVisualizer = dynamic(
  () => import('./Widgets/Raymarching/VolumetricRaymarchingVisualizer')
);

const SobelVisualizer = dynamic(
  () => import('./Widgets/Moebius/SobelVisualizer')
);

const ShadingVisualizer = dynamic(
  () => import('./Widgets/Moebius/ShadingVisualizer')
);

const DitheringVisualizer = dynamic(
  () => import('./Widgets/Retro/DitheringVisualizer')
);

const QuantizationVisualizer = dynamic(
  () => import('./Widgets/Retro/QuantizationVisualizer')
);

const KuwaharaVisualizer = dynamic(
  () => import('./Widgets/PainterlyShaders/KuwaharaVisualizer')
);

const KernelVisualizer = dynamic(
  () => import('./Widgets/PainterlyShaders/KernelVisualizer')
);

const PixelizationVisualizer = dynamic(
  () => import('./Widgets/PostProcessing/PixelizationVisualizer')
);

const ThresholdVisualizer = dynamic(
  () => import('./Widgets/PostProcessing/ThresholdVisualizer')
);

const GridDotsDemo = dynamic(() =>
  import('./Widgets/Halftone/GridDotsDemo').then((mod) => mod.GridDotsDemo)
);

const MoireDemo = dynamic(() =>
  import('./Widgets/Halftone/MoireDemo').then((mod) => mod.MoireDemo)
);

const RingDemo = dynamic(() =>
  import('./Widgets/Halftone/RingDemo').then((mod) => mod.RingDemo)
);

const CMYKHalftoneDemo = dynamic(() =>
  import('./Widgets/Halftone/CMYKHalftoneDemo').then(
    (mod) => mod.CMYKHalftoneDemo
  )
);

const GooeyDemo = dynamic(() =>
  import('./Widgets/Halftone/GooeyDemo').then((mod) => mod.GooeyDemo)
);

const PatternDemo = dynamic(() =>
  import('./Widgets/Halftone/PatternDemo').then((mod) => mod.PatternDemo)
);

const SimpleGridDemo = dynamic(() =>
  import('./Widgets/Halftone/SimpleGridDemo').then((mod) => mod.SimpleGridDemo)
);

const ColorBlending = dynamic(() =>
  import('./Widgets/Halftone/ColorBlending').then((mod) => mod.ColorBlending)
);

const Reflectance = dynamic(() =>
  import('./Widgets/Halftone/Reflectance').then((mod) => mod.Reflectance)
);

const WhiteDots = dynamic(() =>
  import('./Widgets/Halftone/WhiteDots').then((mod) => mod.WhiteDots)
);

const RefractionDispersionSandpack = dynamic(
  () => import('./Widgets/RefractionDispersionReactThreeFiber/Sandpack')
);

const RenderTargetsSandpack = dynamic(
  () => import('./Widgets/RenderTargetsReactThreeFiber/Sandpack')
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

const RaymarchingSandpack = dynamic(
  () => import('./Widgets/Raymarching/Sandpack')
);

const CausticsSandpack = dynamic(() => import('./Widgets/Caustics/Sandpack'));

const MoebiusSandpack = dynamic(() => import('./Widgets/Moebius/Sandpack'));

const RetroSandpack = dynamic(() => import('./Widgets/Retro/Sandpack'));

const KuwaharaSandpack = dynamic(
  () => import('./Widgets/PainterlyShaders/Sandpack')
);

const PostProcessingSandpack = dynamic(
  () => import('./Widgets/PostProcessing/Sandpack')
);

const VolumetricLightingSandpack = dynamic(
  () => import('./Widgets/VolumetricLighting/Sandpack')
);

const SimpleCompute = dynamic(
  () => import('./Widgets/TSLWebGPU/SimpleCompute')
);

const EffectCompute = dynamic(
  () => import('./Widgets/TSLWebGPU/EffectCompute')
);

const ParticleCompute = dynamic(
  () => import('./Widgets/TSLWebGPU/ParticleCompute')
);

const TSLWebGPUSandpack = dynamic(() => import('./Widgets/TSLWebGPU/Sandpack'));

const HalftoneSandpack = dynamic(() => import('./Widgets/Halftone/Sandpack'));

const Slideshow = dynamic(() => import('../Slideshow'));

const customComponents = {
  AnimationTypes,
  ClipboardAnimationDetails,
  HSLAShowcase,
  Orchestration,
  PaletteGenerator,
  ThemePicker,
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
  AttributesVisualizer,
  RGBShiftVisualizer,
  ColorChannelSummary,
  CosineSimilarity,
  Formatting,
  DemoSearch,
  DemoButton,
  RaymarchingVisualizer,
  VolumetricRaymarchingVisualizer,
  BeforeAfterImage,
  SobelVisualizer,
  ShadingVisualizer,
  DitheringVisualizer,
  QuantizationVisualizer,
  KuwaharaVisualizer,
  KernelVisualizer,
  PixelizationVisualizer,
  ThresholdVisualizer,
  SimpleCompute,
  EffectCompute,
  ParticleCompute,
  GridDotsDemo,
  MoireDemo,
  RingDemo,
  CMYKHalftoneDemo,
  GooeyDemo,
  PatternDemo,
  SimpleGridDemo,
  ColorBlending,
  Reflectance,
  WhiteDots,
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
  ParticlesShaderSandpack,
  RefractionDispersionSandpack,
  RenderTargetsSandpack,
  RaymarchingSandpack,
  CausticsSandpack,
  MoebiusSandpack,
  RetroSandpack,
  KuwaharaSandpack,
  PostProcessingSandpack,
  VolumetricLightingSandpack,
  TSLWebGPUSandpack,
  HalftoneSandpack,
};

const MDXComponents = {
  // Replace the default anchor tag by the Anchor component with underline set to true: this is the default link
  a: function A(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
    return (
      <Anchor external={props.href?.includes('https')} underline {...props} />
    );
  },
  Anchor,
  Button,
  blockquote: Blockquote,
  Callout,
  Details,
  em: EM,
  Fullbleed,
  FootnoteRef,
  FootnotesList,
  h2: H2,
  h3: function H3(props: React.HTMLAttributes<HTMLHeadingElement>) {
    return <Text as="h3" variant="primary" weight="3" {...props} />;
  },
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
  Slideshow,
  SupportCallout,
  VideoPlayer,
  ...customComponents,
};

export default MDXComponents;
