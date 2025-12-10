import {
  styled,
  Anchor,
  Grid,
  Text,
  EM,
  Flex,
  Box,
} from '@maximeheckel/design-system';
import { format } from 'date-fns';
import {
  motion,
  useAnimation,
  useMotionValueEvent,
  useScroll,
} from 'motion/react';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';

import Logo from '@core/components/Logo';

import { HR } from '../HR';
import { ScrambledText } from '../ScrambledText';

const getBrowser = () => {
  if (typeof window === 'undefined') return 'Unknown';

  const isArc =
    window
      .getComputedStyle(document.documentElement)
      .getPropertyValue('--arc-palette-focus')
      .trim() !== '';

  if (isArc) return 'Arc Browser';

  const ua = navigator.userAgent;

  switch (true) {
    case ua.includes('Firefox'):
      return 'Firefox';
    case ua.includes('Chrome') && !ua.includes('Edg'):
      return 'Chromium';
    case ua.includes('Safari') && !ua.includes('Chrome'):
      return 'Safari';
    case ua.includes('Edg'):
      return 'Edge';
    case ua.includes('Opera') || ua.includes('OPR'):
      return 'Opera';
    default:
      return 'Unknown';
  }
};

const FooterBlock = styled('footer', {
  transition: '0.5s',
  width: '100%',
  paddingTop: '32px',
  height: 'fit-content',
  zIndex: -1,
  background: 'var(--gray-000)',
  backgroundImage: `
    linear-gradient(oklch(from var(--border-color) l c h / 50%) 1px, transparent 1px),
    linear-gradient(90deg, oklch(from var(--border-color) l c h / 50%) 1px, transparent 1px)
  `,
  backgroundSize: '17px 15px',
  backgroundPosition: '1px 1px',
  pointerEvents: 'auto',

  '@md': {
    position: 'sticky',
    bottom: 0,
  },
});

const commitSha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;

const TimeText = ({ disabled }: { disabled?: boolean }) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <time>
      <ScrambledText
        disabled={disabled}
        delay={0.5}
        speed={0.8}
        windowSize={3}
        size={1}
        family="mono"
        variant="tertiary"
      >
        {time}
      </ScrambledText>
    </time>
  );
};

const Footer = (props: { lastUpdated?: string }) => {
  const { lastUpdated } = props;

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [browser, setBrowser] = useState('Unknown');
  const footerRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const [isInView, setIsInView] = useState(false);

  const controls = useAnimation();

  useMotionValueEvent(scrollY, 'change', () => {
    const farEnoughToDisplayFooter =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 500;

    const hasReachedBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 150;

    if (farEnoughToDisplayFooter) {
      controls.set({
        visibility: 'visible',
      });
    } else {
      controls.set({
        visibility: 'hidden',
      });
    }

    if (hasReachedBottom) {
      setIsInView(true);
    }
  });

  useEffect(() => {
    setBrowser(getBrowser());
  }, []);

  useEffect(() => {
    // Handle initial dimensions
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Handle window resize
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const dimensionsText = `${dimensions.width}x${dimensions.height}`;

  const handleFocus = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'instant',
    });
  };

  return (
    <>
      <FooterBlock
        as={motion.footer}
        ref={footerRef}
        data-testid="footer"
        key="footer"
        initial={{ visibility: 'hidden' }}
        animate={controls}
        onFocus={handleFocus}
      >
        <Grid templateColumns="1fr minmax(auto, 712px) 1fr">
          <Flex
            as={Grid.Item}
            col={2}
            css={{
              padding: 'var(--space-4)',
              background: 'var(--gray-000)',
              border: '1px solid oklch(from var(--border-color) l c h / 33%)',
              borderRadius: 'var(--border-radius-2)',
              '@sm': {
                padding: 'var(--space-5)',
              },
            }}
            direction="column"
            justifyContent="space-evenly"
            gap={5}
          >
            <Grid
              css={{ width: '100%' }}
              gapY={4}
              templateColumns="repeat(3, 1fr)"
            >
              <Grid.Item col={1}>
                <Text as="p" size={2} variant="primary" weight="4">
                  Metadata
                </Text>
              </Grid.Item>
              <Grid.Item col={1}>
                <Text as="p" size={1} variant="primary">
                  Commit
                </Text>
                <Anchor
                  discreet
                  href={`https://github.com/maximeheckel/blog.maximeheckel.com/commit/${commitSha}`}
                  external
                >
                  <ScrambledText
                    disabled={!isInView}
                    delay={0.5}
                    speed={0.8}
                    windowSize={3}
                    css={{ cursor: 'pointer' }}
                    size={1}
                    family="mono"
                    variant="tertiary"
                  >
                    {commitSha?.slice(0, 7) || ''}
                  </ScrambledText>
                </Anchor>
              </Grid.Item>
              <Grid.Item col={2}>
                <Text as="p" size={1} variant="primary">
                  Browser
                </Text>
                <ScrambledText
                  disabled={!isInView}
                  delay={0.5}
                  speed={0.8}
                  windowSize={3}
                  size={1}
                  family="mono"
                  variant="tertiary"
                >
                  {browser}
                </ScrambledText>
              </Grid.Item>
              <Grid.Item col={3}>
                <Text as="p" size={1} variant="primary">
                  Current Time
                </Text>
                <TimeText disabled={!isInView} />
              </Grid.Item>
              <Grid.Item col={1}>
                <Text as="p" size={1} variant="primary">
                  Dimensions
                </Text>
                <ScrambledText
                  disabled={!isInView}
                  delay={0.5}
                  speed={0.8}
                  windowSize={3}
                  size={1}
                  family="mono"
                  variant="tertiary"
                >
                  {dimensionsText}
                </ScrambledText>
              </Grid.Item>
              <Grid.Item col={2}>
                <Text as="p" size={1} variant="primary">
                  Source
                </Text>
                <Anchor
                  discreet
                  external
                  href="https://github.com/maximeheckel/blog.maximeheckel.com"
                >
                  <ScrambledText
                    disabled={!isInView}
                    delay={0.5}
                    speed={0.8}
                    windowSize={3}
                    css={{ cursor: 'pointer' }}
                    size={1}
                    family="mono"
                    variant="tertiary"
                  >
                    blog
                  </ScrambledText>
                </Anchor>
              </Grid.Item>
              <Grid.Item col={3}>
                <Text as="p" size={1} variant="primary">
                  Last Updated
                </Text>
                <ScrambledText
                  disabled={!isInView}
                  delay={0.5}
                  speed={0.8}
                  windowSize={3}
                  size={1}
                  family="mono"
                  variant="tertiary"
                >
                  {lastUpdated
                    ? format(new Date(lastUpdated), 'MMM dd, yyyy')
                    : 'N/A'}
                </ScrambledText>
              </Grid.Item>
            </Grid>
            <HR />
            <Grid css={{ width: '100%' }} templateColumns="repeat(3, 1fr)">
              <Grid.Item col={1}>
                <Text as="p" size={2} variant="primary" weight="4">
                  Links
                </Text>
              </Grid.Item>
              <Grid.Item>
                <Text size={1}>
                  <Grid>
                    <Link href="/">Home</Link>
                    <Anchor discreet href="https://maximeheckel.com">
                      Work
                    </Anchor>
                    <Anchor
                      discreet
                      href="https://www.buymeacoffee.com/maximeheckel"
                    >
                      Support me!
                    </Anchor>
                  </Grid>
                </Text>
              </Grid.Item>
              <Grid.Item>
                <Text size={1}>
                  <Grid>
                    <Anchor
                      discreet
                      href="https://bsky.app/profile/maxime.bsky.social"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Bluesky
                    </Anchor>
                    <Anchor
                      discreet
                      href="https://twitter.com/MaximeHeckel"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Twitter
                    </Anchor>
                    <Link href="/rss.xml">RSS</Link>
                  </Grid>
                </Text>
              </Grid.Item>
            </Grid>
          </Flex>
        </Grid>
        <Grid
          css={{
            background: 'var(--gray-000)',
            width: '100%',
            padding: '8px 16px',
            marginTop: '32px',
            height: '88px',

            '@sm': {
              padding: '8px 32px',
            },
          }}
          templateColumns="1fr minmax(auto, 712px) 1fr"
        >
          <Flex
            as={Grid.Item}
            css={{ gap: 'var(--space-4) !important' }}
            col={2}
          >
            <Logo alt="Maxime Heckel's logo" size={40} />
            <Box>
              <Text
                as="p"
                css={{
                  margin: 0,
                  lineHeight: 1.4,
                  width: 200,
                }}
                size="1"
                variant="primary"
                weight="3"
              >
                © {new Date().getFullYear()} Maxime Heckel{' '}
                <EM size="1">Design & Built in NYC</EM>
              </Text>
            </Box>
          </Flex>
        </Grid>
      </FooterBlock>
    </>
  );
};

export default Footer;
