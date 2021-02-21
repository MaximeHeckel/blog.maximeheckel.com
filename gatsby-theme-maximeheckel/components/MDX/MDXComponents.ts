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
import {
  BranchPreview,
  CodeValidation,
  E2ETest,
  FeatureFlags,
  IntegrationTest,
  UnitTest,
} from './custom/MicroAnimations/CICD';
import { SEOAnimation } from './custom/MicroAnimations/SEO';
import {
  DockerBuild,
  PreviewDeploy,
} from './custom/MicroAnimations/PreviewDeploy';
import { SlidingWindow } from './custom/MicroAnimations/ReactSwift';

// Widgets (used in blog post for interactive experiences)
import ClipboardAnimationDetails from './custom/Widgets/ClipboardAnimationDetails';
import Orchestration from './custom/Widgets/Orchestration';
import ThemePicker from './custom/Widgets/ThemePicker';
import HeartRateWidget from './custom/Widgets/HeartRateWidget';
import HSLAShowcase from './custom/Widgets/HSLAShowcase';
import PaletteGenerator from './custom/Widgets/PaletteGenerator';
import AnimationTypes from './custom/Widgets/AnimationTypes';

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
