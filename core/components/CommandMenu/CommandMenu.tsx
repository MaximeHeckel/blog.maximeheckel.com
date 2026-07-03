import {
  Box,
  Icon,
  useDebouncedValue,
  VisuallyHidden,
} from '@maximeheckel/design-system';
import { Command } from 'cmdk';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/router';
import {
  KeyboardEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { ContactIcon, SearchIcon } from '../Icons';
import { ScreenReaderOnly } from '../ScreenReaderOnly';
import { useLocalSearch } from '../Search/useLocalSearch';
import * as S from './CommandMenu.styles';
import { CommandMenuContext } from './CommandMenuContext';

const MAX_RECENT_SEARCHES = 5;
const RECENT_SEARCHES_KEY = 'commandmenu-recent-searches';

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAskAI?: () => void;
}

const NAVIGATION_ITEMS = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'design', label: 'Design System', href: '/design/' },
  { id: 'glossary', label: 'Glossary', href: '/glossary' },
  { id: 'rss', label: 'RSS', href: '/rss.xml' },
] as const;

interface LinkItem {
  id: string;
  label: string;
  href: string;
  icon: 'Twitter' | 'Bluesky' | 'Contact' | 'Map' | 'Portfolio';
  description: string;
  detail?: string;
  internal?: boolean;
}

const LINK_ITEMS: LinkItem[] = [
  {
    id: 'work',
    label: 'Work',
    href: 'https://maximeheckel.com',
    icon: 'Portfolio',
    description: 'Link redirects to my portfolio',
    detail: 'maximeheckel.com',
  },
  {
    id: 'contact',
    label: 'Contact',
    href: 'mailto:hello@maximeheckel.com',
    icon: 'Contact',
    description: 'Link opens your default mail client',
    detail: 'hello@maximeheckel.com',
  },
  {
    id: 'twitter',
    label: "Twitter (yes that's still how I call it)",
    href: 'https://twitter.com/MaximeHeckel',
    icon: 'Twitter',
    description: 'Link redirects to my Twitter profile page',
  },
  {
    id: 'bluesky',
    label: 'Bluesky',
    href: 'https://bsky.app/profile/maxime.bsky.social',
    icon: 'Bluesky',
    description: 'Link redirects to my Bluesky profile page',
  },
  {
    id: 'roadmap',
    label: 'Roadmap',
    href: "https://www.figma.com/file/uvkUCtxXs7Vvmj58sHh0TE/Maxime's-Public-Roadmap?node-id=0%3A1",
    icon: 'Map',
    description: 'Link redirects to a Figjam file with upcoming projects',
  },
];

const IconMap: Record<
  LinkItem['icon'],
  React.ComponentType<{ size?: number | string }>
> = {
  Twitter: Icon.Twitter,
  Bluesky: Icon.Bluesky,
  Contact: ContactIcon,
  Map: Icon.Map,
  Portfolio: Icon.Portfolio,
};

const getRecentSearches = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('error getting recent searches', error);
    return [];
  }
};

const saveRecentSearch = (query: string): string[] => {
  if (typeof window === 'undefined' || !query.trim())
    return getRecentSearches();
  try {
    const searches = getRecentSearches();
    const filtered = searches.filter(
      (s) => s.toLowerCase() !== query.toLowerCase()
    );
    const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('error saving recent search', error);
    return getRecentSearches();
  }
};

const clearRecentSearches = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('error clearing recent searches', error);
  }
};

const CommandMenu = (props: CommandMenuProps) => {
  const { open, onOpenChange, onAskAI } = props;
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const context = useContext(CommandMenuContext);
  const actions = context?.actions ?? [];

  const [page, setPage] = useState<'search' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 400);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const {
    status: searchStatus,
    results: searchResults,
    search,
    reset: resetSearch,
  } = useLocalSearch();

  useEffect(() => {
    if (page === 'search') {
      setRecentSearches(getRecentSearches());
    }
  }, [page]);

  useEffect(() => {
    if (page === 'search') {
      if (debouncedSearchQuery) {
        search(debouncedSearchQuery);
      } else {
        resetSearch();
      }
    }
  }, [page, debouncedSearchQuery, search, resetSearch]);

  const handleActionSelect = useCallback(
    (onSelect: () => void) => {
      onSelect();
      onOpenChange(false);
    },
    [onOpenChange]
  );

  const handleNavigationSelect = useCallback(
    (href: string) => {
      router.push(href);
      onOpenChange(false);
    },
    [router, onOpenChange]
  );

  const handleLinkSelect = useCallback(
    (href: string, internal?: boolean) => {
      if (internal) {
        router.push(href);
      } else {
        window.open(href, '_blank', 'noopener,noreferrer');
      }
      onOpenChange(false);
    },
    [router, onOpenChange]
  );

  const handleSearchResultSelect = useCallback(
    (url: string) => {
      if (debouncedSearchQuery) {
        const updated = saveRecentSearch(debouncedSearchQuery);
        setRecentSearches(updated);
      }
      const href = url.replace('https://blog.maximeheckel.com', '');
      router.push(href).then(() => window.scrollTo(0, 0));
      onOpenChange(false);
    },
    [router, onOpenChange, debouncedSearchQuery]
  );

  const handleAskAI = useCallback(() => {
    onOpenChange(false);
    onAskAI?.();
  }, [onOpenChange, onAskAI]);

  const handleRecentSearchSelect = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleClearRecentSearches = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (page === 'search') {
        if (e.key === 'Escape') {
          e.preventDefault();
          setPage(null);
          setSearchQuery('');
          resetSearch();
        } else if (e.key === 'Backspace' && !searchQuery) {
          e.preventDefault();
          setPage(null);
          resetSearch();
        }
      }
    },
    [page, searchQuery, resetSearch]
  );

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [open, page]);

  const isSearchMode = page === 'search';
  const showRecentSearches =
    isSearchMode &&
    searchStatus === 'initial' &&
    !debouncedSearchQuery &&
    !searchQuery;

  return (
    <AnimatePresence>
      {open ? (
        <Command.Dialog
          open={open}
          loop
          onOpenChange={onOpenChange}
          label="Command Menu"
          shouldFilter={!isSearchMode}
          onKeyDown={handleKeyDown}
        >
          <S.Overlay
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1.0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => onOpenChange(false)}
          />
          <S.Dialog
            as={motion.div}
            data-testid="command-menu"
            initial={{ opacity: 0, scale: 0.95, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, x: '-50%' }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <Box
              css={{
                position: 'relative',
                borderRadius: 'var(--border-radius-2)',
              }}
            >
              <S.CustomGlassMaterial />
              <ScreenReaderOnly as="h2">Command Menu</ScreenReaderOnly>
              <S.Input
                ref={inputRef}
                as={Command.Input}
                data-testid="command-input"
                placeholder={
                  isSearchMode ? 'Search blog posts...' : 'Type a command...'
                }
                value={isSearchMode ? searchQuery : undefined}
                onValueChange={isSearchMode ? setSearchQuery : undefined}
              />
              <S.List as={Command.List}>
                {isSearchMode ? (
                  <>
                    {searchStatus === 'loading' && searchQuery ? (
                      <S.Loading as={Command.Loading}>Searching...</S.Loading>
                    ) : null}

                    {searchStatus === 'done' &&
                    searchResults.length === 0 &&
                    debouncedSearchQuery ? (
                      <S.Empty as={Command.Empty}>
                        No posts found for &ldquo;{debouncedSearchQuery}&rdquo;
                      </S.Empty>
                    ) : null}

                    {showRecentSearches ? (
                      recentSearches.length > 0 ? (
                        <>
                          <S.Group as={Command.Group} heading="Recent searches">
                            {recentSearches.map((query) => (
                              <S.Item
                                key={query}
                                as={Command.Item}
                                value={query}
                                onSelect={() => handleRecentSearchSelect(query)}
                              >
                                <Icon.Arrow variant="tertiary" size={4} />
                                <S.ItemLabel>{query}</S.ItemLabel>
                              </S.Item>
                            ))}
                          </S.Group>
                          <S.Item
                            as={Command.Item}
                            value="Clear recent searches"
                            onSelect={handleClearRecentSearches}
                            keywords={['clear', 'recent', 'searches']}
                            css={{
                              color: 'var(--warning)',
                            }}
                          >
                            <Icon.Arrow variant="tertiary" size={4} />
                            <S.ItemLabel>Clear recent searches</S.ItemLabel>
                          </S.Item>
                        </>
                      ) : (
                        <S.Empty>No recent searches</S.Empty>
                      )
                    ) : null}

                    {searchResults.length > 0 && searchStatus !== 'loading' ? (
                      <S.Group as={Command.Group}>
                        {searchResults.map((result) => (
                          <S.Item
                            key={result.url}
                            as={Command.Item}
                            value={result.title}
                            onSelect={() =>
                              handleSearchResultSelect(result.url)
                            }
                            data-testid="search-result"
                          >
                            <Icon.Arrow variant="tertiary" size={4} />
                            <S.ItemLabel>{result.title}</S.ItemLabel>
                          </S.Item>
                        ))}
                      </S.Group>
                    ) : null}
                  </>
                ) : (
                  <>
                    <S.Empty as={Command.Empty}>No results found.</S.Empty>
                    <S.Group as={Command.Group} heading="Tools">
                      <S.Item
                        as={Command.Item}
                        value="Search blog posts"
                        keywords={['find', 'articles', 'posts']}
                        onSelect={() => setPage('search')}
                        data-testid="search-tool"
                      >
                        <SearchIcon />
                        <S.ItemLabel>Search blog posts...</S.ItemLabel>
                      </S.Item>
                      <S.Item
                        as={Command.Item}
                        value="Ask AI"
                        keywords={['ai', 'question', 'chat', 'assistant']}
                        onSelect={handleAskAI}
                        data-testid="aimode"
                      >
                        <Icon.AIChat size={4} />
                        <S.ItemLabel>Ask me anything...</S.ItemLabel>
                      </S.Item>

                      {actions.map((action) => {
                        const ActionIcon = action.icon;
                        return (
                          <S.Item
                            key={action.id}
                            as={Command.Item}
                            value={action.label}
                            keywords={action.keywords}
                            onSelect={() => handleActionSelect(action.onSelect)}
                          >
                            <ActionIcon size={4} />
                            <S.ItemLabel>{action.label}</S.ItemLabel>
                          </S.Item>
                        );
                      })}
                    </S.Group>

                    <S.Group
                      as={Command.Group}
                      heading="Navigation"
                      data-testid="navigation"
                    >
                      {NAVIGATION_ITEMS.map((item) => (
                        <S.Item
                          key={item.id}
                          as={Command.Item}
                          value={item.label}
                          onSelect={() => handleNavigationSelect(item.href)}
                          data-testid={`nav-${item.id}`}
                        >
                          <Icon.Arrow size={4} />
                          <S.ItemLabel>{item.label}</S.ItemLabel>
                        </S.Item>
                      ))}
                    </S.Group>

                    <S.Group
                      as={Command.Group}
                      heading="Links"
                      data-testid="links"
                    >
                      {LINK_ITEMS.map((item) => {
                        const ItemIcon = IconMap[item.icon];
                        return (
                          <S.Item
                            key={item.id}
                            as={Command.Item}
                            value={item.label}
                            onSelect={() =>
                              handleLinkSelect(item.href, item.internal)
                            }
                            data-testid={`link-${item.id}`}
                          >
                            <ItemIcon size={4} />
                            <S.ItemLabel>{item.label}</S.ItemLabel>
                            {item.detail ? (
                              <S.ItemDetail>{item.detail}</S.ItemDetail>
                            ) : null}
                            <VisuallyHidden as="p">
                              {item.description}
                            </VisuallyHidden>
                          </S.Item>
                        );
                      })}
                    </S.Group>
                  </>
                )}
              </S.List>
            </Box>
          </S.Dialog>
        </Command.Dialog>
      ) : null}
    </AnimatePresence>
  );
};

export { CommandMenu };
