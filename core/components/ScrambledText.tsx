import { Text, VariantProps, CSS, Box } from '@maximeheckel/design-system';
import { motion } from 'motion/react';
import { useReducer, useEffect, useRef, useLayoutEffect } from 'react';
import { useState } from 'react';

import useInterval from '@core/hooks/useInterval';

import { ClientOnly } from './ClientOnly';
import { ScreenReaderOnly } from './ScreenReaderOnly';

const scrambleText = (text: string) => {
  const chars = text.split('');
  const scrambledChars = chars.map((char) => {
    if (/^\s$/.test(char)) {
      return char;
    }
    const randomIndex = Math.floor(Math.random() * alphanumericChars.length);
    return alphanumericChars[randomIndex];
  });
  return scrambledChars.join('');
};

const getParts = (text: string, windowSize: number, windowStart: number) => {
  const done = text.slice(0, windowStart);
  const scrambled = scrambleText(
    text.slice(windowStart, windowStart + windowSize)
  );
  const todo = text.slice(windowStart + windowSize);
  return [done, scrambled, todo];
};

const ScrambledTextAnimation = ({
  children,
  css,
  windowSize = 10,
  speed = 1,
  delay = 0,
  ...rest
}: {
  children: string;
  windowSize?: number;
  speed?: number;
  delay?: number;
  css?: CSS;
} & VariantProps<typeof Text>) => {
  const [dimensions, setDimensions] = useState<{
    height: number;
    width: number;
  } | null>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  const [[done, scrambled], setScrambledText] = useState(
    getParts(children, windowSize, 0)
  );
  const [windowStart, increment] = useReducer((state) => state + 1, 1);
  const finished = windowStart > children.length;
  const [hasDelayPassed, setHasDelayPassed] = useState(false);

  useInterval(
    () => {
      increment();
      setScrambledText(getParts(children, windowSize, windowStart));
    },
    !hasDelayPassed ? null : finished ? null : 30 / speed
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasDelayPassed(true);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [delay]);

  useLayoutEffect(() => {
    if (measureRef.current) {
      const rect = measureRef.current.getBoundingClientRect();
      setDimensions({
        height: rect.height,
        width: rect.width,
      });
    }
  }, [children]);

  if (!dimensions) {
    return (
      <Box ref={measureRef} {...rest} css={{ ...css, opacity: 0 }}>
        <Text ref={measureRef} {...rest}>
          {children}
        </Text>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeInOut', delay: delay * 0.95 }}
      style={{
        display: 'block',
        height: finished ? 'auto' : dimensions?.height,
      }}
    >
      <Text
        aria-hidden
        css={{
          ...css,
        }}
        {...rest}
      >
        {finished ? children : done}
        <Text
          as="span"
          aria-hidden
          css={{
            ...css,
          }}
          {...rest}
          variant="primary"
        >
          {finished ? '' : scrambled}
        </Text>
      </Text>
    </motion.div>
  );
};

export const ScrambledText = ({
  children,
  css,
  disabled = false,
  windowSize = 10,
  speed = 1,
  delay = 0,
  ...props
}: {
  children: string;
  css?: CSS;
  disabled?: boolean;
  windowSize?: number;
  speed?: number;
  delay?: number;
} & VariantProps<typeof Text>) => {
  return (
    <>
      <ScreenReaderOnly as="span">{children}</ScreenReaderOnly>
      {disabled ? (
        <Text {...props} css={css}>
          {children}
        </Text>
      ) : (
        <>
          <ClientOnly
            fallback={
              <Box>
                <Text {...props} css={css}>
                  {children}
                </Text>
              </Box>
            }
          >
            <ScrambledTextAnimation
              windowSize={windowSize}
              speed={speed}
              delay={delay}
              {...props}
              css={css}
            >
              {children}
            </ScrambledTextAnimation>
          </ClientOnly>
        </>
      )}
    </>
  );
};

export const alphanumericChars = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  '@',
  '#',
  '$',
  '%',
  '&',
  '*',
  '+',
  '-',
  '.',
  '/',
  ':',
  ';',
  '<',
  '=',
  '>',
  '?',
  '[',
  ']',
  '{',
  '}',
  '(',
  ')',
];
