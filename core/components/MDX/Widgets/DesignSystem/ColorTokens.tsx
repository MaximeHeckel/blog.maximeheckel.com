import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Icon,
  Text,
  Tooltip,
  useTheme,
} from '@maximeheckel/design-system';
import LightDarkSwitcher from '@core/components/Buttons/LightDarkSwitcher';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

const titles = [
  'Pick base colors',
  'Increase/decrease the lightness to create a scale for each color',
  'Pick and name a subset a color for both light and dark mode',
];

const step1ColorScale = {
  gray: [{ color: '--gray-800' }],
  blue: [{ color: '--blue-800' }],
  red: [{ color: '--red-800' }],
};

const step2ColorScale = {
  gray: [
    { color: '--gray-100' },
    { color: '--gray-200' },
    { color: '--gray-300' },
    { color: '--gray-400' },
    { color: '--gray-500' },
    { color: '--gray-600' },
    { color: '--gray-700' },
    { color: '--gray-800' },
    { color: '--gray-900' },
    { color: '--gray-1000' },
    { color: '--gray-1100' },
    { color: '--gray-1200' },
  ],
  blue: [
    { color: '--blue-100' },
    { color: '--blue-200' },
    { color: '--blue-300' },
    { color: '--blue-400' },
    { color: '--blue-500' },
    { color: '--blue-600' },
    { color: '--blue-700' },
    { color: '--blue-800' },
    { color: '--blue-900' },
    { color: '--blue-1000' },
    { color: '--blue-1100' },
    { color: '--blue-1200' },
  ],
  red: [
    { color: '--red-100' },
    { color: '--red-200' },
    { color: '--red-300' },
    { color: '--red-400' },
    { color: '--red-500' },
    { color: '--red-600' },
    { color: '--red-700' },
    { color: '--red-800' },
    { color: '--red-900' },
    { color: '--red-1000' },
    { color: '--red-1100' },
    { color: '--red-1200' },
  ],
};

const step3ColorScaleDark = {
  gray: [
    { color: '--gray-1000', label: '--font-tertiary' },
    { color: '--gray-1100', label: '--font-secondary' },
    { color: '--gray-700', label: '--input-disabled' },
    { color: '--gray-600', label: '--input-border' },
    { color: '--gray-300', label: '--foreground' },
    { color: '--gray-100', label: '--background' },
  ],
  blue: [
    { color: '--blue-800', label: '--brand' },
    { color: '--blue-900', label: '--input-focus' },
  ],
  red: [
    { color: '--red-200', label: '--font-danger' },
    { color: '--red-300', label: '--danger' },
  ],
};

const step3ColorScaleLight = {
  gray: [
    { color: '--gray-100', label: '--background' },
    { color: '--gray-200', label: '--foreground' },
    { color: '--gray-300', label: '--input-disabled' },
    { color: '--gray-1100', label: '--font-secondary' },
    { color: '--gray-1000', label: '--font-tertiary' },
    { color: '--gray-500', label: '--input-border' },
  ],
  blue: [
    { color: '--blue-800', label: '--input-focus' },
    { color: '--blue-900', label: '--brand' },
  ],
  red: [
    { color: '--red-900', label: '--danger' },
    { color: '--red-800', label: '--font-danger' },
  ],
};

// @ts-ignore
const ColorGrid = (props) => {
  const { step, colorScale } = props;

  const colorVariants = {
    out: {
      opacity: 0,
    },
    in: {
      opacity: 1,
    },
  };

  return (
    <Box as={motion.div} css={{ width: '100%' }} initial="out" animate="in">
      <Grid
        gap="2"
        css={{
          flexGrow: 1,
        }}
        templateColumns={
          step === 2 ? 'none' : 'repeat(auto-fill, minmax(2rem, 1fr))'
        }
        templateRows="min-content"
      >
        <AnimatePresence>
          {/* @ts-ignore */}
          {colorScale.map((shade, index) => (
            <motion.div
              key={shade.color}
              variants={colorVariants}
              layout="position"
              initial="out"
              animate="in"
              exit="out"
              transition={{
                duration: 0.5,
                delay: step === 1 ? 1 + index / 10 : 2,
                layout: {
                  delay: 0.2,
                },
              }}
            >
              <Flex alignItems="start" direction="column" gap="2">
                <Tooltip id={shade.color} content={shade.color}>
                  <Box
                    css={{
                      flexShrink: 0,
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: `var(${shade.color})`,
                      border: '2px solid var(--border-color)',
                    }}
                  />
                </Tooltip>
                {step === 2 ? (
                  <motion.div
                    layout="position"
                    initial="out"
                    animate="in"
                    exit="out"
                    variants={colorVariants}
                    transition={{
                      delay: 3,
                    }}
                  >
                    <Text family="mono" size="1">
                      {shade.label}
                    </Text>
                  </motion.div>
                ) : null}
              </Flex>
            </motion.div>
          ))}
        </AnimatePresence>
      </Grid>
    </Box>
  );
};

const ColorTokens = () => {
  const [step, setStep] = React.useState(0);
  const { dark } = useTheme();

  const colorScaleNumbers = {
    0: step1ColorScale,
    1: step2ColorScale,
    2: dark ? step3ColorScaleDark : step3ColorScaleLight,
  };

  return (
    <Card title={`Step ${step + 1}: ${titles[step]}`}>
      <Card.Body css={{ height: 600 }}>
        <Flex
          css={{ height: '100%' }}
          direction="column"
          gap="6"
          justifyContent="space-between"
        >
          <Box as="div" css={{ width: '100%', height: 460, overflowY: 'auto' }}>
            <Flex alignItems="start" justifyContent="space-between" gap="6">
              <ColorGrid
                // @ts-ignore
                colorScale={colorScaleNumbers[step].gray}
                step={step}
              />
              <ColorGrid
                // @ts-ignore
                colorScale={colorScaleNumbers[step].blue}
                step={step}
              />
              {/* @ts-ignore */}
              <ColorGrid colorScale={colorScaleNumbers[step].red} step={step} />
            </Flex>
          </Box>
          <Flex css={{ width: '100%' }} justifyContent="space-between">
            <Flex gap="3">
              <Tooltip id="prev-state" content="Previous Step">
                <Button
                  aria-label="Previous Step"
                  aria-describedby="prev-state"
                  disabled={step === 0}
                  variant="icon"
                  icon={<Icon.Arrow style={{ transform: 'scaleX(-1)' }} />}
                  onClick={() => setStep((prev) => prev - 1)}
                />
              </Tooltip>
              <Tooltip id="next-step" content="Next Step">
                <Button
                  aria-label="Next Step"
                  aria-describedby="next-step"
                  variant="icon"
                  disabled={step === 2}
                  icon={<Icon.Arrow />}
                  onClick={() => setStep((prev) => prev + 1)}
                />
              </Tooltip>
            </Flex>
            <LightDarkSwitcher />
          </Flex>
        </Flex>
      </Card.Body>
    </Card>
  );
};

export default ColorTokens;
