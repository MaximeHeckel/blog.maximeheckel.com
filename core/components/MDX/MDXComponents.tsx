import dynamic from 'next/dynamic';

// Components
import Button from '@theme/components/Button';
import Pill from '@theme/components/Pill';

// MDX only components
import Callout from './Callout';
import { Blockquote } from './Blockquote';
import InlineCode from './InlineCode';
import Code from './Code';
import Image from './Image';
import VideoPlayer from './VideoPlayer';
import { ListItem } from './MDX';

// Custom components (used in blog posts)
import Card from './custom/Card';

const BranchPreview = dynamic<{}>(() =>
  import('./custom/MicroAnimations/CICD').then((module) => module.BranchPreview)
);
const CodeValidation = dynamic<{}>(() =>
  import('./custom/MicroAnimations/CICD').then(
    (module) => module.CodeValidation
  )
);
const E2ETest = dynamic<{}>(() =>
  import('./custom/MicroAnimations/CICD').then((module) => module.E2ETest)
);
const FeatureFlags = dynamic<{}>(() =>
  import('./custom/MicroAnimations/CICD').then((module) => module.FeatureFlags)
);
const IntegrationTest = dynamic<{}>(() =>
  import('./custom/MicroAnimations/CICD').then(
    (module) => module.IntegrationTest
  )
);
const UnitTest = dynamic<{}>(() =>
  import('./custom/MicroAnimations/CICD').then((module) => module.UnitTest)
);
const SEOAnimation = dynamic<{}>(() =>
  import('./custom/MicroAnimations/SEO').then((module) => module.SEOAnimation)
);
const PreviewDeploy = dynamic<{}>(() =>
  import('./custom/MicroAnimations/PreviewDeploy').then(
    (module) => module.PreviewDeploy
  )
);
const DockerBuild = dynamic<{}>(() =>
  import('./custom/MicroAnimations/PreviewDeploy').then(
    (module) => module.DockerBuild
  )
);
const SlidingWindow = dynamic<{}>(() =>
  import('./custom/MicroAnimations/ReactSwift').then(
    (module) => module.SlidingWindow
  )
);
// Widgets (used in blog post for interactive experiences)

const ClipboardAnimationDetails = dynamic(
  () => import('./custom/Widgets/ClipboardAnimationDetails')
);
const HeartRateWidget = dynamic(
  () => import('./custom/Widgets/HeartRateWidget')
);
const SEOStats = dynamic(() => import('./custom/Widgets/SEOStats'));
const FramerMotionPropagation = dynamic(
  () => import('./custom/Widgets/FramerMotionPropagation')
);
const FramerMotionAnimationLayout = dynamic(
  () => import('./custom/Widgets/FramerMotionAnimationLayout')
);
const FramerMotionAnimatePresence = dynamic(
  () => import('./custom/Widgets/FramerMotionAnimatePresence')
);
const SpringPhysics = dynamic(() => import('./custom/Widgets/SpringPhysics'));
const HighlightSection = dynamic(
  () => import('./custom/Widgets/HighlightSection')
);
const AnimationTypes = dynamic(() => import('./custom/Widgets/AnimationTypes'));
const Orchestration = dynamic(() => import('./custom/Widgets/Orchestration'));
const ThemePicker = dynamic(() => import('./custom/Widgets/ThemePicker'));
const HSLAShowcase = dynamic(() => import('./custom/Widgets/HSLAShowcase'));
const PaletteGenerator = dynamic(
  () => import('./custom/Widgets/PaletteGenerator')
);
const ScrollSpyWidget = dynamic(
  () => import('./custom/Widgets/ScrollSpyWidget'),
  {
    ssr: false,
    // eslint-disable-next-line react/display-name
    loading: () => <div style={{ width: '100%', height: '705px' }} />,
  }
);

const customComponents = {
  AnimationTypes,
  ClipboardAnimationDetails,
  HSLAShowcase,
  Orchestration,
  PaletteGenerator,
  ThemePicker,
  HeartRateWidget,
  BranchPreview,
  CodeValidation,
  E2ETest,
  FeatureFlags,
  IntegrationTest,
  UnitTest,
  Card,
  SEOAnimation,
  DockerBuild,
  PreviewDeploy,
  SlidingWindow,
  ScrollSpyWidget,
  SEOStats,
  SpringPhysics,
  HighlightSection,
  FramerMotionPropagation,
  FramerMotionAnimatePresence,
  FramerMotionAnimationLayout,
};

const MDXComponents = {
  Button,
  blockquote: Blockquote,
  Callout,
  Image,
  inlineCode: InlineCode,
  li: ListItem,
  Pill,
  pre: Code,
  VideoPlayer,
  ...customComponents,
};

export default MDXComponents;
