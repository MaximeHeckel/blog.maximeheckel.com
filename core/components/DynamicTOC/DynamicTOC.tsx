import {
  Box,
  Flex,
  Text,
  useDebouncedValue,
  Icon,
} from '@maximeheckel/design-system';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'motion/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useIsMobile } from '@core/hooks/useIsMobile';

import { MiniProgressCircular } from './MiniProgressCircular';
import { useIntersectionObserver } from './useIntersectionObserver';

const ToC = (props: {
  ids: Array<{ id: string; title: string }>;
  expanded?: boolean;
}) => {
  const { ids } = props;
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobile();

  const handleLink = (
    event: React.MouseEvent | React.KeyboardEvent<HTMLAnchorElement>,
    id: string
  ) => {
    event.preventDefault();
    event.stopPropagation();

    document.getElementById(id)?.scrollIntoView({
      behavior: shouldReduceMotion || isMobile ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  const allSections = useMemo(
    () =>
      ids.map(
        (item) => document.querySelector(`section[id="${item.id}-section"]`)!
      ),
    [ids]
  );

  const activeSection = useIntersectionObserver(allSections, {
    threshold: [0, 0.1, 0.2],
  });

  const debouncedActiveSection = useDebouncedValue(activeSection, 300);

  return (
    <Flex
      css={{ margin: '12px 0 0 0', padding: 0 }}
      direction="column"
      alignItems="start"
      gap={1}
    >
      {ids.map((item, index) => {
        return (
          <Flex key={item.id} alignItems="center" css={{ width: '100%' }}>
            <AnimatePresence mode="popLayout">
              {debouncedActiveSection === index ? (
                <motion.div
                  layout="size"
                  exit={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    boxShadow: [
                      '0 0px 12px 6px var(--blue-500)',
                      '0 0px 8px 2px var(--blue-500)',
                      '0 0px 12px 6px var(--blue-500)',
                    ],
                  }}
                  initial={{ opacity: 0, scale: 0.0 }}
                  transition={{
                    boxShadow: {
                      repeat: Infinity,
                      duration: 3,
                      ease: 'easeInOut',
                    },
                  }}
                  style={{
                    flexShrink: 0,
                    borderRadius: '100px',
                    width: 4,
                    height: 4,
                    marginRight: 4,
                    backgroundColor: 'var(--blue-500)',
                  }}
                />
              ) : null}
            </AnimatePresence>
            <Text
              as={motion.a}
              layout="position"
              transition={{
                duration: shouldReduceMotion ? 0 : 0.3,
              }}
              animate={{
                y: 'none',
              }}
              initial={{
                y: 'none',
              }}
              tabIndex={0}
              href={`#${item.id}`}
              css={{
                cursor: 'pointer',
                transition: 'color 0.3s ease-in-out',
                outline: 'none',
                '&:hover': {
                  color: 'var(--text-primary)',
                },
                '&:focus-visible': {
                  color: 'var(--text-primary)',
                },
              }}
              onClick={(event: React.MouseEvent<HTMLAnchorElement>) =>
                handleLink(event, item.id)
              }
              onKeyDown={(event: React.KeyboardEvent<HTMLAnchorElement>) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleLink(event, item.id);
                }
              }}
              family="display"
              size="2"
              weight="2"
              variant="secondary"
              truncate
            >
              {item.title}
            </Text>
          </Flex>
        );
      })}
    </Flex>
  );
};

const DynamicTOC = (props: {
  title: string;
  ids: Array<{ id: string; title: string }>;
}) => {
  const { title, ids } = props;
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);

  const { scrollYProgress } = useScroll();
  const shouldReduceMotion = useReducedMotion();

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (expanded && !ref.current?.contains(event.target as Node)) {
        setExpanded(false);
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && expanded) {
        setExpanded(false);
      }
    };

    if (expanded) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    } else {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [expanded]);

  useMotionValueEvent(scrollYProgress, 'change', () => {
    const hasReachedBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 150;

    const hasReachedTop = window.scrollY <= 150;

    if (hasReachedBottom || hasReachedTop) {
      setExpanded(false);
    }
  });

  const content = useMemo(() => {
    switch (expanded) {
      case true:
        return <ToC ids={ids} />;
      case false:
        return null;
    }
  }, [expanded, ids]);

  return (
    <Box
      css={{
        position: 'relative',
      }}
    >
      <Flex
        as={motion.div}
        layout
        ref={ref}
        alignItems="start"
        justifyContent="start"
        direction="column"
        tabIndex={0}
        role="button"
        aria-expanded={expanded}
        css={{
          overflow: 'hidden',
          position: 'relative',
          background: 'oklch(from var(--gray-900) l c h / var(--opacity, 0.3))',
          borderWidth: '1.5px',
          borderStyle: 'solid',
          borderColor:
            'oklch(from var(--gray-1100) l c h / var(--border-opacity, 0.1))',
          backdropFilter:
            'blur(var(--blur, 12px)) saturate(var(--saturate, 1.15))',
          minWidth: '150px',
          maxWidth: '300px',
          gap: 0,
          userSelect: 'none',
          transition: 'border-color 0.2s ease-in-out',
          '&:focus-visible': {
            outline: '2px solid var(--gray-1200)',
          },
          '@sm': {
            maxWidth: '400px',
          },
        }}
        onClick={() => {
          setExpanded(!expanded);
        }}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
          if (event.key === 'Enter') {
            setExpanded(!expanded);
          }
        }}
        whileTap={{
          scale: expanded ? 1 : 0.9,
          borderColor: 'transparent',
        }}
        whileHover={{
          scale: expanded ? 1 : 1.1,
          borderColor: 'transparent',
        }}
        transition={
          shouldReduceMotion
            ? {
                duration: 0,
              }
            : {
                type: 'spring',
                bounce: 0.15,
                duration: 0.5,
              }
        }
        onAnimationStart={() => {
          ref.current?.style.setProperty('--border-opacity', '0.0');
        }}
        onAnimationComplete={() => {
          ref.current?.style.setProperty('--border-opacity', '0.1');
        }}
        style={{
          borderRadius: expanded ? 16 : 12,
          padding: expanded ? '16px 16px' : '6px 12px',
          cursor: expanded ? 'default' : 'pointer',
          width: expanded ? '400px' : 'fit-content',
        }}
      >
        <motion.div
          layout="position"
          transition={
            shouldReduceMotion
              ? {
                  duration: 0,
                }
              : {
                  type: 'spring',
                  bounce: expanded ? 0.35 : 0.25,
                }
          }
          initial={{
            scale: 0.9,
            opacity: 0,
            filter: 'blur(5px)',
            originX: 0.5,
            originY: 0.5,
          }}
          animate={{
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)',
            originX: 0.5,
            originY: 0.5,
            transition: {
              delay: 0.05,
            },
          }}
          style={{
            display: 'flex',
            alignItems: 'start',
            width: '100%',
            gap: 8,
          }}
        >
          <MiniProgressCircular progress={scaleY} />
          <Text
            family="display"
            size="2"
            weight="4"
            variant="primary"
            truncate={!expanded}
            data-testid="toc-title"
          >
            {title}
          </Text>
          <motion.div
            animate={{
              rotate: expanded ? 180 : 0,
            }}
            transition={
              shouldReduceMotion
                ? {
                    duration: 0,
                  }
                : {
                    type: 'spring',
                    bounce: expanded ? 0.3 : 0.25,
                  }
            }
            style={{
              cursor: 'pointer',
              display: 'flex',
              color: 'var(--blue-500)',
            }}
          >
            <Icon.Chevron />
          </motion.div>
        </motion.div>
        <motion.div
          layout="size"
          transition={
            shouldReduceMotion
              ? {
                  duration: 0,
                }
              : {
                  type: 'spring',
                  bounce: expanded ? 0.3 : 0.25,
                }
          }
          initial={{
            scale: shouldReduceMotion ? 1 : 0.7,
            opacity: 0,
            filter: 'blur(5px)',
          }}
          animate={{
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)',
            transition: {
              delay: 0.1,
            },
          }}
          style={{
            width: '100%',
          }}
          key={expanded ? 'list' : 'title'}
        >
          {content}
        </motion.div>
      </Flex>
      <Box
        aria-hidden
        css={{
          position: 'absolute',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'start',
          justifyContent: 'start',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: 32,
          width: '400px',
          height: '200px',
          padding: '10px 18px',
        }}
      >
        {/* To remember: make this visible and make sure it aligns with the actual visible content if you need to modify it */}
        <AnimatePresence mode="popLayout">
          <motion.div
            initial={{ opacity: 0 }}
            exit="exit"
            variants={{
              exit: {
                scale: shouldReduceMotion ? 1 : 0.85,
                opacity: [1, 0],
                filter: 'blur(5px)',
              },
            }}
            transition={{
              type: 'spring',
              bounce: 0.4,
            }}
            key={expanded ? 'list' : 'title'}
          >
            {content}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export { DynamicTOC };
