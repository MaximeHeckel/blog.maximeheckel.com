import Anchor from '@theme/components/Anchor';
import Button from '@theme/components/Button';
import Card from '@theme/components/Card';
import Checkbox from '@theme/components/Checkbox';
import Grid from '@theme/components/Grid';
import {
  EnterArrowIcon,
  ContactIcon,
  EnterIcon,
  ExternalIcon,
  PortfolioIcon,
  RSSIcon,
  TwitterIcon,
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
import Layout from '@theme/layout';
import { AnimatePresence } from 'framer-motion';
import { styled, css } from 'lib/stitches.config';
import { getTweets } from 'lib/tweets';
import dynamic from 'next/dynamic';
import React from 'react';
import { TransformedTweet } from 'types/tweet';

/**
 * TODO:
 * - Decouple Search in 2 components => Overlay and Command Center
 * - Rename Search
 * - Fix smooth scroll Table of content
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
      <Grid
        columns="var(--layout-medium)"
        columnGap={20}
        rowGap={64}
        className={wrapperGrid()}
      >
        <section>
          <h1
            style={{
              marginBottom: '0px',
            }}
          >
            Components / Design System{' '}
          </h1>
          <HR />
          <Grid gap={12} columns="140px 50px">
            <Pill variant="warning">Work In Progress</Pill>
            <Pill variant="info">v1.0</Pill>
          </Grid>
        </section>
        <section id="logo">
          <h2>Logo</h2>
          <Logo />
        </section>
        <section id="Colors">
          <h2>Colors</h2>
          <Grid gap={12}>
            Brand:
            <Tooltip id="brand" tooltipText="--brand">
              <div
                style={{
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
              <div
                style={{
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
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--maximeheckel-colors-foreground)',
                  border: '2px solid var(--maximeheckel-border-color)',
                }}
              />
            </Tooltip>
            Typeface:
            <Grid columns="repeat(3, 44px)" gap={12}>
              <Tooltip id="typeface-primary" tooltipText="--typeface-primary">
                <div
                  style={{
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
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--maximeheckel-colors-typeface-secondary)',
                    border: '2px solid var(--maximeheckel-border-color)',
                  }}
                />
              </Tooltip>
              <Tooltip id="typeface-tertiary" tooltipText="--typeface-teriary">
                <div
                  style={{
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
          <h2>Palette</h2>
          <Grid gap={32} columns="repeat(auto-fill, minmax(10rem, 1fr))">
            {palette.map((paletteItem) => (
              <Grid
                key={paletteItem}
                columns="repeat(auto-fill, minmax(2rem, 1fr))"
                style={{
                  marginRight: '12px',
                }}
              >
                {colorScaleNumbers.map((shade) => (
                  <Tooltip
                    id={`${paletteItem}-${shade}`}
                    key={`${paletteItem}-${shade}`}
                    tooltipText={`--palette-${paletteItem}-${shade}`}
                  >
                    <div
                      style={{
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
          <h2>Typography</h2>
          <Label>h1</Label>
          <h1>Almost before we knew it, we had left the ground.</h1>
          <Label>h2</Label>
          <h2>Almost before we knew it, we had left the ground.</h2>
          <Label>h3</Label>
          <h3>Almost before we knew it, we had left the ground.</h3>
          <Label>h4</Label>
          <h4>Almost before we knew it, we had left the ground.</h4>
          <Label>p</Label>
          <p>Almost before we knew it, we had left the ground.</p>
          <Label>p (bold)</Label>
          <p style={{ fontWeight: 700 }}>
            Almost before we knew it, we had left the ground.
          </p>
          <Label>p (italic)</Label>
          <p style={{ fontStyle: 'italic' }}>
            Almost before we knew it, we had left the ground.
          </p>
        </section>
        <section id="lists">
          <h2>Lists</h2>
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
        </section>
        <section id="button">
          <h2>Buttons</h2>
          <Grid gap={24}>
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
          <h2>Anchor</h2>
          <Grid gap={4}>
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
          <h2>Form Components</h2>
          <Flex css={{ gap: '8px' }}>
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
          <Grid gap={24} columns="repeat(auto-fit, minmax(300px, 1fr))">
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
          <Grid gap={12} columns="repeat(2, minmax(2rem, 1fr))">
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
          <Grid gap={12} columns="repeat(2, minmax(2rem, 1fr))">
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
          <Grid gap={12} columns="repeat(2, minmax(2rem, 1fr))">
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
          <Grid gap={12} columns="repeat(2, minmax(2rem, 1fr))">
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
          <h2>Card</h2>
          <Grid rowGap={30}>
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
                  padding: '40px',
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
        <section id="icons">
          <h2>Icons</h2>
          <TwitterIcon stroke="var(--maximeheckel-colors-typeface-tertiary)" />{' '}
          <ExternalIcon stroke="var(--maximeheckel-colors-typeface-tertiary)" />{' '}
          <RSSIcon stroke="var(--maximeheckel-colors-typeface-tertiary)" />{' '}
          <ContactIcon stroke="var(--maximeheckel-colors-typeface-tertiary)" />{' '}
          <EnterIcon stroke="var(--maximeheckel-colors-typeface-tertiary)" />{' '}
          <PortfolioIcon stroke="var(--maximeheckel-colors-typeface-tertiary)" />{' '}
          <EnterArrowIcon stroke="var(--maximeheckel-colors-typeface-tertiary)" />
        </section>
        <section id="tooltip">
          <h2>Tooltip</h2>
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
                padding: '8px',
              }}
              aria-describedby="exampletooltip"
            >
              <TwitterIcon stroke="var(--maximeheckel-colors-typeface-tertiary)" />{' '}
              Hover Me!
            </Flex>
          </Tooltip>
        </section>
        <section id="pill">
          <h2>Pill</h2>
          <Grid rowGap={32}>
            <div>
              <Pill variant="info">Info Pill</Pill>
            </div>
            <div>
              <Pill variant="success">Success Pill</Pill>
            </div>
            <div>
              <Pill variant="warning">Warning Pill</Pill>
            </div>
            <div>
              <Pill variant="danger">Danger Pill</Pill>
            </div>
          </Grid>
        </section>
        <section id="callout">
          <h2>Callout</h2>
          <Grid gap={32}>
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
            Almost before we knew it, we had left the ground.
          </Blockquote>
        </section>
        <section id="inline-code">
          <h2>Inline Code</h2>
          <InlineCode>Some Inline Code</InlineCode>
        </section>
        <section id="code-block">
          <h2>Code Block</h2>
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
          <Label>Live (for React code only)</Label>
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
          <h2>Command Center / Search </h2>
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
          <h2>Tweet</h2>
          <Tweet tweet={props.tweets['1386013361809281024']} />
        </section>
      </Grid>
    </Layout>
  );
}

export async function getStaticProps() {
  const tweets = await getTweets(['1386013361809281024']);

  return { props: { tweets } };
}
