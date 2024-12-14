import {
  useTheme,
  styled,
  Anchor,
  Blockquote,
  Box,
  Button,
  Card,
  Callout,
  EM,
  Flex,
  Grid,
  H1,
  H2,
  Heading,
  Icon,
  InlineCode,
  List,
  Pill,
  Range,
  Strong,
  Text,
  TextInput,
  TextArea,
  Tooltip,
  Checkbox,
  Switch,
  Radio,
  Details,
} from '@maximeheckel/design-system';
import { getTweets } from 'lib/tweets';
import dynamic from 'next/dynamic';
import React from 'react';
import { templateColumnsMedium } from 'styles/grid';
import { NewTweet } from 'types/tweet';

import BeforeAfterImage from '@core/components/BeforeAfterImage';
import CodeBlock from '@core/components/Code/CodeBlock';
import Glow from '@core/components/Glow';
import Logo from '@core/components/Logo';
import Image from '@core/components/MDX/Image/Image';
import Seo from '@core/components/Seo';
import Tweet from '@core/components/Tweet';
import Layout from '@core/layout';

const SandpackExample = dynamic(
  () => import('@core/components/MDX/Widgets/WaveAnimation/Sandpack')
);
const Search = dynamic(() => import('@core/components/Search'), {
  ssr: false,
});

/**
 * TODO:
 * - Decouple Search in 2 components => Overlay + Dialog and Command Center
 * - Define specific token for glass card background (foreground is not cutting it)
 */

// Grid examples
/* <Grid.Item as="section" col={2}>
          <Grid
            css={{ height: '500px' }}
            templateColumns="repeat(5, 1fr)"
            templateRows="repeat(2, 1fr)"
            gap={2}
          >
            <Grid.Item colSpan={1} rowSpan={2}>
              <Box
                css={{ height: '100%', width: '100%', background: 'blue' }}
              />
            </Grid.Item>
            <Grid.Item colSpan={2}>
              <Box
                css={{ height: '100%', width: '100%', background: 'blue' }}
              />
            </Grid.Item>
            <Grid.Item colSpan={2}>
              <Box
                css={{ height: '100%', width: '100%', background: 'blue' }}
              />
            </Grid.Item>
            <Grid.Item colSpan={4}>
              <Box
                css={{ height: '100%', width: '100%', background: 'blue' }}
              />
            </Grid.Item>
          </Grid>
        </Grid.Item> */
/* <Grid.Item col={2}>
          <Grid templateColumns="repeat(5, 1fr)" gap={4}>
            <Grid.Item colSpan={2}>
              <Box
                css={{ width: '100%', height: '200px', background: 'blue' }}
              />
            </Grid.Item>
            <Grid.Item colStart={4} colEnd={6}>
              <Box
                css={{ width: '100%', height: '200px', background: 'hotpink' }}
              />
            </Grid.Item>
          </Grid>
        </Grid.Item> */
/* <Grid.Item col={2}>
          <Grid
            templateAreas={`"header header"
                  "nav main"
                  "nav footer"`}
            templateColumns="'150px 1fr'"
            templateRows="'30px 1fr 30px'"
            gapX={4}
            gapY={3}
          >
            <Grid.Item area="header">
              <Box css={{ width: '100%', height: '100%', background: 'blue' }}>
                Header
              </Box>
            </Grid.Item>
            <Grid.Item area="nav">
              <Box css={{ width: '100%', height: '100%', background: 'blue' }}>
                Nav
              </Box>
            </Grid.Item>
            <Grid.Item area="main">
              <Box
                css={{ width: '100%', height: '100%', background: 'hotpink' }}
              >
                Main
              </Box>
            </Grid.Item>
            <Grid.Item area="footer">
              <Box css={{ width: '100%', height: '100%', background: 'blue' }}>
                Footer
              </Box>
            </Grid.Item>
          </Grid>
        </Grid.Item> */

const HR = styled('hr', {
  height: '1px',
  width: '100%',
  background: 'var(--border-color)',
  border: 'none',
});

const Label = styled('p', {
  marginBottom: '8px',
});

export default function Design(props: { tweets: Record<string, NewTweet> }) {
  const { dark } = useTheme();
  const [showSearch, setShowSearch] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [rangeValue, setRangeValue] = React.useState(250);

  const colorScaleNumbers = [
    100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200,
  ];

  const palette = ['gray', 'blue', 'red', 'orange', 'green', 'pink'];

  return (
    <Layout footer>
      <Seo title="Design" />
      <Grid
        css={{ paddingTop: 'var(--space-10)' }}
        gapX={4}
        templateColumns={templateColumnsMedium}
      >
        <Flex
          alignItems="flex-start"
          as={Grid.Item}
          direction="column"
          col={2}
          gap="10"
        >
          <Flex
            alignItems="start"
            css={{ alignSelf: 'stretch' }}
            as="section"
            direction="column"
            gap="2"
          >
            <H1>Components / Design System </H1>
            <HR />
            <Flex justifyContent="space-between">
              <Pill variant="warning">Work In Progress</Pill>
              <Pill variant="info">v1.0</Pill>
            </Flex>
          </Flex>

          <Flex
            alignItems="start"
            as="section"
            css={{ alignSelf: 'stretch' }}
            direction="column"
            gap="5"
            id="logo"
          >
            <H2>Logo</H2>
            <Logo />
          </Flex>
          <Flex
            alignItems="start"
            as="section"
            css={{ alignSelf: 'stretch' }}
            direction="column"
            gap="5"
            id="Colors"
          >
            <H2>Colors</H2>
            <Grid gap={3}>
              Brand:
              <Tooltip id="brand" content="--brand">
                <Box
                  as="section"
                  css={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    border: '2px solid var(--border-color)',
                  }}
                />
              </Tooltip>
              Background:
              <Tooltip id="background" content="--background">
                <Box
                  as="section"
                  css={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--background)',
                    border: '2px solid var(--border-color)',
                  }}
                />
              </Tooltip>
              Foreground:
              <Tooltip id="foreground" content="--foreground">
                <Box
                  as="section"
                  css={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--foreground)',
                    border: '2px solid var(--border-color)',
                  }}
                />
              </Tooltip>
              Typeface:
              <Grid gap={3} templateColumns="repeat(3, 44px)">
                <Tooltip id="typeface-primary" content="--typeface-primary">
                  <Box
                    as="section"
                    css={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'var(--text-primary)',
                      border: '2px solid var(--border-color)',
                    }}
                  />
                </Tooltip>
                <Tooltip id="typeface-secondary" content="--typeface-secondary">
                  <Box
                    as="section"
                    css={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'var(--text-secondary)',
                      border: '2px solid var(--border-color)',
                    }}
                  />
                </Tooltip>
                <Tooltip id="typeface-tertiary" content="--typeface-teriary">
                  <Box
                    as="section"
                    css={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'var(--text-tertiary)',
                      border: '2px solid var(--border-color)',
                    }}
                  />
                </Tooltip>
              </Grid>
            </Grid>
          </Flex>
          <Flex
            alignItems="start"
            as="section"
            css={{ alignSelf: 'stretch' }}
            direction="column"
            gap="5"
            id="Palette"
          >
            <H2>Palette</H2>
            <Grid
              gap={6}
              css={{
                width: '100%',
              }}
              templateColumns="repeat(auto-fill, minmax(10rem, 1fr))"
            >
              {palette.map((paletteItem) => (
                <Grid
                  key={paletteItem}
                  css={{
                    marginRight: '$3',
                  }}
                  templateColumns="repeat(auto-fill, minmax(2rem, 1fr))"
                >
                  {colorScaleNumbers.map((shade) => (
                    <Tooltip
                      id={`${paletteItem}-${shade}`}
                      key={`${paletteItem}-${shade}`}
                      content={`--${paletteItem}-${shade}`}
                    >
                      <Box
                        as="section"
                        css={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          background: `var(--${paletteItem}-${shade})`,
                          border: '2px solid var(--border-color)',
                        }}
                      />
                    </Tooltip>
                  ))}
                </Grid>
              ))}
            </Grid>
          </Flex>
          <Flex
            alignItems="start"
            css={{ width: '100%' }}
            direction="column"
            gap="5"
            id="typography"
          >
            <H2>Typography</H2>
            <Box>
              <Label>Display</Label>
              <Text size="4">
                Almost before we knew it, we had left the ground.
              </Text>
            </Box>
            <Box>
              <Label>Numeric (experimenting)</Label>
              <Text size="3" family="numeric">
                1 AU = 1,495978707x10<sup>11</sup> m
              </Text>
            </Box>
            <Box>
              <Label>Mono</Label>
              <Text size="3" family="mono">
                console.log(foobar)
              </Text>
            </Box>
            <Box>
              <Label>H1</Label>
              <Heading as="h1" size="4">
                Almost before we knew it, we had left the ground.
              </Heading>
            </Box>
            <Box>
              <Label>H2</Label>
              <Heading as="h2" size="3">
                Almost before we knew it, we had left the ground.
              </Heading>
            </Box>
            <Box>
              <Label>H3</Label>
              <Heading as="h3" size="2">
                Almost before we knew it, we had left the ground.
              </Heading>
            </Box>
            <Box>
              <Label>H4</Label>
              <Heading as="h4" size="1">
                Almost before we knew it, we had left the ground.
              </Heading>
            </Box>
            <Box>
              <Label>Text size 7</Label>
              <Text as="p" size="7">
                Almost before we knew it, we had left the ground.
              </Text>
            </Box>
            <Box>
              <Label>Text size 6</Label>
              <Text as="p" size="6">
                Almost before we knew it, we had left the ground.
              </Text>
            </Box>
            <Box>
              <Label>Text size 5</Label>
              <Text as="p" size="5">
                Almost before we knew it, we had left the ground.
              </Text>
            </Box>
            <Box>
              <Label>Text size 4</Label>
              <Text as="p" size="4">
                Almost before we knew it, we had left the ground.
              </Text>
            </Box>
            <Box>
              <Label>Text size 3</Label>
              <Text as="p" size="3">
                Almost before we knew it, we had left the ground.
              </Text>
            </Box>
            <Box>
              <Label>Text size 2</Label>
              <Text as="p" size="2">
                Almost before we knew it, we had left the ground.
              </Text>
            </Box>
            <Box>
              <Label>Text size 1</Label>
              <Text as="p" size="1">
                Almost before we knew it, we had left the ground.
              </Text>
            </Box>
            <Box>
              <Label>Text gradient</Label>
              <Text
                as="p"
                size="3"
                gradient
                css={{
                  backgroundImage: `linear-gradient(
              91.83deg,
              var(--pink-500) -20.26%,
              var(--blue-600) 20.55%,
              var(--blue-800) 60.81%
            )`,
                }}
              >
                Almost before we knew it, we had left the ground.
              </Text>
            </Box>
            <Box>
              <Label>Strong</Label>
              <Strong>Almost before we knew it, we had left the ground.</Strong>
            </Box>
            <Box>
              <Label>EM</Label>
              <EM>Almost before we knew it, we had left the ground.</EM>
            </Box>
            <Box>
              <Label>BigNum (WIP)</Label>
              <Text family="numeric" size="7" weight="4">
                1 AU = 1,495978707x10<sup>11</sup> m
              </Text>
            </Box>
            <Box>
              <Label>BigNum Outline (Experimenting)</Label>
              <Text
                family="numeric"
                size="7"
                weight="4"
                css={{
                  WebkitTextStrokeColor: 'var(--accent)',
                }}
                outline
              >
                1 AU = 1,495978707x10<sup>11</sup> m
              </Text>
            </Box>
            <Box>
              <Text
                family="numeric"
                size="7"
                weight="4"
                css={{
                  WebkitTextStrokeColor: 'var(--danger)',
                }}
                outline
              >
                1 AU = 1,495978707x10<sup>11</sup> m
              </Text>
            </Box>
          </Flex>
          <Flex
            alignItems="start"
            css={{ alignSelf: 'stretch' }}
            direction="column"
            gap="5"
            id="icons"
          >
            <H2>Icons</H2>
            <IconSection />
          </Flex>
          <Flex
            alignItems="start"
            css={{ alignSelf: 'stretch' }}
            direction="column"
            gap="5"
          >
            <H2>Shadows</H2>
            <Grid
              gap={4}
              css={{
                width: '100%',
                padding: 'var(--space-5) var(--space-3)',
              }}
              templateColumns="repeat(2, 1fr)"
            >
              <Card depth={0}>
                <Card.Body>
                  <Text size="2" variant="secondary">
                    Shadow 0
                  </Text>
                </Card.Body>
              </Card>
              <Card depth={1}>
                <Card.Body>
                  <Text size="2" variant="secondary">
                    Shadow 1
                  </Text>
                </Card.Body>
              </Card>
              <Card depth={2}>
                <Card.Body>
                  <Text size="2" variant="secondary">
                    Shadow 2
                  </Text>
                </Card.Body>
              </Card>
              <Card depth={3}>
                <Card.Body>
                  <Text size="2" variant="secondary">
                    Shadow 3
                  </Text>
                </Card.Body>
              </Card>
            </Grid>
            <Grid
              gap={4}
              css={{
                width: '100%',
                background: 'var(--emphasis)',
                padding: 'var(--space-5) var(--space-3)',
              }}
              templateColumns="repeat(2, 1fr)"
            >
              <Card
                css={{
                  '--shadow-color': dark ? '222deg 39% 5%' : '222deg 39% 80%',
                }}
                depth={0}
              >
                <Card.Body>
                  <Text size="2" variant="secondary">
                    Custom Shadow 0
                  </Text>
                </Card.Body>
              </Card>
              <Card
                css={{
                  '--shadow-color': dark ? '222deg 39% 5%' : '222deg 39% 80%',
                }}
                depth={1}
              >
                <Card.Body>
                  <Text size="2" variant="secondary">
                    Custom Shadow 1
                  </Text>
                </Card.Body>
              </Card>
              <Card
                css={{
                  '--shadow-color': dark ? '222deg 39% 5%' : '222deg 39% 80%',
                }}
                depth={2}
              >
                <Card.Body>
                  <Text size="2" variant="secondary">
                    Custom Shadow 2
                  </Text>
                </Card.Body>
              </Card>
              <Card
                css={{
                  '--shadow-color': dark ? '222deg 39% 5%' : '222deg 39% 80%',
                }}
                depth={3}
              >
                <Card.Body>
                  <Text size="2" variant="secondary">
                    Custom Shadow 3
                  </Text>
                </Card.Body>
              </Card>
            </Grid>
          </Flex>
          <Flex
            alignItems="start"
            as="section"
            css={{ alignSelf: 'stretch' }}
            direction="column"
            gap="5"
            id="lists"
          >
            <H2>Lists</H2>
            <Grid
              templateColumns="repeat(2, 1fr)"
              gapY="5"
              css={{ width: '100%' }}
            >
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
          </Flex>
          <Flex
            alignItems="start"
            as="section"
            css={{ alignSelf: 'stretch' }}
            direction="column"
            gap="5"
            id="button"
          >
            <H2>Buttons</H2>
            <Grid gap={5}>
              <Glow>
                <Button variant="primary">Button</Button>
              </Glow>
              <Button variant="primary">Button</Button>
              <Button variant="primary" endIcon={<Icon.External size="4" />}>
                Portfolio
              </Button>
              <Button variant="primary" startIcon={<Icon.Twitter size="4" />}>
                Follow me!
              </Button>
              <Button variant="primary" disabled>
                Button
              </Button>
              <Button variant="secondary">Button</Button>
              <Button variant="secondary" endIcon={<Icon.External size="4" />}>
                Portfolio
              </Button>
              <Button variant="secondary" startIcon={<Icon.Twitter size="4" />}>
                Follow me!
              </Button>
              <Button variant="secondary" disabled>
                Button
              </Button>
              <Button
                aria-label="Follow me on Twitter!"
                variant="icon"
                icon={<Icon.Twitter />}
              />
              <Button
                aria-label="Follow me on Twitter!"
                disabled
                variant="icon"
                icon={<Icon.Twitter />}
              />
              <Button
                aria-label="Follow me on Twitter!"
                size="small"
                variant="icon"
                icon={<Icon.Twitter />}
              />
              <Button
                aria-label="Follow me on Twitter!"
                disabled
                size="small"
                variant="icon"
                icon={<Icon.Twitter />}
              />
            </Grid>
          </Flex>
          <Flex
            alignItems="start"
            as="section"
            css={{ alignSelf: 'stretch' }}
            direction="column"
            gap="5"
            id="anchor"
          >
            <H2>Anchor</H2>
            <Grid gap={1}>
              <h3>
                <Anchor href="https://twitter.com/MaximeHeckel" favicon>
                  @MaximeHeckel
                </Anchor>
              </h3>
              <p>
                <Anchor
                  href="https://twitter.com/MaximeHeckel"
                  discreet
                  favicon
                >
                  @MaximeHeckel
                </Anchor>
              </p>
              <h3>
                <Anchor
                  href="https://bsky.app/profile/maxime.bsky.social"
                  favicon
                >
                  @maxime.bsky.social
                </Anchor>
              </h3>
              <p>
                <Anchor
                  href="https://bsky.app/profile/maxime.bsky.social"
                  favicon
                  discreet
                >
                  @maxime.bsky.social
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
          </Flex>
          <Flex
            alignItems="start"
            as="section"
            css={{ alignSelf: 'stretch' }}
            direction="column"
            gap="5"
            id="form-components"
          >
            <H2>Form Components</H2>
            <Flex css={{ width: '100%' }} gap={2}>
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
                width: '100%',
              }}
              templateColumns="repeat(2, 1fr)"
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
              css={{
                width: '100%',
              }}
              templateColumns="repeat(2, minmax(2rem, 1fr))"
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
              css={{
                width: '100%',
              }}
              templateColumns="repeat(2, minmax(2rem, 1fr))"
            >
              <Switch id="switch1" aria-label="Switch" label="Switch" />
              <Switch
                id="switch2"
                aria-label="Switch"
                label="Switch"
                disabled
              />
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
              css={{
                width: '100%',
              }}
              templateColumns="repeat(2, minmax(2rem, 1fr))"
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
              css={{
                width: '100%',
              }}
              templateColumns="repeat(2, minmax(2rem, 1fr))"
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
          </Flex>
          <Flex
            alignItems="start"
            as="section"
            css={{ alignSelf: 'stretch' }}
            direction="column"
            gap="5"
            id="cards"
          >
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
          </Flex>
          <Flex
            alignItems="start"
            as="section"
            direction="column"
            gap="5"
            id="tooltip"
          >
            <H2>Tooltip</H2>
            <Tooltip
              id="exampletooltip"
              content="@MaximeHeckel"
              visuallyHiddenText="Follow Me on Twitter"
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
                <Icon.Twitter stroke="var(--text-tertiary)" /> Hover Me!
              </Flex>
            </Tooltip>
          </Flex>
          <Flex
            alignItems="start"
            as="section"
            css={{ alignSelf: 'stretch' }}
            direction="column"
            gap="5"
            id="pill"
          >
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
          </Flex>
          <Flex
            alignItems="start"
            as="section"
            css={{ alignSelf: 'stretch' }}
            direction="column"
            gap="5"
            id="callout"
          >
            <H2>Callout</H2>
            <Grid css={{ width: '100%' }} gapY={8}>
              <Callout variant="info">Info Callout</Callout>
              <Callout label="Learn more" variant="info">
                Info Callout
              </Callout>
              <Callout variant="danger">Danger Callout</Callout>
              <Callout label="Be careful!" variant="danger">
                Danger Callout
              </Callout>
            </Grid>
          </Flex>
          <Flex
            alignItems="start"
            as="section"
            css={{ alignSelf: 'stretch' }}
            direction="column"
            gap="5"
            id="blockquote"
          >
            <Blockquote>
              <Text as="p">
                Almost before we knew it, we had left the ground.
              </Text>
            </Blockquote>
          </Flex>
          <Flex
            alignItems="start"
            as="section"
            css={{ alignSelf: 'stretch' }}
            direction="column"
            gap="5"
            id="inline-code"
          >
            <H2>Inline Code</H2>
            <InlineCode>{"const foo = () => 'bar'"}</InlineCode>
          </Flex>
          <Flex
            alignItems="start"
            as="section"
            css={{ alignSelf: 'stretch' }}
            direction="column"
            gap="5"
            id="code-block"
          >
            <H2>Code Block</H2>
            <Box css={{ width: '100%' }}>
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
            </Box>
            <Box css={{ width: '100%' }}>
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
            </Box>
            <Box css={{ width: '100%' }}>
              <Label>Sandpack Code Block</Label>
              <SandpackExample />
            </Box>
          </Flex>
          <Flex
            alignItems="start"
            as="section"
            css={{ alignSelf: 'stretch' }}
            direction="column"
            gap="5"
            id="details-summary"
          >
            <H2>Details/Summary</H2>
            <Details>
              <Details.Summary>Summary: Some short text</Details.Summary>
              <Details.Content>
                Content. Some long text nested inside the component. Useful to
                avoid long, optional content. It can take some simple strings or
                some other custom React components. As you want!
              </Details.Content>
            </Details>
          </Flex>
          <Flex
            alignItems="start"
            as="section"
            css={{ alignSelf: 'stretch' }}
            direction="column"
            gap="5"
            id="command-center"
          >
            <H2>Command Center / Search </H2>
            <Button variant="primary" onClick={() => setShowSearch(true)}>
              Show Command Center
            </Button>
            <Search onClose={() => setShowSearch(false)} open={showSearch} />
          </Flex>
          <Flex
            alignItems="start"
            as="section"
            css={{ alignSelf: 'stretch' }}
            direction="column"
            gap="5"
            id="tweet"
          >
            <H2>Tweet</H2>
            <Tweet tweet={props.tweets['1386013361809281024']} />
          </Flex>
          <Flex
            alignItems="start"
            as="section"
            css={{ alignSelf: 'stretch' }}
            direction="column"
            gap="5"
            id="image"
          >
            <H2>Image</H2>
            <Image
              src="blog/bayermatrix"
              alt="Diagram showcasing the process of applying the 4x4 Bayer Matrix on the input buffer of a scene and obtaining the dithering pattern based on the threshold value matching each pixel"
              width={700}
              height={298}
            />
          </Flex>
          <Flex
            alignItems="start"
            as="section"
            css={{ alignSelf: 'stretch', marginBottom: 'var(--space-9)' }}
            direction="column"
            gap="5"
            id="before-after"
          >
            <H2>Before / After Image</H2>
            <BeforeAfterImage
              alt="Screenshot showcasing the blue noise dithering applied to our cloud scene"
              beforeSrc="/blog/blue-noise-dithering-before.png"
              afterSrc="/blog/blue-noise-dithering-after.png"
              width={800}
              height={511}
            />
          </Flex>
        </Flex>
      </Grid>
    </Layout>
  );
}

const IconSection = () => (
  <Flex direction="column" gap={8} alignItems="stretch" css={{ width: '100%' }}>
    <Grid flow="column" gap={4}>
      <Icon.Twitter variant="info" size={5} />
      <Icon.Twitter variant="danger" size={5} />
      <Icon.Twitter variant="success" size={5} />
      <Icon.Twitter variant="warning" size={5} />
      <Icon.Twitter variant="primary" size={5} />
      <Icon.Twitter variant="secondary" size={5} />
      <Icon.Twitter variant="tertiary" size={5} />
    </Grid>
    <Grid gapY={4} flow="row" align="center" templateColumns="repeat(5, 1fr)">
      <Icon.Twitter variant="default" size={7} />
      <Icon.Twitter variant="default" size={6} />
      <Icon.Twitter variant="default" size={5} />
      <Icon.Twitter variant="default" size={4} />
      <Icon.Twitter variant="default" size={3} />
      <Icon.Bluesky variant="default" size={7} />
      <Icon.Bluesky variant="default" size={6} />
      <Icon.Bluesky variant="default" size={5} />
      <Icon.Bluesky variant="default" size={4} />
      <Icon.Bluesky variant="default" size={3} />
      <Icon.Github variant="default" size={7} />
      <Icon.Github variant="default" size={6} />
      <Icon.Github variant="default" size={5} />
      <Icon.Github variant="default" size={4} />
      <Icon.Github variant="default" size={3} />
      <Icon.Contact variant="default" size={7} />
      <Icon.Contact variant="default" size={6} />
      <Icon.Contact variant="default" size={5} />
      <Icon.Contact variant="default" size={4} />
      <Icon.Contact variant="default" size={3} />
      <Icon.Map variant="default" size={7} />
      <Icon.Map variant="default" size={6} />
      <Icon.Map variant="default" size={5} />
      <Icon.Map variant="default" size={4} />
      <Icon.Map variant="default" size={3} />
      <Icon.External variant="default" size={7} />
      <Icon.External variant="default" size={6} />
      <Icon.External variant="default" size={5} />
      <Icon.External variant="default" size={4} />
      <Icon.External variant="default" size={3} />
      <Icon.Map variant="default" size={7} />
      <Icon.Map variant="default" size={6} />
      <Icon.Map variant="default" size={5} />
      <Icon.Map variant="default" size={4} />
      <Icon.Map variant="default" size={3} />
      <Icon.Enter variant="default" size={7} />
      <Icon.Enter variant="default" size={6} />
      <Icon.Enter variant="default" size={5} />
      <Icon.Enter variant="default" size={4} />
      <Icon.Enter variant="default" size={3} />
      <Icon.Arrow variant="default" size={7} />
      <Icon.Arrow variant="default" size={6} />
      <Icon.Arrow variant="default" size={5} />
      <Icon.Arrow variant="default" size={4} />
      <Icon.Arrow variant="default" size={3} />
      <Icon.Portfolio variant="default" size={7} />
      <Icon.Portfolio variant="default" size={6} />
      <Icon.Portfolio variant="default" size={5} />
      <Icon.Portfolio variant="default" size={4} />
      <Icon.Portfolio variant="default" size={3} />
      <Icon.Play variant="default" size={7} />
      <Icon.Play variant="default" size={6} />
      <Icon.Play variant="default" size={5} />
      <Icon.Play variant="default" size={4} />
      <Icon.Play variant="default" size={3} />
      <Icon.Pause variant="default" size={7} />
      <Icon.Pause variant="default" size={6} />
      <Icon.Pause variant="default" size={5} />
      <Icon.Pause variant="default" size={4} />
      <Icon.Pause variant="default" size={3} />
      <Icon.Repeat variant="default" size={7} />
      <Icon.Repeat variant="default" size={6} />
      <Icon.Repeat variant="default" size={5} />
      <Icon.Repeat variant="default" size={4} />
      <Icon.Repeat variant="default" size={3} />
      <Icon.Info variant="default" size={7} />
      <Icon.Info variant="default" size={6} />
      <Icon.Info variant="default" size={5} />
      <Icon.Info variant="default" size={4} />
      <Icon.Info variant="default" size={3} />
      <Icon.Alert variant="default" size={7} />
      <Icon.Alert variant="default" size={6} />
      <Icon.Alert variant="default" size={5} />
      <Icon.Alert variant="default" size={4} />
      <Icon.Alert variant="default" size={3} />
      <Icon.Stack variant="default" size={7} />
      <Icon.Stack variant="default" size={6} />
      <Icon.Stack variant="default" size={5} />
      <Icon.Stack variant="default" size={4} />
      <Icon.Stack variant="default" size={3} />
    </Grid>
  </Flex>
);

export async function getStaticProps() {
  const tweets = await getTweets(['1386013361809281024']);

  return { props: { tweets } };
}
