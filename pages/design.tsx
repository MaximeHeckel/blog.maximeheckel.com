import Anchor from '@theme/components/Anchor';
import Button from '@theme/components/Button';
import Card from '@theme/components/Card';
import Checkbox from '@theme/components/Checkbox';
import Grid from '@theme/components/Grid';
import {
  ContactIcon,
  EnterIcon,
  ExternalIcon,
  PortfolioIcon,
  RSSIcon,
  TwitterIcon,
  ArrowIcon,
  PlayIcon,
  PauseIcon,
  RepeatIcon,
  InfoIcon,
  AlertIcon,
  GithubIcon,
  MapIcon,
  StackIcon,
} from '@theme/components/Icons';
import Blockquote from '@theme/components/Blockquote';
import TextInput from '@theme/components/TextInput';
import Logo from '@theme/components/Logo';
import TextArea from '@theme/components/TextArea';
import Flex from '@theme/components/Flex';
import Glow from '@theme/components/Glow';
import Callout from '@theme/components/Callout';
import List from '@theme/components/List';
import CodeBlock from '@theme/components/Code/CodeBlock';
import InlineCode from '@theme/components/InlineCode';
import Pill from '@theme/components/Pill';
import Radio from '@theme/components/Radio';
import Range from '@theme/components/Range';
import Seo from '@theme/components/Seo';
import Switch from '@theme/components/Switch';
import Tooltip from '@theme/components/Tooltip';
import Tweet from '@theme/components/Tweet';
import Text, {
  EM,
  H1,
  H2,
  Heading,
  Strong,
} from '@theme/components/Typography';
import Layout from '@theme/layout';
import { AnimatePresence } from 'framer-motion';
import { styled, css } from 'lib/stitches.config';
import { getTweets } from 'lib/tweets';
import dynamic from 'next/dynamic';
import React from 'react';
import { TransformedTweet } from 'types/tweet';
import Box from '@theme/components/Box';

const WavingHandCode = `import { motion } from 'framer-motion';

const WavingHand = () => (
  <motion.div
    style={{
      marginBottom: '-20px',
      marginRight: '-45px',
      paddingBottom: '20px',
      paddingRight: '45px',
      display: 'inline-block',
    }}
    animate={{ rotate: 20 }}
    transition={{
      repeat: Infinity,
      repeatType: 'mirror',
      duration: 0.2,
      delay: 0.5,
      ease: 'easeInOut',
      type: 'tween',
    }}
  >
  👋
  </motion.div>
);

const Hi = () => (
    <h1>
        Hi <WavingHand /> !
    </h1>
);

export default Hi;
`;

const AppCode = `import WavingHand from './WavingHand';

export default function App() {
  return <WavingHand/>;
}
`;

/**
 * TODO:
 * - Decouple Search in 2 components => Overlay and Command Center
 * - Rename Search
 * - Remove inline styles in components (should be class/css or styled components)
 * - Make sure Grid can take the css prop / Revisit Grid implementation
 *
 *
 * NOTES:
 * - use var(--maximeheckel-colors-foreground) instead of --maximeheckel-border-color: hsl(var(--palette-gray-80)) ??
 */

const wrapperGrid = css({
  paddingTop: '64px',
  section: {
    gridColumn: 2,
  },
});

const Sandpack = dynamic(() => import('@theme/components/Code/Sandpack'));

const LiveCodeBlock = dynamic(
  () => import('@theme/components/Code/LiveCodeBlock')
);

const Search = dynamic(() => import('@theme/components/Search'), {
  ssr: false,
});

const HR = styled('hr', {
  height: '2px',
  width: '100%',
  background: 'hsl(var(--palette-gray-20))',
  border: 'none',
  marginBottom: '16px',
});

const Label = styled('p', {
  marginBottom: '8px',
});

export default function Design(props: {
  tweets: Record<string, TransformedTweet>;
}) {
  const [showSearch, setShowSearch] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [rangeValue, setRangeValue] = React.useState(250);

  const colorScaleNumbers = React.useMemo(
    () =>
      Array.from(Array(19).keys()).map((items) => {
        const num = (items + 1) * 5;
        if (num === 5) {
          return `0${num}`;
        }

        return num.toString();
      }),
    []
  );

  const palette = ['gray', 'blue', 'red', 'orange', 'green', 'pink', 'indigo'];

  return (
    <Layout footer>
      <Seo title="Design" />
      <Grid columns="medium" gapX={4} gapY={10} className={wrapperGrid()}>
        <section>
          <H1
            css={{
              marginBottom: '0px',
            }}
          >
            Components / Design System{' '}
          </H1>
          <HR />
          <Flex justifyContent="space-between">
            <Pill variant="warning">Work In Progress</Pill>
            <Pill variant="info">v1.0</Pill>
          </Flex>
        </section>
        <section>
          <H2>Name (WIP)</H2>
          <Text family="numeric" size="4">
            3X-DS (Explore, Expand, Experiment)
          </Text>
          <br />
          <Text size="2" variant="tertiary">
            A set of tools and components to build and write content
          </Text>
        </section>
        <section id="logo">
          <H2>Logo</H2>
          <Logo />
        </section>
        <section id="Colors">
          <H2>Colors</H2>
          <Grid gap={3}>
            Brand:
            <Tooltip id="brand" tooltipText="--brand">
              <Box
                css={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--maximeheckel-colors-brand)',
                  border: '2px solid var(--maximeheckel-border-color)',
                }}
              />
            </Tooltip>
            Background:
            <Tooltip id="background" tooltipText="--background">
              <Box
                css={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--maximeheckel-colors-background)',
                  border: '2px solid var(--maximeheckel-border-color)',
                }}
              />
            </Tooltip>
            Foreground:
            <Tooltip id="foreground" tooltipText="--foreground">
              <Box
                css={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--maximeheckel-colors-foreground)',
                  border: '2px solid var(--maximeheckel-border-color)',
                }}
              />
            </Tooltip>
            Typeface:
            <Grid gap={3} css={{ gridTemplateColumns: 'repeat(3, 44px)' }}>
              <Tooltip id="typeface-primary" tooltipText="--typeface-primary">
                <Box
                  css={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--maximeheckel-colors-typeface-primary)',
                    border: '2px solid var(--maximeheckel-border-color)',
                  }}
                />
              </Tooltip>
              <Tooltip
                id="typeface-secondary"
                tooltipText="--typeface-secondary"
              >
                <Box
                  css={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--maximeheckel-colors-typeface-secondary)',
                    border: '2px solid var(--maximeheckel-border-color)',
                  }}
                />
              </Tooltip>
              <Tooltip id="typeface-tertiary" tooltipText="--typeface-teriary">
                <Box
                  css={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--maximeheckel-colors-typeface-tertiary)',
                    border: '2px solid var(--maximeheckel-border-color)',
                  }}
                />
              </Tooltip>
            </Grid>
          </Grid>
        </section>
        <section id="Palette">
          <H2>Palette</H2>
          <Grid
            gap={6}
            css={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))',
            }}
          >
            {palette.map((paletteItem) => (
              <Grid
                key={paletteItem}
                css={{
                  gridTemplateColumns: 'repeat(auto-fill, minmax(2rem, 1fr))',
                  marginRight: '$3',
                }}
              >
                {colorScaleNumbers.map((shade) => (
                  <Tooltip
                    id={`${paletteItem}-${shade}`}
                    key={`${paletteItem}-${shade}`}
                    tooltipText={`--palette-${paletteItem}-${shade}`}
                  >
                    <Box
                      css={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: `hsl(var(--palette-${paletteItem}-${shade}))`,
                        border: '2px solid var(--maximeheckel-border-color)',
                      }}
                    />
                  </Tooltip>
                ))}
              </Grid>
            ))}
          </Grid>
        </section>
        <section id="typography">
          <H2>Typography</H2>
          <Label>Display</Label>
          <Text size="4">
            Almost before we knew it, we had left the ground.
          </Text>
          <Label>Numeric (experimenting)</Label>
          <Text size="3" family="numeric">
            1 AU = 1,495978707x10<sup>11</sup> m
          </Text>
          <Label>Mono</Label>
          <Text size="3" family="mono">
            console.log(foobar)
          </Text>
          <br />
          <br />
          <Label>H1</Label>
          <Heading as="h1" size="4">
            Almost before we knew it, we had left the ground.
          </Heading>
          <Label>H2</Label>
          <Heading as="h2" size="3">
            Almost before we knew it, we had left the ground.
          </Heading>
          <Label>H3</Label>
          <Heading as="h3" size="2">
            Almost before we knew it, we had left the ground.
          </Heading>
          <Label>H4</Label>
          <Heading as="h4" size="1">
            Almost before we knew it, we had left the ground.
          </Heading>
          <br />
          <Label>Text size 7</Label>
          <Text as="p" size="7">
            Almost before we knew it, we had left the ground.
          </Text>
          <Label>Text size 6</Label>
          <Text as="p" size="6">
            Almost before we knew it, we had left the ground.
          </Text>
          <Label>Text size 5</Label>
          <Text as="p" size="5">
            Almost before we knew it, we had left the ground.
          </Text>
          <Label>Text size 4</Label>
          <Text as="p" size="4">
            Almost before we knew it, we had left the ground.
          </Text>
          <Label>Text size 3</Label>
          <Text as="p" size="3">
            Almost before we knew it, we had left the ground.
          </Text>
          <Label>Text size 2</Label>
          <Text as="p" size="2">
            Almost before we knew it, we had left the ground.
          </Text>
          <Label>Text size 1</Label>
          <Text as="p" size="1">
            Almost before we knew it, we had left the ground.
          </Text>
          <Label>Text gradient</Label>
          <Text
            as="p"
            size="3"
            gradient
            css={{
              backgroundImage: `linear-gradient(
              91.83deg,
              hsl(var(--palette-pink-50)) -20.26%,
              hsl(var(--palette-blue-20)) 20.55%,
              hsl(var(--palette-indigo-30)) 60.81%
            )`,
            }}
          >
            Almost before we knew it, we had left the ground.
          </Text>
          <br />
          <Label>Strong</Label>
          <Strong>Almost before we knew it, we had left the ground.</Strong>
          <Label>EM</Label>
          <EM>Almost before we knew it, we had left the ground.</EM>
          <Label>BigNum (WIP)</Label>
          <Text family="numeric" size="7" weight="4">
            1 AU = 1,495978707x10<sup>11</sup> m
          </Text>
          <Label>BigNum Outline (Experimenting)</Label>
          <Text
            family="numeric"
            size="7"
            weight="4"
            style={{
              color: 'transparent',
              WebkitTextStrokeColor: 'var(--maximeheckel-colors-brand)',
              WebkitTextStrokeWidth: '1px',
            }}
          >
            1 AU = 1,495978707x10<sup>11</sup> m
          </Text>
          <br />
          <Text
            family="numeric"
            size="7"
            weight="4"
            style={{
              color: 'transparent',
              WebkitTextStrokeColor: 'var(--maximeheckel-colors-danger)',
              WebkitTextStrokeWidth: '1px',
            }}
          >
            1 AU = 1,495978707x10<sup>11</sup> m
          </Text>
          <br />
          <br />
        </section>
        <section id="icons">
          <H2>Icons</H2>
          <IconSection />
        </section>
        <section id="lists">
          <H2>Lists</H2>
          <Grid columns={2}>
            <List variant="unordered">
              <List.Item>First</List.Item>
              <List.Item>Second</List.Item>
              <List.Item>Third</List.Item>
            </List>
            <List variant="ordered">
              <List.Item>First</List.Item>
              <List.Item>Second</List.Item>
              <List.Item>Third</List.Item>
            </List>
            <List variant="unordered">
              <List.Item>
                <List variant="ordered">
                  <List.Item>First</List.Item>
                  <List.Item>Second</List.Item>
                  <List.Item>Third</List.Item>
                </List>
              </List.Item>
            </List>
            <List variant="unordered">
              <List.Item>
                <List variant="unordered">
                  <List.Item>First</List.Item>
                  <List.Item>Second</List.Item>
                  <List.Item>Third</List.Item>
                </List>
              </List.Item>
            </List>
          </Grid>
        </section>
        <section id="button">
          <H2>Buttons</H2>
          <Grid gap={5}>
            <Glow>
              <Button variant="primary">Button</Button>
            </Glow>
            <Button variant="primary">Button</Button>
            <Button variant="primary" endIcon={<ExternalIcon />}>
              Portfolio
            </Button>
            <Button variant="primary" startIcon={<TwitterIcon />}>
              Follow me!
            </Button>
            <Button variant="primary" disabled>
              Button
            </Button>
            <Button variant="secondary">Button</Button>
            <Button variant="secondary" endIcon={<ExternalIcon />}>
              Portfolio
            </Button>
            <Button variant="secondary" startIcon={<TwitterIcon />}>
              Follow me!
            </Button>
            <Button variant="secondary" disabled>
              Button
            </Button>
            <Button
              aria-label="Follow me on Twitter!"
              variant="icon"
              icon={<TwitterIcon />}
            />
            <Button
              aria-label="Follow me on Twitter!"
              disabled
              variant="icon"
              icon={<TwitterIcon />}
            />
          </Grid>
        </section>
        <section id="anchor">
          <H2>Anchor</H2>
          <Grid gap={1}>
            <h3>
              <Anchor href="https://twitter.com/MaximeHeckel" favicon>
                @MaximeHeckel
              </Anchor>
            </h3>
            <p>
              <Anchor href="https://twitter.com/MaximeHeckel" discreet favicon>
                @MaximeHeckel
              </Anchor>
            </p>
            <h3>
              <Anchor href="https://github.com/MaximeHeckel" favicon>
                Github
              </Anchor>
            </h3>
            <p>
              <Anchor href="https://github.com/MaximeHeckel" discreet favicon>
                Github
              </Anchor>
            </p>
            <h3>
              <Anchor href="/" arrow="left">
                Back
              </Anchor>
            </h3>
            <h3>
              <Anchor href="https://twitter.com/MaximeHeckel" arrow="right">
                Twitter
              </Anchor>
            </h3>
            <p>
              <Anchor
                href="https://github.com/MaximeHeckel/blog.maximeheckel.com"
                arrow="right"
                discreet
              >
                Check out this repo
              </Anchor>
            </p>
            <h3>
              <Anchor href="/design" underline>
                Design System
              </Anchor>
            </h3>
            <p>
              <Anchor discreet href="/design" underline>
                Design System
              </Anchor>{' '}
            </p>
          </Grid>
        </section>
        <section id="form-components">
          <H2>Form Components</H2>
          <Flex gap={2}>
            <TextInput
              aria-label="Email"
              id="email-input"
              type="email"
              placeholder="hello@maximeheckel.com"
              onChange={(event) => setEmail(event.currentTarget.value)}
              value={email}
            />
            <Button variant="primary">Subscribe</Button>
          </Flex>
          <br />
          <Grid
            gap={5}
            css={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            }}
          >
            <TextInput
              label="Name"
              aria-label="Name"
              id="name-input"
              placeholder="Name"
              onChange={() => {}}
            />

            <TextInput
              label="Name"
              aria-label="Name"
              id="name-input-disabled"
              placeholder="Name"
              disabled
              onChange={() => {}}
              value="Maxime Heckel"
            />

            <TextInput
              aria-label="Email"
              id="email-input"
              type="email"
              placeholder="hello@maximeheckel.com"
              onChange={(event) => setEmail(event.currentTarget.value)}
              value={email}
              autoComplete="off"
            />

            <TextInput
              aria-label="Email"
              id="email-input-disabled"
              type="email"
              disabled
              placeholder="hello@maximeheckel.com"
              onChange={() => {}}
              value="hello@maximeheckel.com"
            />

            <TextInput
              aria-label="Password"
              id="password-input"
              type="password"
              placeholder="Password"
              onChange={() => {}}
            />

            <TextInput
              aria-label="Password"
              id="password-input-disabled"
              type="password"
              disabled
              onChange={() => {}}
              value="supersecretpassword"
            />

            <TextArea
              aria-label="Example Text"
              id="example-text-1"
              label="Example Text"
              onChange={() => {}}
              placeholder="Type some text here"
              resize="none"
            />
            <TextArea
              aria-label="Example Text"
              disabled
              id="example-text-2"
              label="Example Text"
              onChange={() => {}}
              placeholder="Type some text here"
              resize="none"
              value={`Here's to the crazy ones.
The misfits.
The rebels.
The troublemakers.
The round pegs in the square holes.

The ones who see things differently.

They're not fond of rules.
And they have no respect for the status quo.

You can quote them, disagree with them,
glorify or vilify them.
About the only thing you can't do is ignore them.

Because they change things.

They push the human race forward.

While some may see them as the crazy ones,
we see genius.

Because the people who are crazy enough to think
they can change the world, are the ones who do.`}
            />
          </Grid>
          <br />
          <Grid
            gap={3}
            css={{ gridTemplateColumns: 'repeat(2, minmax(2rem, 1fr))' }}
          >
            <Checkbox aria-label="Checkbox" id="checkbox1" label="Checkbox" />
            <Checkbox
              aria-label="Checkbox"
              id="checkbox3"
              label="Checkbox"
              disabled
            />
            <Checkbox
              aria-label="Checkbox"
              id="checkbox2"
              label="Checkbox"
              onChange={() => {}}
              checked
            />
            <Checkbox
              aria-label="Checkbox"
              id="checkbox4"
              label="Checkbox"
              onChange={() => {}}
              checked
              disabled
            />
          </Grid>
          <br />
          <Grid
            gap={3}
            css={{ gridTemplateColumns: 'repeat(2, minmax(2rem, 1fr))' }}
          >
            <Switch id="switch1" aria-label="Switch" label="Switch" />
            <Switch id="switch2" aria-label="Switch" label="Switch" disabled />
            <Switch
              id="switch3"
              aria-label="Switch"
              label="Switch"
              onChange={() => {}}
              toggled
            />
            <Switch
              id="switch4"
              aria-label="Switch"
              label="Switch"
              disabled
              onChange={() => {}}
              toggled
            />
          </Grid>
          <br />
          <Grid
            gap={3}
            css={{ gridTemplateColumns: 'repeat(2, minmax(2rem, 1fr))' }}
          >
            <Radio.Group
              name="options"
              direction="vertical"
              onChange={() => {}}
            >
              <Radio.Item
                id="option-1"
                value="option1"
                aria-label="Option 1"
                label="Option 1"
              />
              <Radio.Item
                id="option-2"
                value="option2"
                aria-label="Option 2"
                label="Option 2"
                checked
              />
            </Radio.Group>
            <Radio.Group
              name="options-disabled"
              direction="vertical"
              onChange={() => {}}
            >
              <Radio.Item
                id="radio-3"
                value="option3"
                aria-label="Option 3"
                label="Option 3"
                disabled
              />
              <Radio.Item
                id="radio-4"
                value="option4"
                aria-label="Option 4"
                label="Option 4"
                disabled
                checked
              />
            </Radio.Group>
            <Radio.Group
              name="options-horizontal"
              direction="horizontal"
              onChange={() => {}}
            >
              <Radio.Item
                id="option-5"
                value="option5"
                aria-label="Option 5"
                label="Option 5"
              />
              <Radio.Item
                id="option-6"
                value="option6"
                aria-label="Option 6"
                label="Option 6"
                checked
              />
            </Radio.Group>
          </Grid>
          <br />
          <Grid
            gap={3}
            css={{ gridTemplateColumns: 'repeat(2, minmax(2rem, 1fr))' }}
          >
            <Range
              id="range-1"
              aria-label="Range"
              label="Range"
              value={rangeValue}
              min={0}
              max={500}
              onChange={(value) => setRangeValue(value)}
            />
            <Range
              id="range-2"
              aria-label="Range"
              label="Range"
              value={250}
              min={0}
              max={500}
              onChange={() => {}}
              disabled
            />
          </Grid>
        </section>
        <section id="cards">
          <H2>Card</H2>
          <Grid gapY={6} css={{ width: '100%' }}>
            <Card>
              <Card.Body>Base Card</Card.Body>
            </Card>
            <Card title="Title for the card">
              <Card.Body>
                Card with <InlineCode>title</InlineCode> prop
              </Card.Body>
            </Card>
            <Card>
              <Card.Header>Some Custom Header</Card.Header>
              <Card.Body>Card With Custom Header</Card.Body>
            </Card>
            <Card>
              <Flex
                alignItems="center"
                justifyContent="center"
                css={{
                  padding: 'var(--space-7)',
                }}
              >
                Card With custom Body
              </Flex>
            </Card>
            <Card depth={0}>
              <Card.Body>
                Card <InlineCode>depth={0}</InlineCode>
              </Card.Body>
            </Card>
            <Card depth={1}>
              <Card.Body>
                Card <InlineCode>depth={1}</InlineCode>
              </Card.Body>
            </Card>
            <Card depth={2}>
              <Card.Body>
                Card <InlineCode>depth={2}</InlineCode>
              </Card.Body>
            </Card>
            <Card depth={3}>
              <Card.Body>
                Card <InlineCode>depth={3}</InlineCode>
              </Card.Body>
            </Card>
          </Grid>
        </section>
        <section id="tooltip">
          <H2>Tooltip</H2>
          <Tooltip
            id="exampletooltip"
            tooltipText="@MaximeHeckel"
            tooltipVisuallyHiddenText="Follow Me on Twitter"
          >
            <Flex
              alignItems="center"
              justifyContent="space-between"
              css={{
                height: '50px',
                width: '150px',
                padding: 'var(--space-2)',
              }}
              aria-describedby="exampletooltip"
            >
              <TwitterIcon stroke="var(--maximeheckel-colors-typeface-tertiary)" />{' '}
              Hover Me!
            </Flex>
          </Tooltip>
        </section>
        <section id="pill">
          <H2>Pill</H2>
          <Grid gapY={5}>
            <Box>
              <Pill variant="info">Info Pill</Pill>
            </Box>
            <Box>
              <Pill variant="success">Success Pill</Pill>
            </Box>
            <Box>
              <Pill variant="warning">Warning Pill</Pill>
            </Box>
            <Box>
              <Pill variant="danger">Danger Pill</Pill>
            </Box>
          </Grid>
        </section>
        <section id="callout">
          <H2>Callout</H2>
          <Grid gapY={5}>
            <Callout variant="info">Info Callout</Callout>
            <Callout label="Learn more" variant="info">
              Info Callout
            </Callout>
            <Callout variant="danger">Danger Callout</Callout>
            <Callout label="Be careful!" variant="danger">
              Danger Callout
            </Callout>
          </Grid>
        </section>
        <section id="blockquote">
          <Blockquote>
            <Text as="p">
              Almost before we knew it, we had left the ground.
            </Text>
          </Blockquote>
        </section>
        <section id="inline-code">
          <H2>Inline Code</H2>
          <InlineCode>{"const foo = () => 'bar'"}</InlineCode>
        </section>
        <section id="code-block">
          <H2>Code Block</H2>
          <Label>Basic</Label>
          <CodeBlock
            metastring=""
            language="javascript"
            codeString={`console.log("hello world")

/**
 * Some comments
 */
function sayHi(name) {
    var message = \`hi \${name}\`
    return message;
}`}
          />
          <Label>With title and highlighting</Label>
          <CodeBlock
            metastring="{6-8} title=Code snippet title"
            language="javascript"
            codeString={`console.log("hello world")

/**
 * Some comments
 */
function sayHi(name) {
    var message = \`hi \${name}\`
    return message;
}`}
          />
          <Label>Sandpack Code Block</Label>
          <Sandpack
            template="react"
            dependencies={{
              'framer-motion': '5.2.1',
            }}
            files={{
              '/App.js': {
                code: AppCode,
              },
              '/WavingHand.js': {
                code: WavingHandCode,
              },
              '/styles.css': {
                code: `
                  body: {
                    color: var(--maximeheckel-colors-brand);
                  }
                `,
              },
            }}
          />
          <Label>Live (for React code only) (DEPRECATED)</Label>
          <LiveCodeBlock
            live
            metastring=""
            language="javascript"
            codeString={`const WavingHand = () => (
  <motion.div
    style={{
      marginBottom: '-20px',
      marginRight: '-45px',
      paddingBottom: '20px',
      paddingRight: '45px',
      display: 'inline-block',
    }}
    animate={{ rotate: 20 }}
    transition={{
      repeat: Infinity,
      repeatType: 'mirror',
      duration: 0.2,
      delay: 0.5,
      ease: 'easeInOut',
      type: 'tween',
    }}
  >
  👋
  </motion.div>
);

const Hi = () => (
    <h1>
        Hi <WavingHand /> !
    </h1>
);

render(<Hi />);`}
          />
        </section>
        <section id="command-center">
          <H2>Command Center / Search </H2>
          <Button variant="primary" onClick={() => setShowSearch(true)}>
            Show Command Center
          </Button>
          <AnimatePresence>
            {showSearch ? (
              <Search onClose={() => setShowSearch(false)} />
            ) : null}
          </AnimatePresence>
        </section>
        <section id="tweet">
          <H2>Tweet</H2>
          <Tweet tweet={props.tweets['1386013361809281024']} />
        </section>
      </Grid>
    </Layout>
  );
}

const IconSection = () => (
  <Flex direction="column" gap={8} alignItems="stretch" css={{ width: '100%' }}>
    <Grid flow="column" gap={4}>
      <TwitterIcon variant="info" size={5} />
      <TwitterIcon variant="danger" size={5} />
      <TwitterIcon variant="success" size={5} />
      <TwitterIcon variant="warning" size={5} />
      <TwitterIcon variant="primary" size={5} />
      <TwitterIcon variant="secondary" size={5} />
      <TwitterIcon variant="tertiary" size={5} />
    </Grid>
    <Box
      css={{
        color: 'hsl(var(--palette-pink-50))',
        svg: {
          strokeWidth: '1',
          fill: 'hsla(var(--palette-pink-50), 50%) !important',
        },
      }}
    >
      <TwitterIcon />
    </Box>
    <Grid gapY={4} columns={5} flow="row" align="center">
      <TwitterIcon variant="default" size={7} />
      <TwitterIcon variant="default" size={6} />
      <TwitterIcon variant="default" size={5} />
      <TwitterIcon variant="default" size={4} />
      <TwitterIcon variant="default" size={3} />
      <GithubIcon variant="default" size={7} />
      <GithubIcon variant="default" size={6} />
      <GithubIcon variant="default" size={5} />
      <GithubIcon variant="default" size={4} />
      <GithubIcon variant="default" size={3} />
      <ContactIcon variant="default" size={7} />
      <ContactIcon variant="default" size={6} />
      <ContactIcon variant="default" size={5} />
      <ContactIcon variant="default" size={4} />
      <ContactIcon variant="default" size={3} />
      <MapIcon variant="default" size={7} />
      <MapIcon variant="default" size={6} />
      <MapIcon variant="default" size={5} />
      <MapIcon variant="default" size={4} />
      <MapIcon variant="default" size={3} />
      <ExternalIcon variant="default" size={7} />
      <ExternalIcon variant="default" size={6} />
      <ExternalIcon variant="default" size={5} />
      <ExternalIcon variant="default" size={4} />
      <ExternalIcon variant="default" size={3} />
      <RSSIcon variant="default" size={7} />
      <RSSIcon variant="default" size={6} />
      <RSSIcon variant="default" size={5} />
      <RSSIcon variant="default" size={4} />
      <RSSIcon variant="default" size={3} />
      <EnterIcon variant="default" size={7} />
      <EnterIcon variant="default" size={6} />
      <EnterIcon variant="default" size={5} />
      <EnterIcon variant="default" size={4} />
      <EnterIcon variant="default" size={3} />
      <ArrowIcon variant="default" size={7} />
      <ArrowIcon variant="default" size={6} />
      <ArrowIcon variant="default" size={5} />
      <ArrowIcon variant="default" size={4} />
      <ArrowIcon variant="default" size={3} />
      <PortfolioIcon variant="default" size={7} />
      <PortfolioIcon variant="default" size={6} />
      <PortfolioIcon variant="default" size={5} />
      <PortfolioIcon variant="default" size={4} />
      <PortfolioIcon variant="default" size={3} />
      <PlayIcon variant="default" size={7} />
      <PlayIcon variant="default" size={6} />
      <PlayIcon variant="default" size={5} />
      <PlayIcon variant="default" size={4} />
      <PlayIcon variant="default" size={3} />
      <PauseIcon variant="default" size={7} />
      <PauseIcon variant="default" size={6} />
      <PauseIcon variant="default" size={5} />
      <PauseIcon variant="default" size={4} />
      <PauseIcon variant="default" size={3} />
      <RepeatIcon variant="default" size={7} />
      <RepeatIcon variant="default" size={6} />
      <RepeatIcon variant="default" size={5} />
      <RepeatIcon variant="default" size={4} />
      <RepeatIcon variant="default" size={3} />
      <InfoIcon variant="default" size={7} />
      <InfoIcon variant="default" size={6} />
      <InfoIcon variant="default" size={5} />
      <InfoIcon variant="default" size={4} />
      <InfoIcon variant="default" size={3} />
      <AlertIcon variant="default" size={7} />
      <AlertIcon variant="default" size={6} />
      <AlertIcon variant="default" size={5} />
      <AlertIcon variant="default" size={4} />
      <AlertIcon variant="default" size={3} />
      <StackIcon variant="default" size={7} />
      <StackIcon variant="default" size={6} />
      <StackIcon variant="default" size={5} />
      <StackIcon variant="default" size={4} />
      <StackIcon variant="default" size={3} />
    </Grid>
  </Flex>
);

export async function getStaticProps() {
  const tweets = await getTweets(['1386013361809281024']);

  return { props: { tweets } };
}
