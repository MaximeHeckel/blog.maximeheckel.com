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
import LightDarkSwitcher from '@theme/components/Buttons/LightDarkSwitcher';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

const titles = [
  'Pick base colors',
  'Increase/decrease the lightness to create a scale for each color',
  'Pick and name a subset a color for both light and dark mode',
];

const step1ColorScale = {
  gray: [{ color: '--palette-gray-50' }],
  blue: [{ color: '--palette-blue-50' }],
  red: [{ color: '--palette-red-50' }],
};

const step2ColorScale = {
  gray: [
    { color: '--palette-gray-00' },
    { color: '--palette-gray-01' },
    { color: '--palette-gray-02' },
    { color: '--palette-gray-03' },
    { color: '--palette-gray-05' },
    { color: '--palette-gray-09' },
    { color: '--palette-gray-10' },
    { color: '--palette-gray-15' },
    { color: '--palette-gray-20' },
    { color: '--palette-gray-25' },
    { color: '--palette-gray-30' },
    { color: '--palette-gray-35' },
    { color: '--palette-gray-40' },
    { color: '--palette-gray-45' },
    { color: '--palette-gray-50' },
    { color: '--palette-gray-55' },
    { color: '--palette-gray-60' },
    { color: '--palette-gray-65' },
    { color: '--palette-gray-70' },
    { color: '--palette-gray-75' },
    { color: '--palette-gray-80' },
    { color: '--palette-gray-85' },
    { color: '--palette-gray-90' },
    { color: '--palette-gray-95' },
    { color: '--palette-gray-100' },
  ],
  blue: [
    { color: '--palette-blue-05' },
    { color: '--palette-blue-10' },
    { color: '--palette-blue-15' },
    { color: '--palette-blue-20' },
    { color: '--palette-blue-25' },
    { color: '--palette-blue-30' },
    { color: '--palette-blue-35' },
    { color: '--palette-blue-40' },
    { color: '--palette-blue-45' },
    { color: '--palette-blue-50' },
    { color: '--palette-blue-55' },
    { color: '--palette-blue-60' },
    { color: '--palette-blue-65' },
    { color: '--palette-blue-70' },
    { color: '--palette-blue-75' },
    { color: '--palette-blue-80' },
    { color: '--palette-blue-85' },
    { color: '--palette-blue-90' },
    { color: '--palette-blue-95' },
  ],
  red: [
    { color: '--palette-red-05' },
    { color: '--palette-red-10' },
    { color: '--palette-red-15' },
    { color: '--palette-red-20' },
    { color: '--palette-red-25' },
    { color: '--palette-red-30' },
    { color: '--palette-red-35' },
    { color: '--palette-red-40' },
    { color: '--palette-red-45' },
    { color: '--palette-red-50' },
    { color: '--palette-red-55' },
    { color: '--palette-red-60' },
    { color: '--palette-red-65' },
    { color: '--palette-red-70' },
    { color: '--palette-red-75' },
    { color: '--palette-red-80' },
    { color: '--palette-red-85' },
    { color: '--palette-red-90' },
    { color: '--palette-red-95' },
  ],
};

const step3ColorScaleDark = {
  gray: [
    { color: '--palette-gray-20', label: '--font-tertiary' },
    { color: '--palette-gray-35', label: '--font-secondary' },
    { color: '--palette-gray-55', label: '--input-disabled' },
    { color: '--palette-gray-60', label: '--input-border' },
    { color: '--palette-gray-80', label: '--foreground' },
    { color: '--palette-gray-90', label: '--background' },
    { color: '--palette-gray-100', label: '--input-bckg' },
  ],
  blue: [
    { color: '--palette-blue-35', label: '--brand' },
    { color: '--palette-blue-50', label: '--input-focus' },
  ],
  red: [
    { color: '--palette-red-20', label: '--font-danger' },
    { color: '--palette-red-30', label: '--danger' },
  ],
};

const step3ColorScaleLight = {
  gray: [
    { color: '--palette-gray-00', label: '--input-bckg' },
    { color: '--palette-gray-02', label: '--background' },
    { color: '--palette-gray-05', label: '--foreground' },
    { color: '--palette-gray-09', label: '--input-disabled' },
    { color: '--palette-gray-55', label: '--font-secondary' },
    { color: '--palette-gray-60', label: '--font-tertiary' },
  ],
  blue: [
    { color: '--palette-blue-10', label: '--input-border' },
    { color: '--palette-blue-40', label: '--input-focus' },
    { color: '--palette-blue-50', label: '--brand' },
  ],
  red: [
    { color: '--palette-red-55', label: '--danger' },
    { color: '--palette-red-60', label: '--font-danger' },
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
    <Grid
      as={motion.div}
      initial="out"
      animate="in"
      gap="2"
      css={{
        flexGrow: 1,
        gridTemplateColumns:
          step === 2 ? 'none' : 'repeat(auto-fill, minmax(2rem, 1fr))',
        gridTemplateRows: 'min-content',
      }}
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
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: `hsl(var(${shade.color}))`,
                    border: '2px solid var(--maximeheckel-border-color)',
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
    <Card
      css={{
        marginBottom: '2.25rem',
      }}
      title={`Step ${step + 1}: ${titles[step]}`}
    >
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
