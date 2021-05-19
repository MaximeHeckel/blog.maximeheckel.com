import VisuallyHidden from '../VisuallyHidden';
import { ContactIcon, PortfolioIcon, RSSIcon, TwitterIcon } from '../Icons';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import Link from 'next/link';

const CommandCenterStatic = () => (
  <div
    css={css`
      background-color: var(--maximeheckel-colors-body);
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
    <Separator>Links</Separator>
    <Item data-testid="link" key="twitter-social-link">
      <a
        href="https://twitter.com/MaximeHeckel"
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: `none` }}
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
        style={{ textDecoration: `none` }}
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
        style={{ textDecoration: `none` }}
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
        <a title="RSS Feed" style={{ textDecoration: `none` }}>
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

const ShortcutKey = styled('span')`
  color: var(--maximeheckel-colors-brand);
  font-size: 14px;
  border-radius: var(--border-radius-1);
  padding: 8px 8px;
  background: var(--maximeheckel-colors-emphasis);
  &:not(:last-child) {
    margin-right: 16px;
  }
`;

const Item = styled('li')`
  height: 65px;
  margin-bottom: 0px;
  transition: 0.25s;
  list-style: none;
  color: var(--maximeheckel-colors-typeface-1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 25px;

  a {
    color: unset;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
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
