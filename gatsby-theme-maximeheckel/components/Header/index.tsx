import React from 'react';
import { Logo } from './Logo';
import { Navigation } from './Navigation';
import { Title } from './Title';
import { Wrapper } from './Wrapper';
import Flex from '../Flex';
import { useTheme } from '../../context/ThemeContext';
import MHLogo from '../Logo';
import SearchBox from '../SearchBox';
import { CommandCenterButton, LightDarkSwitcher } from '../Button';
interface HeaderProps {
  sticky?: boolean;
  collapsableOnScroll?: boolean;
}
class Header extends React.Component<HeaderProps> {
  public static Wrapper = Wrapper;
  public static Logo = Logo;
  public static Title = Title;
  public static Navigation = Navigation;

  render() {
    const { children, collapsableOnScroll, sticky } = this.props;

    return (
      <Wrapper collapsableOnScroll={collapsableOnScroll} sticky={sticky}>
        {children}
      </Wrapper>
    );
  }
}

export interface MainHeaderProps {
  sticky?: boolean;
  collapsableOnScroll?: boolean;
  title?: string;
  rss?: boolean;
  search?: boolean;
  themeSwitcher?: boolean;
}

const DefaultHeader: React.FC<MainHeaderProps> = (props) => {
  const [showSearch, setShowSearch] = React.useState(false);
  const theme = useTheme();

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
      {props.search ? (
        <SearchBox
          showOverride={showSearch}
          onClose={() => setShowSearch(false)}
        />
      ) : null}
      <Header
        sticky={props.sticky}
        collapsableOnScroll={props.collapsableOnScroll}
      >
        <Flex>
          <Header.Logo
            alt="Maxime Heckel's Blog logo"
            aria-label="Maxime Heckel's Blog"
          >
            <MHLogo />
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
export default Header;
export { DefaultHeader, Logo, Navigation, Title, Wrapper };
