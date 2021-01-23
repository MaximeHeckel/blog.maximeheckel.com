// External
import { Tweet } from 'mdx-embed';

// Components
import Button from '@theme/components/Button';
import Pill from '@theme/components/Pill';

// MDX only components
import Callout from './Callout';
import { Blockquote } from './Blockquote';
import { Code, InlineCode } from './Code';
import Image from './Image';
import VideoPlayer from './VideoPlayer';

// Custom components (used in blog posts)
import AnimationTypes from './custom/FramerGuide/AnimationTypes';
import ClipboardAnimationDetails from './custom/FramerGuide/ClipboardAnimationDetails';
import Orchestration from './custom/FramerGuide/Orchestration';
import HeartRateWidget from './custom/HeartRateWidget';
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

const customComponents = {
  AnimationTypes,
  ClipboardAnimationDetails,
  Orchestration,
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

export const MDXComponents = {
  Button,
  blockquote: Blockquote,
  Callout,
  Image,
  inlineCode: InlineCode,
  Pill,
  pre: Code,
  VideoPlayer,
  Tweet,
  ...customComponents,
};
