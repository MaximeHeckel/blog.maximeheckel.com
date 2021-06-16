import { css } from '@emotion/react';
import styled from '@emotion/styled';
import Link from 'next/link';
import VisuallyHidden from '../VisuallyHidden';
import {
  ArrowIcon,
  ContactIcon,
  PortfolioIcon,
  RSSIcon,
  TwitterIcon,
} from '../Icons';
import { MAX_HEIGHT, HEIGHT } from './constants';

const CommandCenterStatic = () => (
  <div
    css={css`
      background-color: var(--maximeheckel-colors-body);
      max-height: ${MAX_HEIGHT}px;
      overflow-y: scroll;
    `}
  >
    <Separator>Shortcuts</Separator>
    <Item data-testid="shortcut" key="search-shortcut">
      <span>Command Center</span>
      <div>
        <ShortcutKey>ctrl</ShortcutKey>
        <ShortcutKey>k</ShortcutKey>
      </div>
    </Item>
    <Item data-testid="shortcut" key="theme-shortcut">
      <span>Switch Theme</span>
      <div>
        <ShortcutKey>ctrl</ShortcutKey>
        <ShortcutKey>t</ShortcutKey>
      </div>
    </Item>
    <Separator>Navigation</Separator>
    <Item data-testid="navigation" key="design-navigation">
      <Link href="/">
        <a>
          <ArrowIcon stroke="var(--maximeheckel-colors-typeface-2)" />
          <span style={{ marginLeft: '20px' }}>Home</span>
        </a>
      </Link>
    </Item>
    <Item data-testid="navigation" key="design-navigation">
      <Link href="/design/">
        <a>
          <ArrowIcon stroke="var(--maximeheckel-colors-typeface-2)" />
          <span style={{ marginLeft: '20px' }}>Design System</span>
        </a>
      </Link>
    </Item>
    <Separator>Links</Separator>
    <Item data-testid="link" key="twitter-social-link">
      <a
        href="https://twitter.com/MaximeHeckel"
        target="_blank"
        rel="noopener noreferrer"
      >
        <TwitterIcon stroke="var(--maximeheckel-colors-typeface-2)" />
        <span style={{ marginLeft: '15px' }}>Twitter</span>
        <VisuallyHidden as="p">
          Link redirects to my Twitter profile page
          https://twitter.com/MaximeHeckel.
        </VisuallyHidden>
      </a>
    </Item>
    <Item data-testid="link" key="email-link">
      <a
        href="mailto:hello@maximeheckel.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        <ContactIcon stroke="var(--maximeheckel-colors-typeface-2)" />
        <span style={{ marginLeft: '15px' }}>Contact</span>
        <VisuallyHidden as="p">
          Link opens your default mail client with my email address
          hello@maximeheckel.com prefilled.
        </VisuallyHidden>
      </a>
    </Item>
    <Item data-testid="link" key="maximeheckelcom-link">
      <a
        href="https://maximeheckel.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        <PortfolioIcon stroke="var(--maximeheckel-colors-typeface-2)" />
        <span style={{ marginLeft: '15px' }}>Work</span>
        <VisuallyHidden as="p">
          Link redirects to my portfolio https://maximeheckel.com.
        </VisuallyHidden>
      </a>
    </Item>
    <Item data-testid="link" key="rss-link">
      <Link href="/rss.xml" data-testid="rss-link" aria-label="RSS Feed">
        <a title="RSS Feed">
          <RSSIcon stroke="var(--maximeheckel-colors-typeface-2)" />
          <span style={{ marginLeft: '15px' }}>RSS</span>
          <VisuallyHidden as="p">
            Link redirects to the rss.xml file.
          </VisuallyHidden>
        </a>
      </Link>
    </Item>
  </div>
);

export { CommandCenterStatic };

const ShortcutKey = styled('kbd')`
  color: var(--maximeheckel-colors-brand);
  font-size: 14px;
  border-radius: var(--border-radius-0);
  padding: 6px 6px;
  background: var(--maximeheckel-colors-emphasis);
  &:not(:last-child) {
    margin-right: 12px;
  }
`;

const Item = styled('li')`
  height: ${HEIGHT}px;
  margin-bottom: 0px;
  transition: 0.25s;
  list-style: none;
  font-size: 0.875rem;
  color: var(--maximeheckel-colors-typeface-1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 25px;

  a {
    color: unset;
    width: 100%;
    height: ${HEIGHT}px;
    display: flex;
    align-items: center;
    text-decoration: none;
  }

  &:hover {
    background-color: var(--maximeheckel-colors-foreground);
    a {
      color: var(--maximeheckel-colors-brand);
    }

    svg {
      stroke: var(--maximeheckel-colors-brand);
    }
  }
`;

const Separator = styled('li')`
  height: 30px;
  width: 100%;
  font-size: 14px;
  background-color: var(--maximeheckel-colors-foreground);
  color: var(--maximeheckel-colors-typeface-1);
  display: flex;
  align-items: center;
  padding-left: 25px;
  padding-right: 25px;
  margin-bottom: 0;
`;
