import { AnimatePresence } from 'framer-motion';
import Mousetrap from 'mousetrap';
import dynamic from 'next/dynamic';
import React from 'react';
import Flex from '../Flex';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../Logo';
import { CommandCenterButton, LightDarkSwitcher } from '../Button';
import { MainHeaderProps } from './types';
import Header from './Header';

const Search = dynamic(() => import('../Search'));

const MainHeader: React.FC<MainHeaderProps> = (props) => {
  const [showSearch, setShowSearch] = React.useState(false);
  const theme = useTheme();

  React.useEffect(() => {
    Mousetrap.bind(['ctrl+k'], () => setShowSearch((prevState) => !prevState));
    return () => {
      Mousetrap.unbind(['ctrl+k']);
    };
  }, []);

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
      <AnimatePresence>
        {props.search && showSearch ? (
          <Search onClose={() => setShowSearch(false)} />
        ) : null}
      </AnimatePresence>
      <Header
        sticky={props.sticky}
        collapsableOnScroll={props.collapsableOnScroll}
      >
        <Flex>
          <Header.Logo
            alt="Maxime Heckel's Blog logo"
            aria-label="Maxime Heckel's Blog"
          >
            <Logo />
          </Header.Logo>
          <Header.Title>{props.title}</Header.Title>
        </Flex>
        <Flex>
          {props.search ? (
            <CommandCenterButton
              isSearchShown={showSearch}
              onClick={() => setShowSearch(true)}
            />
          ) : null}
          {props.themeSwitcher && Object.keys(theme).length > 0 ? (
            <LightDarkSwitcher />
          ) : null}
        </Flex>
      </Header>
    </>
  );
};
export default MainHeader;
