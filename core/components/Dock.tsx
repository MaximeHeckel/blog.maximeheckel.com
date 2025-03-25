import {
  Box,
  Flex,
  GlassMaterial,
  Text,
  useKeyboardShortcut,
} from '@maximeheckel/design-system';
import debounce from 'lodash.debounce';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useCallback, useState } from 'react';

import Logo from './Logo';

enum NAV {
  INDEX = 'Index',
  ARTICLES = 'Articles',
  CMD = 'Cmd',
  ASK = 'Ask',
}

const Search = dynamic(() => import('@core/components/Search'));

const Dock = () => {
  const [focused, setFocused] = useState<NAV | null>(null);
  const [isKeyboardNav, setIsKeyboardNav] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAIModeOpen, setIsAIModeOpen] = useState(false);
  const router = useRouter();
  const isHomePage = router.pathname === '/' || router.pathname === '/new-home';

  const shouldReduceMotion = useReducedMotion();

  useKeyboardShortcut('ctrl+k|meta+k', () => setIsSearchOpen(true));

  const navItems = Object.values(NAV);
  const navActions = {
    [NAV.INDEX]: (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (isHomePage) {
        document.getElementById('index')?.scrollIntoView({
          behavior: shouldReduceMotion ? 'auto' : 'smooth',
          block: 'center',
        });
      } else {
        router.push('/');
      }
    },
    [NAV.ARTICLES]: (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (isHomePage) {
        document.getElementById('articles')?.scrollIntoView({
          behavior: shouldReduceMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      } else {
        router.push('/new-home#articles');
      }
    },
    [NAV.CMD]: () => {
      setIsSearchOpen(true);
    },
    [NAV.ASK]: () => {
      setIsAIModeOpen(true);
    },
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    setIsKeyboardNav(true);
    const currentIndex = focused ? navItems.indexOf(focused) : 0;

    switch (event.code) {
      case 'ArrowRight':
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % navItems.length;
        setFocused(navItems[nextIndex]);
        (
          document.querySelector(
            `[data-nav-item="${navItems[nextIndex]}"]`
          ) as HTMLElement
        )?.focus();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        const prevIndex =
          currentIndex - 1 < 0 ? navItems.length - 1 : currentIndex - 1;
        setFocused(navItems[prevIndex]);
        (
          document.querySelector(
            `[data-nav-item="${navItems[prevIndex]}"]`
          ) as HTMLElement
        )?.focus();
        break;
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetFocused = useCallback(
    debounce((value: NAV | null) => {
      setFocused(value);
    }, 100),
    []
  );

  return (
    <>
      <Search open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <Search
        open={isAIModeOpen}
        onClose={() => setIsAIModeOpen(false)}
        forceAIMode
      />
      <Box
        as="nav"
        css={{
          position: 'relative',
          '--thickness': '1.5px',
          borderRadius: 'var(--border-radius-2)',
        }}
      >
        <GlassMaterial />
        <Flex
          as="ul"
          css={{
            width: 'fit-content',
            margin: 0,
            padding: 8,
            gap: 0,
          }}
          onMouseLeave={() => {
            debouncedSetFocused(null);
            setIsKeyboardNav(false);
          }}
          onMouseMove={() => {
            if (isKeyboardNav) {
              setIsKeyboardNav(false);
            }
          }}
        >
          <Flex
            as="li"
            css={{
              paddingLeft: 4,
              // optical alignment
              marginBottom: 1,
            }}
          >
            <Logo alt="Logo" size={24} />
            <Box
              css={{
                width: 1,
                height: 24,
                backgroundColor: 'oklch(from var(--blue-500) l c h / 25%)',
                marginLeft: 12,
                marginRight: 4,
              }}
            />
          </Flex>
          {navItems.map((item) => (
            <Box
              as="li"
              key={item}
              css={{
                listStyle: 'none',
              }}
            >
              <Box
                as="button"
                css={{
                  background: 'transparent',
                  display: 'block',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  padding: '0 12px',
                  textDecoration: 'none',
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  '&:active': {
                    background: 'transparent',
                  },
                }}
                tabIndex={0}
                data-nav-item={item}
                onKeyDown={handleKeyDown}
                onClick={navActions[item]}
                onMouseEnter={() => !isKeyboardNav && debouncedSetFocused(item)}
                onFocus={() => debouncedSetFocused(item)}
              >
                <Text size="2" variant="primary" weight="4">
                  {item}
                </Text>
                <AnimatePresence>
                  {focused === item ? (
                    <motion.div
                      layoutId={shouldReduceMotion ? undefined : 'highlight'}
                      transition={{
                        layout: {
                          type: 'spring',
                          stiffness: 250,
                          damping: 27,
                          mass: 1,
                        },
                      }}
                      exit={{ '--opacity': 0 }}
                      animate={{ '--opacity': 0.2 }}
                      initial={{
                        '--opacity': 0,
                      }}
                      style={{
                        position: 'absolute',
                        top: -1,
                        left: 0,
                        width: '100%',
                        height: '26px',
                        zIndex: 0,
                      }}
                    >
                      <Box
                        css={{
                          backdropFilter: 'blur(2px)',
                          borderRadius: 8,
                          width: '100%',
                          height: '100%',

                          '@media (pointer: coarse)': {
                            display: 'none',
                          },
                        }}
                        style={{
                          background: 'var(--blue-400)',
                          opacity: 'var(--opacity)',
                        }}
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </Box>
            </Box>
          ))}
        </Flex>
      </Box>
    </>
  );
};

export { Dock };
