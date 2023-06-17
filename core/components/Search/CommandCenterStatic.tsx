import {
  css,
  Flex,
  Icon,
  Pill,
  Text,
  VisuallyHidden,
} from '@maximeheckel/design-system';
import { motion } from 'framer-motion';
import Link from 'next/link';
import React from 'react';
import { MAX_HEIGHT } from './constants';
import { Command, Sparkles } from './Icons';
import { Separator, Item, KBD, ShortcutList } from './Styles';
import useIndexItem from './useIndexItem';

const commandCenterStaticWrapper = css({
  maxHeight: `${MAX_HEIGHT}px`,
  overflowY: 'auto',
  padding: '0 8px',
});

const items = [
  'aimode-tools',
  'home-navigation',
  'design-navigation',
  'twitter-social-link',
  'email-link',
  'roadmap-link',
  'maximeheckelcom-link',
  'rss-link',
];

interface CommandCenterStaticProps {
  collapse: boolean;
  onItemClick: (item: string) => void;
}

const CommandCenterStatic = (props: CommandCenterStaticProps) => {
  const { collapse, onItemClick } = props;
  const [hidden, setHidden] = React.useState(false);

  const [
    selectedResult,
    previousResult,
    nextResult,
    // setSelectedResult,
  ] = useIndexItem(items);

  const handleKey = React.useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter':
          (document.getElementById(selectedResult)
            ?.children[0] as HTMLElement).click();
          break;
        case 'ArrowUp':
          event.preventDefault();
          previousResult();
          break;
        case 'ArrowDown':
          event.preventDefault();
          nextResult();
          break;
        default:
      }
    },
    [previousResult, nextResult, selectedResult]
  );

  React.useEffect(() => {
    if (selectedResult) {
      document
        .getElementById(selectedResult)
        ?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedResult]);

  React.useEffect(() => {
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [handleKey]);

  React.useEffect(() => {
    if (collapse) {
      setTimeout(() => {
        setHidden(true);
      }, 500);
    } else {
      setHidden(false);
    }
  }, [collapse]);

  return (
    <motion.div
      initial={false}
      animate={{
        height: collapse ? 0 : 468,
      }}
      transition={{ ease: 'easeInOut' }}
      style={{
        backgroundColor: 'var(--maximeheckel-colors-body)',
        borderBottomLeftRadius: 'var(--border-radius-2)',
        borderBottomRightRadius: 'var(--border-radius-2)',
        overflow: 'hidden',
        border: collapse
          ? 'none'
          : '1px solid var(--maximeheckel-border-color)',
      }}
    >
      <div aria-hidden={hidden} className={commandCenterStaticWrapper()}>
        <Separator>Tools</Separator>
        <Item
          data-testid="aimode"
          data-selected={selectedResult === 'aimode-tools'}
          id="aimode-tools"
          key="aimode-tools"
        >
          <Flex
            as="button"
            css={{ cursor: 'pointer' }}
            data-testid="aimode-button"
            onClick={() => {
              onItemClick('aiMode');
            }}
          >
            <Sparkles />
            <Text
              as="span"
              css={{ margin: '0 8px', textAlign: 'left', flex: 1 }}
              size="1"
              weight="3"
            >
              Ask me anything
            </Text>
            <Pill variant="success">Experimental</Pill>
          </Flex>
        </Item>
        <Separator>Navigation</Separator>
        <Item
          data-testid="navigation"
          data-selected={selectedResult === 'home-navigation'}
          id="home-navigation"
          key="home-navigation"
        >
          <Link href="/" passHref>
            <Icon.Arrow size={4} />
            <span style={{ marginLeft: '16px' }}>Home</span>
          </Link>
        </Item>
        <Item
          data-testid="design"
          data-selected={selectedResult === 'design-navigation'}
          id="design-navigation"
          key="design-navigation"
        >
          <Link href="/design/" passHref>
            <Icon.Arrow size={4} />
            <span style={{ marginLeft: '16px' }}>Design System</span>
          </Link>
        </Item>
        <Separator>Links</Separator>
        <Item
          data-testid="twitter-social-link"
          data-selected={selectedResult === 'twitter-social-link'}
          id="twitter-social-link"
          key="twitter-social-link"
        >
          <a
            href="https://twitter.com/MaximeHeckel"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon.Twitter />
            <span style={{ marginLeft: '15px' }}>Twitter</span>
            <VisuallyHidden as="p">
              Link redirects to my Twitter profile page
              https://twitter.com/MaximeHeckel.
            </VisuallyHidden>
          </a>
        </Item>
        <Item
          data-testid="email-link"
          data-selected={selectedResult === 'email-link'}
          id="email-link"
          key="email-link"
        >
          <a
            href="mailto:hello@maximeheckel.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon.Contact />
            <span style={{ marginLeft: '15px' }}>Contact</span>
            <VisuallyHidden as="p">
              Link opens your default mail client with my email address
              hello@maximeheckel.com prefilled.
            </VisuallyHidden>
          </a>
        </Item>
        <Item
          data-testid="roadmap-link"
          data-selected={selectedResult === 'roadmap-link'}
          id="roadmap-link"
          key="roadmap-link"
        >
          <a
            href="https://www.figma.com/file/uvkUCtxXs7Vvmj58sHh0TE/Maxime's-Public-Roadmap?node-id=0%3A1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon.Map />
            <span style={{ marginLeft: '15px' }}>Roadmap</span>
            <VisuallyHidden as="p">
              Link redirects to a Figjam file where you can see the roadmap with
              my upcoming projects and ideas.
            </VisuallyHidden>
          </a>
        </Item>
        <Item
          data-testid="maximeheckelcom-link"
          data-selected={selectedResult === 'maximeheckelcom-link'}
          id="maximeheckelcom-link"
          key="maximeheckelcom-link"
        >
          <a
            href="https://maximeheckel.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon.Portfolio />
            <span style={{ marginLeft: '15px' }}>Work</span>
            <VisuallyHidden as="p">
              Link redirects to my portfolio https://maximeheckel.com.
            </VisuallyHidden>
          </a>
        </Item>
        <Item
          data-testid="rss-link"
          data-selected={selectedResult === 'rss-link'}
          id="rss-link"
          key="rss-link"
        >
          <Link href="/rss.xml" aria-label="RSS Feed" passHref>
            <Icon.RSS />
            <span style={{ marginLeft: '15px' }}>RSS</span>
            <VisuallyHidden as="p">
              Link redirects to the rss.xml file.
            </VisuallyHidden>
          </Link>
        </Item>
      </div>
      <ShortcutList>
        <Flex alignItems="center">
          <Text as="span" css={{ opacity: 0.7 }} size="1" variant="tertiary">
            Cmd
          </Text>
          <Flex>
            <KBD>
              <Command width="16" height="16" />
            </KBD>
            <KBD>K</KBD>
          </Flex>
        </Flex>
        <Flex alignItems="center">
          <Text as="span" css={{ opacity: 0.7 }} size="1" variant="tertiary">
            Theme
          </Text>
          <Flex>
            <KBD>
              <Command width="16" height="16" />
            </KBD>
            <KBD>T</KBD>
          </Flex>
        </Flex>
        <Flex alignItems="center">
          <Text as="span" css={{ opacity: 0.7 }} size="1" variant="tertiary">
            Open
          </Text>
          <Flex>
            <KBD>
              <Icon.Enter size="4" />
            </KBD>
          </Flex>
        </Flex>
      </ShortcutList>
    </motion.div>
  );
};

export { CommandCenterStatic };
