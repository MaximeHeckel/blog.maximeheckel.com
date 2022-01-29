import Flex from '@theme/components/Flex';
import Grid from '@theme/components/Grid';
import Logo from '@theme/components/Logo';
import Tooltip from '@theme/components/Tooltip';
import useScrollCounter from '@theme/hooks/useScrollCounter';
import { AnimatePresence } from 'framer-motion';
import Mousetrap from 'mousetrap';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import React from 'react';
import {
  fixTruncate,
  HeaderContent,
  HeaderPadding,
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
  const { title, offsetHeight = 120 } = props;
  const [showSearch, setShowSearch] = React.useState(false);
  const reached = useScrollCounter(offsetHeight / 2);

  React.useEffect(() => {
    Mousetrap.bind(['ctrl+k'], () => setShowSearch((prevState) => !prevState));
    return () => {
      Mousetrap.unbind(['ctrl+k']);
    };
  }, []);

  // Make a generic hook for key presses
  React.useEffect(() => {
    const keyPressHandler = (e: KeyboardEvent): void => {
      if (showSearch) {
        switch (e.keyCode) {
          case 27:
            return setShowSearch(false);
          default:
            return;
        }
      }
    };

    document.addEventListener('keydown', keyPressHandler);

    return () => {
      document.removeEventListener('keydown', keyPressHandler);
    };
    // eslint-disable-next-line
  }, [showSearch]);

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
        <Grid columns="var(--layout-medium)" columnGap={20}>
          <HeaderContent
            alignItems="center"
            justifyContent="space-between"
            className={fixTruncate()}
          >
            <Flex className={fixTruncate()}>
              <Tooltip id="hometooltip" tooltipText="Home">
                <Link href="/">
                  <a aria-label="Home" aria-describedby="hometooltip">
                    <Logo alt="Logo" data-testid="header-logo" size={44} />
                  </a>
                </Link>
              </Tooltip>
              {title ? <HeaderTitle text={title} /> : null}
            </Flex>
            <Flex css={{ gap: '12px' }}>
              <CommandCenterButton
                isSearchShown={showSearch}
                onClick={() => setShowSearch(true)}
              />
              <LightDarkSwitcher />
            </Flex>
          </HeaderContent>
        </Grid>
      </HeaderWrapper>
      <HeaderPadding css={{ '--offsetHeight': `${offsetHeight}px` }} />
    </>
  );
};

export default Header;
