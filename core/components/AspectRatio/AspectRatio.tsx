import { motion, useReducedMotion } from 'motion/react';
import { useId, useState } from 'react';

import Tooltip from '@core/components/Tooltip';

import { Controls, Frame, Option, Root, Stage } from './AspectRatio.styles';
import type { AspectRatioProps, AspectRatioValue } from './AspectRatio.types';

const AnimatedFrame = motion.create(Frame);

const ratios: Record<AspectRatioValue, number> = {
  '9:16': 9 / 16,
  '4:5': 4 / 5,
  '1:1': 1,
  '4:3': 4 / 3,
  '16:9': 16 / 9,
};

const AspectRatio = ({
  children,
  value,
  defaultValue = '16:9',
  onValueChange,
  disabled = false,
  label = 'Aspect ratio',
  ...rest
}: AspectRatioProps) => {
  const name = useId();
  const reducedMotion = useReducedMotion();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selected = value ?? internalValue;
  const ratio = ratios[selected];

  return (
    <Root {...rest}>
      <Stage>
        <AnimatedFrame
          data-aspect-ratio={selected}
          initial={false}
          transition={{
            duration: reducedMotion ? 0 : 0.65,
            ease: [0.22, 1, 0.36, 1],
          }}
          animate={{
            width: `${Math.min(1, ratio / 1.5) * 100}%`,
            height: `${Math.min(1, 1.5 / ratio) * 100}%`,
          }}
        >
          {children}
        </AnimatedFrame>
      </Stage>
      <Controls role="radiogroup" aria-label={label} aria-disabled={disabled}>
        {(Object.keys(ratios) as AspectRatioValue[]).map((preset) => {
          const iconRatio = ratios[preset];
          const width = Math.min(12, 12 * iconRatio);
          const height = Math.min(12, 12 / iconRatio);
          return (
            <Option key={preset}>
              <Tooltip content={preset}>
                <input
                  type="radio"
                  name={name}
                  value={preset}
                  aria-label={preset}
                  checked={selected === preset}
                  disabled={disabled}
                  onChange={() => {
                    if (value === undefined) setInternalValue(preset);
                    onValueChange?.(preset);
                  }}
                />
              </Tooltip>
              <span className="surface" aria-hidden="true" />
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x={(20 - width) / 2}
                  y={(20 - height) / 2}
                  width={width}
                  height={height}
                  rx="1.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
            </Option>
          );
        })}
      </Controls>
    </Root>
  );
};

export default AspectRatio;
