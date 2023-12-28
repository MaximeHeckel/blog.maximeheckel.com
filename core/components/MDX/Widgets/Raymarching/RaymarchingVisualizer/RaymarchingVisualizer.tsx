import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Icon,
  Range,
  Text,
  Tooltip,
} from '@maximeheckel/design-system';
import { motion } from 'framer-motion';
import React, { useMemo, useState } from 'react';
import { HighlightedValue } from '../../Components';

interface CellProps {
  value: number;
  x: number;
  y: number;
  step: number;
}

const Cell = (props: CellProps) => {
  const { value, x, y } = props;

  let color = 'var(--gray-000)';

  if (value > 0.002) {
    color = 'rgb(87, 134, 245)';
  }

  return (
    <Flex
      alignItems="center"
      css={{
        aspectRatio: '1 / 1',
        borderBottom: '0.5px solid var(--gray-700)',
        borderLeft: '0.5px solid var(--gray-700)',
        backgroundColor: color,
        overflow: 'hidden',
      }}
      justifyContent="center"
    >
      {(x === 0 && y === 0) ||
      (x === 1 && y === 1) ||
      (x === 0 && y === 1) ||
      (x === 1 && y === 0) ||
      (x === 0.5 && y === 0.5) ? (
        <Text role="presentation" css={{ fontSize: 10 }}>
          {x - 0.5},{y - 0.5}
        </Text>
      ) : null}
    </Flex>
  );
};

const fakeSphereSDF = (_x: number, _y: number, step: number) => {
  if (step > 12) {
    return 0;
  }

  return (
    1.0 - step * Math.sqrt((_x - 0.5) * (_x - 0.5) + (_y - 0.5) * (_y - 0.5))
  );
};

const SIZE = 17;
const MAX_STEP = 13;

const RaymarchingVisualizer = () => {
  const [step, setStep] = useState(0);

  const emptyMatrix = useMemo(
    () =>
      Array(SIZE)
        .fill(null)
        .map(() => Array(SIZE).fill(null)),
    []
  );

  const matrix = useMemo(
    () =>
      emptyMatrix
        .map((row, y) =>
          row.map((_, x) =>
            fakeSphereSDF(
              x / (row.length - 1),
              y / (emptyMatrix.length - 1),
              MAX_STEP - step + 2.0
            )
          )
        )
        .reverse(),
    [emptyMatrix, step]
  );

  const restart = () => setStep(0);

  const nextStep = () => {
    setStep((prev) => {
      if (prev < MAX_STEP) {
        return prev + 1;
      }
      return prev;
    });
  };

  return (
    <Card css={{ width: '100%' }}>
      <Card.Body
        as={Flex}
        direction="column"
        dotMatrix
        justifyContent="center"
        gap="6"
      >
        <Grid
          css={{
            borderTop: '0.5px solid var(--gray-700)',
            borderRight: '0.5px solid var(--gray-700)',
            overflow: 'hidden',
            width: '100%',
          }}
          templateColumns={`repeat(${SIZE}, 1fr)`}
        >
          {matrix.map((row, idy) => (
            <React.Fragment key={idy}>
              {row.map((value, idx) => (
                <Cell
                  key={`${value}-${idx}-${idy}`}
                  x={idx / (row.length - 1)}
                  y={(matrix.length - 1 - idy) / (matrix.length - 1)}
                  value={value}
                  step={step}
                />
              ))}
            </React.Fragment>
          ))}
        </Grid>

        <Flex
          css={{
            background: 'var(--emphasis)',
            width: '100%',
            height: 'fit-content',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius-2)',
            padding: 'var(--space-5)',
          }}
          justifyContent="center"
        >
          <Diagram step={step} />
        </Flex>
        <Flex alignItems="center" css={{ width: '100%' }} gap="3">
          <Tooltip content="Reset">
            <Button icon={<Icon.Repeat />} onClick={restart} variant="icon" />
          </Tooltip>
          <Tooltip content="Next Step">
            <Button
              disabled={step === MAX_STEP}
              icon={<Icon.Arrow />}
              onClick={nextStep}
              variant="icon"
            />
          </Tooltip>
          <Range
            id="timeline"
            aria-label="Timeline"
            min={0}
            max={MAX_STEP}
            step={1}
            value={step}
            onChange={(value) => {
              setStep(value);
            }}
          />
          <Box css={{ flexShrink: 0 }}>
            <Text size="1">
              Step:{' '}
              <HighlightedValue css={{ width: 34 }}>{step}</HighlightedValue>
            </Text>
          </Box>
        </Flex>
      </Card.Body>
    </Card>
  );
};

const Diagram = (props: { step: number }) => {
  const { step } = props;

  const pathVariants = {
    initial: {
      pathLength: 0,
    },
    revealed: {
      pathLength: step / 3,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  };

  const edgePathVariants = {
    initial: {
      pathLength: 0,
    },
    revealed: {
      pathLength: step / 8,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  };

  const outPathVariants = {
    initial: {
      pathLength: 0,
    },
    revealed: {
      pathLength: step / 14,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <svg
      width="90%"
      height="100%"
      viewBox="0 0 208 143"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 129.267 75.1306)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 142.195 67.6677)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 155.093 60.2204)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 168.025 52.7546)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 142.187 82.5915)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 155.115 75.1267)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 168.013 67.6794)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 180.945 60.2146)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 103.427 60.2126)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 116.355 52.7487)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 129.253 45.3015)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 142.185 37.8356)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 116.347 67.6716)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 129.275 60.2087)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 142.173 52.7605)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 155.105 45.2946)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 25.8979 75.1345)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 38.8256 67.6716)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 51.7279 60.2224)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 64.6557 52.7585)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 38.8178 82.5954)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 51.7455 75.1306)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 64.6479 67.6814)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 77.5756 60.2185)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 0.0580127 60.2165)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 12.9857 52.7526)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 25.8881 45.3034)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 38.8158 37.8396)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 12.9779 67.6755)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 25.9057 60.2126)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 38.808 52.7624)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 51.7357 45.2985)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 77.5854 45.2937)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 90.5131 37.8298)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 103.412 30.3825)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 116.343 22.9167)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 90.5053 52.7526)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 103.433 45.2888)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 116.331 37.8415)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 129.263 30.3757)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 51.7455 30.3747)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 64.6732 22.9108)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 77.5717 15.4636)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 90.5033 7.99776)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 64.6654 37.8337)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 77.5932 30.3698)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 90.4916 22.9226)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 103.423 15.4567)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 77.5795 104.972)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 90.5072 97.5095)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 103.41 90.0603)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 116.337 82.5954)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 90.4994 112.433)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 103.427 104.968)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 116.329 97.5192)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 129.257 90.0564)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 51.7397 90.0544)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 64.6674 82.5915)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 77.5697 75.1423)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 90.4975 67.6774)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 64.6596 97.5134)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 77.5873 90.0505)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 90.4897 82.6013)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <rect
        x="0.433013"
        width="15.0633"
        height="15.0675"
        transform="matrix(0.866025 -0.5 0.866025 0.5 103.417 75.1364)"
        stroke="var(--gray-600)"
        strokeWidth="0.5"
      />
      <circle
        cx="104"
        cy="27"
        r="24.75"
        fill="#5786F5"
        stroke="black"
        strokeWidth="0.5"
      />
      <path
        d="M90.5217 134.307C95.0941 127.024 113.139 127.243 117.53 134.585L104.267 142.242L90.5217 134.307Z"
        fill="white"
        stroke="black"
        strokeWidth="0.5"
      />

      <motion.path
        d="M103.953 128L103.999 45"
        stroke="var(--orange-900)"
        strokeWidth="0.5"
        strokeLinecap="round"
        initial="initial"
        animate="revealed"
        variants={pathVariants}
      />
      <motion.path
        d="M103.955 128.039L91 30"
        stroke="var(--orange-900)"
        strokeWidth="0.5"
        strokeLinecap="round"
        initial="initial"
        animate="revealed"
        variants={edgePathVariants}
      />
      <motion.path
        d="M103.955 127.963L117 30"
        stroke="var(--orange-900)"
        strokeWidth="0.5"
        strokeLinecap="round"
        initial="initial"
        animate="revealed"
        variants={edgePathVariants}
      />
      <motion.path
        d="M103.955 128.039L73 10"
        stroke="var(--orange-900)"
        strokeWidth="0.5"
        strokeLinecap="round"
        initial="initial"
        animate="revealed"
        variants={outPathVariants}
      />
      <motion.path
        d="M103.955 127.963L134 10"
        stroke="var(--orange-900)"
        strokeWidth="0.5"
        strokeLinecap="round"
        initial="initial"
        animate="revealed"
        variants={outPathVariants}
      />
    </svg>
  );
};

export default RaymarchingVisualizer;
