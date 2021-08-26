import { css } from '@emotion/react';
import styled from '@emotion/styled';
import Button from '@theme/components/Button';
import { LinkButton } from '@theme/components/Button/LinkButton';
import Card from '@theme/components/Card';
import Checkbox from '@theme/components/Checkbox';
import Grid from '@theme/components/Grid';
import {
  ArrowIcon,
  ContactIcon,
  EnterIcon,
  ExternalIcon,
  PortfolioIcon,
  RSSIcon,
  TwitterIcon,
} from '@theme/components/Icons';
import Logo from '@theme/components/Logo';
import Callout from '@theme/components/MDX/Callout';
import { VARIANT } from '@theme/components/MDX/Callout/Callout';
import CodeBlock from '@theme/components/MDX/Code/CodeBlock';
import LiveCodeBlock from '@theme/components/MDX/Code/LiveCodeBlock';
import InlineCode from '@theme/components/MDX/InlineCode';
import MDXBody, { ListItem } from '@theme/components/MDX/MDX';
import Pill, { PillVariant } from '@theme/components/Pill';
import Radio from '@theme/components/Radio';
import Range from '@theme/components/Range';
import Seo from '@theme/components/Seo';
import Switch from '@theme/components/Switch';
import Tooltip from '@theme/components/Tooltip';
import Tweet from '@theme/components/Tweet';
import Layout from '@theme/layout';
import { AnimatePresence } from 'framer-motion';
import { getTweets } from 'lib/tweets';
import dynamic from 'next/dynamic';
import React from 'react';
import { TransformedTweet } from 'types/tweet';

/**
 * TODO:
 * - Decouple Search in 2 components => Overlay and Command Center
 * - Rename Search
 * - Polish interface for lists => should be in global.css if possible?
 * - VARIANT callout should be renamed "CalloutVariant"
 * - Small Responsive issue with Live Code Block on medium size screen
 */

const Search = dynamic(() => import('@theme/components/Search'), {
  ssr: false,
});

const HR = styled('hr')`
  height: 2px;
  width: 100%;
  background: hsl(var(--palette-gray-20));
  border: none;
  margin-bottom: 16px;
`;

const Label = styled('p')`
  margin-bottom: 8px;
`;

export default function Design(props: {
  tweets: Record<string, TransformedTweet>;
}) {
  const [showSearch, setShowSearch] = React.useState(false);

  const colorScaleNumbers = Array.from(Array(19).keys()).map((items) => {
    const num = (items + 1) * 5;
    if (num === 5) {
      return `0${num}`;
    }

    return num.toString();
  });

  const palette = ['gray', 'blue', 'red', 'orange', 'green', 'pink', 'indigo'];

  return (
    <Layout footer>
      <Seo title="Components" />
      <Grid
        columns="var(--layout-medium)"
        columnGap={20}
        rowGap={64}
        css={css`
          padding-top: 128px;
          padding-top: 64px;
          > * {
            grid-column: 2;
          }
        `}
      >
        <div>
          <h1
            css={css`
              margin-bottom: 0px;
            `}
          >
            Components / Design System{' '}
          </h1>
          <HR />
          <Grid gap={12} columns="140px 50px">
            <Pill variant={PillVariant.WARNING}>Work In Progress</Pill>
            <Pill variant={PillVariant.INFO}>v1.0</Pill>
          </Grid>
        </div>
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
                css={css`
                  width: 44px;
                  height: 44px;
                  border-radius: 50%;
                  background: var(--maximeheckel-colors-brand);
                  border: 2px solid var(--maximeheckel-border-color);
                `}
              />
            </Tooltip>
            Background:
            <Tooltip id="background" tooltipText="--background">
              <div
                css={css`
                  width: 44px;
                  height: 44px;
                  border-radius: 50%;
                  background: var(--maximeheckel-colors-background);
                  border: 2px solid var(--maximeheckel-border-color);
                `}
              />
            </Tooltip>
            Foreground:
            <Tooltip id="foreground" tooltipText="--foreground">
              <div
                css={css`
                  width: 44px;
                  height: 44px;
                  border-radius: 50%;
                  background: var(--maximeheckel-colors-foreground);
                  border: 2px solid var(--maximeheckel-border-color);
                `}
              />
            </Tooltip>
            Typeface:
            <Grid columns="repeat(3, 44px)" gap={12}>
              <Tooltip id="typeface-primary" tooltipText="--typeface-primary">
                <div
                  css={css`
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: var(--maximeheckel-colors-typeface-primary);
                    border: 2px solid var(--maximeheckel-border-color);
                  `}
                />
              </Tooltip>
              <Tooltip
                id="typeface-secondary"
                tooltipText="--typeface-secondary"
              >
                <div
                  css={css`
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: var(--maximeheckel-colors-typeface-secondary);
                    border: 2px solid var(--maximeheckel-border-color);
                  `}
                />
              </Tooltip>
              <Tooltip id="typeface-tertiary" tooltipText="--typeface-teriary">
                <div
                  css={css`
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: var(--maximeheckel-colors-typeface-tertiary);
                    border: 2px solid var(--maximeheckel-border-color);
                  `}
                />
              </Tooltip>
            </Grid>
          </Grid>
        </section>
        <section id="Palette">
          <h2>Palette</h2>
          <div
            css={css`
              display: grid;
              gap: 2rem;
              grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
            `}
          >
            {palette.map((paletteItem) => (
              <div
                key={paletteItem}
                css={css`
                  display: grid;
                  grid-template-columns: repeat(auto-fill, minmax(2rem, 1fr));
                  margin-right: 12px;
                `}
              >
                {colorScaleNumbers.map((shade) => (
                  <Tooltip
                    id={`${paletteItem}-${shade}`}
                    key={`${paletteItem}-${shade}`}
                    tooltipText={`--palette-${paletteItem}-${shade}`}
                  >
                    <div
                      css={css`
                        width: 44px;
                        height: 44px;
                        border-radius: 50%;
                        background: hsl(var(--palette-${paletteItem}-${shade}));
                        border: 2px solid var(--maximeheckel-border-color);
                      `}
                    />
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>
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
          <MDXBody
            /**
             * Cancel grid MDXBody here
             */
            css={css`
              display: block;
            `}
          >
            <ul>
              {/*@ts-ignore */}
              <ListItem>First</ListItem>
              {/*@ts-ignore */}
              <ListItem>Second</ListItem>
              {/*@ts-ignore */}
              <ListItem>Third</ListItem>
            </ul>
            <ol>
              <li>First</li>
              <li>Second</li>
              <li>Third</li>
            </ol>
          </MDXBody>
        </section>
        <section id="form-components">
          <h2>Form Components</h2>
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
              value={250}
              min={0}
              max={500}
              onChange={() => {}}
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
              <div
                css={css`
                  padding: 40px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                `}
              >
                Card With custom Body
              </div>
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
          <ArrowIcon stroke="var(--maximeheckel-colors-typeface-tertiary)" />
        </section>
        <section id="tooltip">
          <h2>Tooltip</h2>
          <Tooltip
            id="exampletooltip"
            tooltipText="@MaximeHeckel"
            tooltipVisuallyHiddenText="Follow Me on Twitter"
          >
            <div
              css={css`
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: 50px;
                width: 150px;
                padding: 8px;
              `}
              aria-describedby="exampletooltip"
            >
              <TwitterIcon stroke="var(--maximeheckel-colors-typeface-tertiary)" />{' '}
              Hover Me!
            </div>
          </Tooltip>
        </section>
        <section id="pill">
          <h2>Pill</h2>
          <Grid rowGap={32}>
            <div>
              <Pill variant={PillVariant.INFO}>Info Pill</Pill>
            </div>
            <div>
              <Pill variant={PillVariant.SUCCESS}>Success Pill</Pill>
            </div>
            <div>
              <Pill variant={PillVariant.WARNING}>Warning Pill</Pill>
            </div>
            <div>
              <Pill variant={PillVariant.DANGER}>Danger Pill</Pill>
            </div>
          </Grid>
        </section>
        <section id="callout">
          <h2>Callout</h2>
          <Grid rowGap={32}>
            <div>
              <Callout variant={VARIANT.INFO}>Info Callout</Callout>
            </div>
            <div>
              <Callout variant={VARIANT.DANGER}>Danger Callout</Callout>
            </div>
          </Grid>
        </section>
        <section id="button">
          <Grid rowGap={32}>
            <h2>Button</h2>
            <div>
              <Button>Default</Button>
            </div>
            <div>
              <Button primary>Primary</Button>
            </div>
            <div>
              <Button secondary>Secondary</Button>
            </div>
            <div>
              <Button tertiary>Tertiary</Button>
            </div>
            <div>
              <Label>Icon Button</Label>
              <LinkButton>
                <TwitterIcon stroke="var(--maximeheckel-colors-typeface-tertiary)" />
              </LinkButton>
            </div>
          </Grid>
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
        yoyo: Infinity,
        from: 0,
        duration: 0.2,
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
          <Button onClick={() => setShowSearch(true)}>
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
