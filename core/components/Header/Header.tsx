import {
  Flex,
  Grid,
  Tooltip,
  useKeyboardShortcut,
} from '@maximeheckel/design-system';
import Logo from '@core/components/Logo';
import useProgress from '@core/hooks/useProgress';
import useScrollCounter from '@core/hooks/useScrollCounter';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import {
  fixTruncate,
  HeaderContent,
  HeaderPadding,
  HeaderProgressBar,
  HeaderWrapper,
} from './Styles';
import HeaderTitle from './Title';
import { HeaderProps } from './types';
import { templateColumnsMedium } from 'styles/grid';

// TODO Abstract these out
const CommandCenterButton = dynamic(
  () => import('../Buttons/CommandCenterButton')
);
const LightDarkSwitcher = dynamic(() => import('../Buttons/LightDarkSwitcher'));
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
  const reached = useScrollCounter(offsetHeight / 2);
  const readingProgress = useProgress();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useKeyboardShortcut('ctrl+k|meta+k', () => setIsSearchOpen(true));

  return (
    <>
      <a
        className="hidden-layout h-card"
        data-testid="twitter-link"
        aria-label="Follow me on Twitter"
        title="Follow me on Twitter"
        rel="me"
        href="https://twitter.com/MaximeHeckel"
      >
        @MaximeHeckel
      </a>
      <Search open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <HeaderWrapper
        initial="open"
        animate={reached ? 'collapsed' : 'open'}
        variants={headerVariants}
        css={{
          borderColor: reached ? 'var(--border-color)' : 'transparent',
        }}
      >
        <Grid gapX={4} templateColumns={templateColumnsMedium}>
          <HeaderContent
            alignItems="center"
            justifyContent="space-between"
            className={fixTruncate()}
          >
            <Flex className={fixTruncate()}>
              <Tooltip id="hometooltip" content="Home">
                <span>
                  <Link
                    aria-label="Home"
                    aria-describedby="hometooltip"
                    data-testid="header-logo"
                    href="/"
                    passHref
                  >
                    <Logo alt="Logo" size={40} />
                  </Link>
                </span>
              </Tooltip>
              {title ? <HeaderTitle text={title} /> : null}
            </Flex>
            <Flex gap={3}>
              <CommandCenterButton
                isSearchShown={isSearchOpen}
                onClick={() => setIsSearchOpen(true)}
              />
              <LightDarkSwitcher />
            </Flex>
          </HeaderContent>
        </Grid>
        {showProgressBarOnMobile ? (
          <HeaderProgressBar
            css={{ '--progress': `${readingProgress * 100}%` }}
          />
        ) : null}
      </HeaderWrapper>
      <HeaderPadding css={{ '--offsetHeight': `${offsetHeight}px` }} />
    </>
  );
};

export default Header;
