import {
  Box,
  Flex,
  Grid,
  InlineCode,
  Text,
  TextInput,
  keyframes,
  useDebouncedValue,
} from '@maximeheckel/design-system';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import type {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
} from 'react';

import { AnimatedNumberTicker } from '@core/components/AnimatedNumberTicker';
import { SearchIcon } from '@core/components/Icons';

export interface GlossaryTerm {
  aliases: string[];
  definition?: string;
  kind: 'function' | 'other';
  term: string;
}

interface GlossarySectionProps {
  terms: GlossaryTerm[];
}

const glossaryDimFade = keyframes({
  '0%, 35%': {
    opacity: 0.32,
  },
  '100%': {
    opacity: 1,
  },
});

const SEARCH_DEBOUNCE_DELAY = 300;

const getTermLetter = (term: string) => {
  const firstCharacter = term.trim().charAt(0).toUpperCase();
  return /^[A-Z]$/.test(firstCharacter) ? firstCharacter : '#';
};

const formatTerm = (term: string) => {
  return term.charAt(0).toUpperCase() + term.slice(1);
};

const getTermId = (term: string) => {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

const groupTerms = (terms: GlossaryTerm[]) => {
  const groups = new Map<string, GlossaryTerm[]>();

  for (const item of terms) {
    const letter = getTermLetter(item.term);
    const existingTerms = groups.get(letter) || [];
    groups.set(letter, [...existingTerms, item]);
  }

  return Array.from(groups.entries()).map(([letter, groupedTerms]) => ({
    letter,
    terms: groupedTerms,
  }));
};

const normalizeSearchValue = (value: string) => {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

const getSearchTokens = (query: string) => {
  return normalizeSearchValue(query).split(/\s+/).filter(Boolean);
};

const termMatchesFilter = (item: GlossaryTerm, tokens: string[]) => {
  if (tokens.length === 0) {
    return true;
  }

  const searchableValue = normalizeSearchValue(
    [item.term, item.definition, ...item.aliases].filter(Boolean).join(' ')
  );

  return tokens.every((token) => searchableValue.includes(token));
};

const renderGlossaryGroup = (group: {
  letter: string;
  terms: GlossaryTerm[];
}) => {
  const lastTerm = group.terms[group.terms.length - 1];

  return (
    <Grid
      as="section"
      data-glossary-group
      key={group.letter}
      css={{
        width: '100%',
        alignItems: 'start',
        borderTop: '1px solid oklch(from var(--border-color) l c h / 45%)',
        paddingTop: 'var(--space-4)',
      }}
      gapX={4}
      gapY={3}
      templateColumns="48px minmax(0, 1fr)"
    >
      <Grid.Item
        css={{
          alignSelf: 'start',
          paddingBottom:
            lastTerm.kind === 'function' && lastTerm?.definition
              ? 'calc(var(--space-2) + 1.45em)'
              : lastTerm?.definition
                ? 'calc(var(--space-2) + 1.125em)'
                : 0,
          position: 'sticky',
          top: 192,
        }}
      >
        <Text
          as="h2"
          css={{
            margin: 0,
            lineHeight: 1.35,
          }}
          family="mono"
          size="3"
          variant="tertiary"
          weight="4"
        >
          {group.letter}
        </Text>
      </Grid.Item>
      <Grid.Item>
        <Flex
          as="ul"
          alignItems="start"
          direction="column"
          gap="6"
          css={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            width: '100%',
          }}
        >
          {group.terms.map((item) => (
            <Box
              as="li"
              data-glossary-term
              id={getTermId(item.term)}
              key={item.term}
              css={{
                scrollMarginTop: '40vh',
                minWidth: 0,
                marginTop: 2,
              }}
            >
              <Flex alignItems="start" direction="column" gap="2">
                <Text
                  as="span"
                  css={{
                    overflowWrap: 'anywhere',
                    lineHeight: 1.15,
                    textAlign: 'left',
                  }}
                  size="1"
                  variant="primary"
                  weight="3"
                >
                  {item.kind === 'function' ? (
                    <Flex css={{ marginLeft: '-8px', marginTop: -4 }}>
                      <InlineCode>{item.term}</InlineCode>
                    </Flex>
                  ) : (
                    formatTerm(item.term)
                  )}
                </Text>
                {item.definition ? (
                  <Text
                    as="p"
                    css={{
                      margin: 0,
                      lineHeight: 1.45,
                      maxWidth: '100%',
                      textAlign: 'left',
                    }}
                    size="1"
                    variant="secondary"
                  >
                    {item.definition}
                  </Text>
                ) : null}
              </Flex>
            </Box>
          ))}
        </Flex>
      </Grid.Item>
    </Grid>
  );
};

const GlossarySection = (props: GlossarySectionProps) => {
  const { terms } = props;
  const [filterInput, setFilterInput] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const filter = useDebouncedValue(filterInput, SEARCH_DEBOUNCE_DELAY);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== 'f' ||
        (!event.metaKey && !event.ctrlKey)
      ) {
        return;
      }

      event.preventDefault();
      setIsFilterVisible(true);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const filteredTerms = useMemo(() => {
    const tokens = getSearchTokens(filter);

    return terms.filter((item) => termMatchesFilter(item, tokens));
  }, [filter, terms]);
  const groupedTerms = useMemo(
    () => groupTerms(filteredTerms),
    [filteredTerms]
  );
  const hasTerms = terms.length > 0;
  const hasFilteredTerms = filteredTerms.length > 0;
  const maxTermCountDigits = Math.max(1, String(terms.length).length);
  const termCountNoun = filteredTerms.length === 1 ? 'term' : 'terms';

  return (
    <Flex direction="column" gap="12">
      <Flex direction="column" gap="4">
        <Text
          as="h1"
          css={{
            margin: 0,
            fontWeight: 510,
            letterSpacing: 0,
            lineHeight: 1.1,
            textWrap: 'balance',
            textAlign: 'left',
            fontVariationSettings: '"opsz" 28',
            fontOpticalSizing: 'none',
          }}
          family="display"
          size="6"
          variant="primary"
        >
          Glossary
        </Text>
      </Flex>

      {hasTerms ? (
        <Flex
          as="section"
          css={{
            width: '100%',
            '&:has([data-glossary-term]:target) [data-glossary-group]': {
              animation: `${glossaryDimFade} 2100ms ease-out both`,
            },
            '&:has([data-glossary-term]:target) [data-glossary-group]:has([data-glossary-term]:target)':
              {
                animation: 'none',
                opacity: 1,
              },
            '&:has([data-glossary-term]:target) [data-glossary-group]:has([data-glossary-term]:target) [data-glossary-term]':
              {
                animation: `${glossaryDimFade} 2100ms ease-out both`,
              },
            '&:has([data-glossary-term]:target) [data-glossary-group]:has([data-glossary-term]:target) [data-glossary-term]:target':
              {
                animation: 'none',
                opacity: 1,
              },
          }}
          alignItems="start"
          direction="column"
          gap="6"
        >
          <Flex
            css={{
              width: '100%',
              justifyContent: 'space-between',
              '@media (max-width: 600px)': {
                gap: 'var(--space-3)',
              },
            }}
            alignItems="center"
            gap="4"
          >
            <AnimatedNumberTicker
              ariaLabel={`${String(filteredTerms.length).padStart(
                maxTermCountDigits,
                '0'
              )} ${termCountNoun}`}
              as="p"
              digitCount={maxTermCountDigits}
              css={{
                color: 'var(--text-tertiary)',
                fontSize: 13,
                letterSpacing: 0,
                margin: 0,
                textAlign: 'left',
                textTransform: 'uppercase',
              }}
              family="mono"
              size="1"
              suffix={termCountNoun}
              value={filteredTerms.length}
              weight="4"
            />
            <Box
              css={{
                alignItems: 'center',
                display: 'flex',
                flex: '0 1 280px',
                minHeight: 48,
                minWidth: 0,
                position: 'relative',
                width: '100%',
                '& input': {
                  paddingLeft: 38,
                },
                '& input::-webkit-search-cancel-button': {
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  display: 'none',
                },
                '& input::-webkit-search-decoration': {
                  WebkitAppearance: 'none',
                },
                '& input::-ms-clear': {
                  display: 'none',
                },
                '& [data-glossary-filter-icon]': {
                  transition: 'color 180ms ease',
                },
                '&:focus-within [data-glossary-filter-icon]': {
                  color: 'var(--accent)',
                },
                '@media (hover: hover) and (pointer: fine)': {
                  '&:hover [data-glossary-filter-icon]': {
                    color: 'var(--accent)',
                  },
                },
                '@media (max-width: 600px)': {
                  flexBasis: 190,
                },
              }}
            >
              <AnimatePresence initial={false}>
                {isFilterVisible ? (
                  <motion.div
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                    key="glossary-filter"
                    onAnimationStart={() => {
                      const filterInput = document.getElementById(
                        'glossary-filter'
                      ) as HTMLInputElement | null;

                      filterInput?.focus();
                      filterInput?.select();
                    }}
                    style={{
                      position: 'relative',
                      width: '100%',
                    }}
                    transition={{
                      duration: 0.12,
                      ease: 'easeOut',
                    }}
                  >
                    <Box
                      aria-hidden="true"
                      data-glossary-filter-icon
                      css={{
                        color: 'var(--text-tertiary)',
                        display: 'flex',
                        left: 14,
                        pointerEvents: 'none',
                        position: 'absolute',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 1,
                      }}
                    >
                      <SearchIcon size={16} />
                    </Box>
                    <TextInput
                      aria-label="Filter glossary terms"
                      id="glossary-filter"
                      onBlur={(event: FocusEvent<HTMLInputElement>) => {
                        if (event.currentTarget.value.trim().length === 0) {
                          setIsFilterVisible(false);
                        }
                      }}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setFilterInput(event.currentTarget.value)
                      }
                      onKeyDown={(
                        event: ReactKeyboardEvent<HTMLInputElement>
                      ) => {
                        if (event.key !== 'Escape') {
                          return;
                        }

                        setFilterInput('');
                        setIsFilterVisible(false);
                        event.currentTarget.blur();
                      }}
                      placeholder="Filter terms…"
                      type="search"
                      value={filterInput}
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </Box>
          </Flex>
          {hasFilteredTerms ? (
            groupedTerms.map(renderGlossaryGroup)
          ) : (
            <Box
              css={{
                borderTop:
                  '1px solid oklch(from var(--border-color) l c h / 45%)',
                paddingTop: 'var(--space-4)',
                width: '100%',
              }}
            >
              <Text as="p" css={{ margin: 0 }} size="2" variant="secondary">
                Can't find the definition you're looking for? Please let me know
                and I'll add it as soon as possible!
              </Text>
            </Box>
          )}
        </Flex>
      ) : (
        <Box
          as="section"
          css={{
            borderTop: '1px solid oklch(from var(--border-color) l c h / 45%)',
            paddingTop: 'var(--space-4)',
          }}
        >
          <Text as="p" size="2" variant="secondary">
            No glossary terms have been generated yet.
          </Text>
        </Box>
      )}
    </Flex>
  );
};

export { GlossarySection };
