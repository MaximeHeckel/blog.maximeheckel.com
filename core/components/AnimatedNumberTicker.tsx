import { Box, Text } from '@maximeheckel/design-system';
import { motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import type { ComponentProps } from 'react';

type AnimatedNumberTickerProps = Omit<
  ComponentProps<typeof Text>,
  'aria-label' | 'children'
> & {
  ariaLabel: string;
  digitCount: number;
  suffix?: string;
  value: number;
};

const TICKER_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

const getTickerDigitSequence = (
  previousDigit: string,
  nextDigit: string,
  direction: number
) => {
  const previousIndex = TICKER_DIGITS.indexOf(previousDigit);
  const nextIndex = TICKER_DIGITS.indexOf(nextDigit);

  if (previousIndex === -1 || nextIndex === -1 || previousIndex === nextIndex) {
    return [nextDigit];
  }

  const sequence = [previousDigit];
  let currentIndex = previousIndex;

  while (currentIndex !== nextIndex) {
    currentIndex =
      direction > 0
        ? (currentIndex + 1) % TICKER_DIGITS.length
        : (currentIndex - 1 + TICKER_DIGITS.length) % TICKER_DIGITS.length;
    sequence.push(TICKER_DIGITS[currentIndex]);
  }

  return sequence;
};

const AnimatedNumberTicker = (props: AnimatedNumberTickerProps) => {
  const { ariaLabel, css, digitCount, suffix, value, ...textProps } = props;
  const previousValue = useRef(value);
  const direction = value >= previousValue.current ? 1 : -1;
  const previousVisibleValue = String(previousValue.current).padStart(
    digitCount,
    '0'
  );
  const visibleValue = String(value).padStart(digitCount, '0');
  const minWidth = suffix ? digitCount + suffix.length + 1 : digitCount;

  useEffect(() => {
    previousValue.current = value;
  }, [value]);

  return (
    <Text
      aria-label={ariaLabel}
      css={{
        alignItems: 'center',
        display: 'flex',
        fontVariantNumeric: 'tabular-nums',
        gap: '0.35ch',
        lineHeight: 1,
        minWidth: `${minWidth}ch`,
        whiteSpace: 'nowrap',
        ...css,
      }}
      {...textProps}
    >
      <Box
        aria-hidden="true"
        as="span"
        css={{
          display: 'inline-flex',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}
      >
        {visibleValue.split('').map((digit, index) => {
          const digitSequence = getTickerDigitSequence(
            previousVisibleValue[index] || '0',
            digit,
            direction
          );

          return (
            <Box
              as="span"
              key={`${index}-${digitCount}`}
              css={{
                display: 'inline-block',
                height: '1em',
                overflow: 'hidden',
                position: 'relative',
                width: '1ch',
              }}
            >
              <Box
                aria-hidden="true"
                as="span"
                css={{
                  lineHeight: 1,
                  opacity: 0,
                }}
              >
                {digit}
              </Box>
              <motion.span
                animate={{
                  y: `${(digitSequence.length - 1) * -1}em`,
                }}
                initial={{
                  y: '0em',
                }}
                key={`${previousVisibleValue[index]}-${digit}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  inset: 0,
                  position: 'absolute',
                  textAlign: 'center',
                }}
                transition={{
                  delay: index * 0.06,
                  duration: Math.min(0.48 + digitSequence.length * 0.18, 1.8),
                  ease: [0.19, 1, 0.22, 1],
                }}
              >
                {digitSequence.map((sequenceDigit, sequenceIndex) => (
                  <Box
                    as="span"
                    key={`${sequenceDigit}-${sequenceIndex}`}
                    css={{
                      flex: '0 0 1em',
                      lineHeight: 1,
                    }}
                  >
                    {sequenceDigit}
                  </Box>
                ))}
              </motion.span>
            </Box>
          );
        })}
      </Box>
      {suffix ? (
        <Box aria-hidden="true" as="span">
          {suffix}
        </Box>
      ) : null}
    </Text>
  );
};

export { AnimatedNumberTicker };
export type { AnimatedNumberTickerProps };
