import Flex from '@theme/components/Flex';
import Grid from '@theme/components/Grid';
import Logo from '@theme/components/Logo';
import Tooltip from '@theme/components/Tooltip';
import useKeyboardShortcut from '@theme/hooks/useKeyboardShortcut';
import useProgress from '@theme/hooks/useProgress';
import useScrollCounter from '@theme/hooks/useScrollCounter';
import { AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import React from 'react';
import {
  fixTruncate,
  HeaderContent,
  HeaderPadding,
  HeaderProgressBar,
  HeaderWrapper,
} from './Styles';
import HeaderTitle from './Title';
import { HeaderProps } from './types';

// TODO Abstract these out
const CommandCenterButton = dynamic(
  () => import('../Button/CommandCenterButton')
);
const LightDarkSwitcher = dynamic(() => import('../Button/LightDarkSwitcher'));
const Search = dynamic(() => import('../Search'));

const headerVariants = {
  open: {
    height: 120,
    transition: { ease: 'easeInOut', duration: 0.3 },
  },
  collapsed: {
    height: 60,
    transition: { ease: 'easeInOut', duration: 0.3, delayChildren: 0.5 },
  },
};

const Header = (props: HeaderProps) => {
  const { title, offsetHeight = 120, showProgressBarOnMobile } = props;
  const [showSearch, setShowSearch] = React.useState(false);
  const reached = useScrollCounter(offsetHeight / 2);
  const readingProgress = useProgress();

  useKeyboardShortcut('Escape', () => setShowSearch(false));
  useKeyboardShortcut('ctrl+k|meta+k', () => setShowSearch(true));

  return (
    <>
      {/** Do not delete the following! Needed for Webmention.io */}
      <a
        className="hidden h-card"
        data-testid="twitter-link"
        aria-label="Follow me on Twitter"
        title="Follow me on Twitter"
        rel="me"
        href="https://twitter.com/MaximeHeckel"
      >
        @MaximeHeckel
      </a>
      {/**
       * Gracefully show the search component when activated
       *
       * TODO: Abstract this away from the header
       */}
      <AnimatePresence>
        {showSearch ? <Search onClose={() => setShowSearch(false)} /> : null}
      </AnimatePresence>

      <HeaderWrapper
        initial="open"
        animate={reached ? 'collapsed' : 'open'}
        variants={headerVariants}
        css={{
          borderColor: reached
            ? 'var(--maximeheckel-border-color)'
            : 'transparent',
        }}
      >
        <Grid columns="medium" gapX={4}>
          <HeaderContent
            alignItems="center"
            justifyContent="space-between"
            className={fixTruncate()}
          >
            <Flex className={fixTruncate()}>
              <Tooltip id="hometooltip" tooltipText="Home">
                <Link href="/">
                  <a
                    aria-label="Home"
                    aria-describedby="hometooltip"
                    data-testid="header-logo"
                  >
                    <Logo alt="Logo" size={44} />
                  </a>
                </Link>
              </Tooltip>
              {title ? <HeaderTitle text={title} /> : null}
            </Flex>
            <Flex gap={3}>
              <CommandCenterButton
                isSearchShown={showSearch}
                onClick={() => setShowSearch(true)}
              />
              <LightDarkSwitcher />
            </Flex>
          </HeaderContent>
        </Grid>
        {showProgressBarOnMobile ? (
          <HeaderProgressBar
            style={{
              scaleX: readingProgress,
            }}
          />
        ) : null}
      </HeaderWrapper>
      <HeaderPadding css={{ '--offsetHeight': `${offsetHeight}px` }} />
    </>
  );
};

export default Header;
