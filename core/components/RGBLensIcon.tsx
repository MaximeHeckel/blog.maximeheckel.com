import { motion, useReducedMotion } from 'motion/react';
import React, { useCallback, useEffect, useId, useState } from 'react';

export interface RGBLensIconProps {
  size?: number;
  strokeWidth?: number;
  animate?: boolean | 'hover';
  className?: string;
}

const svgProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 16 16',
  fill: 'none',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  role: 'img',
  'aria-label': 'Overlapping red, green, and blue lenses',
  style: { isolation: 'isolate', overflow: 'visible', display: 'block' },
} as const;

const cycle = {
  duration: 3.5,
  times: [0, 0.08, 0.4, 0.43, 0.6, 0.92, 1],
  ease: [0.42, 0, 0.58, 1] as const,
};
const convergence = {
  ...cycle,
  times: [0, 0.35, 0.4, 0.43, 0.6, 0.92, 1],
};

// Join the inner and outer endpoints early, then relax the curvature.
// Keep those joins closed until the lenses are nearly separated again.
const RefractionContour = ({
  refracted,
  joined,
  circular,
  stroke,
  animated,
}: {
  refracted: string;
  joined: string;
  circular: string;
  stroke: string;
  animated: boolean;
}) =>
  animated ? (
    <motion.path
      d={refracted}
      stroke={stroke}
      initial={{ d: refracted }}
      animate={{
        d: [
          refracted,
          refracted,
          joined,
          circular,
          circular,
          joined,
          refracted,
          refracted,
        ],
      }}
      transition={{
        ...cycle,
        times: [0, 0.08, 0.16, 0.32, 0.6, 0.84, 0.92, 1],
      }}
    />
  ) : (
    <path d={refracted} stroke={stroke} />
  );

const RedLens = ({ animated = false }: { animated?: boolean }) => (
  <>
    <path
      d="M4.45078 6.00065C4.28872 5.44895 4.25747 4.86707 4.35951 4.30119C4.46156 3.73531 4.69409 3.201 5.03865 2.74066C5.38321 2.28032 5.83032 1.90663 6.3445 1.64923C6.85868 1.39183 7.42577 1.25781 8.00078 1.25781C8.57579 1.25781 9.14288 1.39183 9.65706 1.64923C10.1712 1.90663 10.6184 2.28032 10.9629 2.74066C11.3075 3.201 11.54 3.73531 11.6421 4.30119C11.7441 4.86707 11.7128 5.44895 11.5508 6.00065"
      stroke="#EF4444"
    />
    <path
      d="M8.00469 8.60313C10.0481 8.60313 11 7 11.7047 4.90313C11.7047 2.85967 10.0481 1.20312 8.00469 1.20312C5.96123 1.20312 4.30469 2.85967 4.30469 4.90313C5 7 5.96123 8.60313 8.00469 8.60313Z"
      fill="#EF4444"
      fillOpacity={0.3}
      stroke="none"
      style={{ mixBlendMode: 'screen' }}
    />
    <RefractionContour
      refracted="M5 5.92188A3 2.9 0 0 0 11 5.92188"
      joined="M4.45078 6.00065A3.55001 2.82 0 0 0 11.5508 6.00065"
      circular="M4.45078 6.00065A3.7 3.7 0 0 0 11.5508 6.00065"
      stroke="#EF4444"
      animated={animated}
    />
  </>
);

const GreenLens = ({ animated = false }: { animated?: boolean }) => (
  <>
    <path
      d="M5.30156 13.3023C7.5 12.5 9.00156 11.6458 9.00156 9.60234C9.00156 7.55889 7 6.5 5.30156 5.90234C3.25811 5.90234 1.60156 7.55889 1.60156 9.60234C1.60156 11.6458 3.25811 13.3023 5.30156 13.3023Z"
      fill="#22C55E"
      fillOpacity={0.3}
      stroke="none"
      style={{ mixBlendMode: 'screen' }}
    />
    <RefractionContour
      refracted="M8 7.65234A2.2 2.2 0 0 1 8 11.6523"
      joined="M8.0014 7.06844A3.15 3.15 0 0 1 8.0014 12.1284"
      circular="M8.0014 7.06844A3.7 3.7 0 0 1 8.0014 12.1284"
      stroke="#22C55E"
      animated={animated}
    />
    <path
      d="M8.0014 7.06844C7.49401 6.527 6.83555 6.15062 6.11153 5.98818C5.3875 5.82575 4.63136 5.88476 3.9413 6.15755C3.25124 6.43035 2.65915 6.90433 2.24191 7.51793C1.82467 8.13153 1.60156 8.85642 1.60156 9.59844C1.60156 10.3405 1.82467 11.0653 2.24191 11.6789C2.65915 12.2926 3.25124 12.7665 3.9413 13.0393C4.63136 13.3121 5.3875 13.3711 6.11153 13.2087C6.83555 13.0463 7.49401 12.6699 8.0014 12.1284"
      stroke="#22C55E"
    />
  </>
);

const BlueLens = () => (
  <>
    <path
      d="M10.7 13.3023C12.7435 13.3023 14.4 11.6458 14.4 9.60234C14.4 7.55889 12.7435 5.90234 10.7 5.90234C8.65655 5.90234 7 7.55889 7 9.60234C7 11.6458 8.65655 13.3023 10.7 13.3023Z"
      fill="#3B82F6"
      fillOpacity={0.3}
      stroke="none"
      style={{ mixBlendMode: 'screen' }}
    />
    <path
      d="M10.7 13.2984C12.7435 13.2984 14.4 11.6419 14.4 9.59844C14.4 7.55498 12.7435 5.89844 10.7 5.89844C8.65655 5.89844 7 7.55498 7 9.59844C7 11.6419 8.65655 13.2984 10.7 13.2984Z"
      stroke="#3B82F6"
    />
  </>
);

const StaticIcon = ({
  size = 16,
  strokeWidth = 1,
  className,
}: RGBLensIconProps) => (
  <svg
    {...svgProps}
    width={size}
    height={size}
    strokeWidth={strokeWidth}
    className={className}
  >
    <g>
      <RedLens />
    </g>
    <g>
      <GreenLens />
    </g>
    <g>
      <BlueLens />
    </g>
  </svg>
);

const AnimationCycle = ({
  size,
  strokeWidth,
  onComplete,
}: {
  size: number;
  strokeWidth: number;
  onComplete: () => void;
}) => {
  const glowId = useId();
  return (
    <motion.svg
      {...svgProps}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ duration: cycle.duration, ease: 'linear' }}
      onAnimationComplete={onComplete}
    >
      <defs>
        <filter id={glowId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>
      <motion.g
        initial={{ opacity: 1 }}
        animate={{ opacity: [1, 1, 0, 0, 0, 1, 1] }}
        transition={convergence}
      >
        <motion.g
          initial={{ y: 0 }}
          animate={{ y: [0, 0, 3.04, 3.04, 3.04, 0, 0] }}
          transition={cycle}
        >
          <RedLens animated />
        </motion.g>
        <motion.g
          initial={{ x: 0, y: 0 }}
          animate={{
            x: [0, 0, 2.7, 2.7, 2.7, 0, 0],
            y: [0, 0, -1.6, -1.6, -1.6, 0, 0],
          }}
          transition={cycle}
        >
          <GreenLens animated />
        </motion.g>
        <motion.g
          initial={{ x: 0, y: 0 }}
          animate={{
            x: [0, 0, -2.7, -2.7, -2.7, 0, 0],
            y: [0, 0, -1.6, -1.6, -1.6, 0, 0],
          }}
          transition={cycle}
        >
          <BlueLens />
        </motion.g>
      </motion.g>
      <motion.circle
        cx="8"
        cy="8"
        r="3.7"
        fill="none"
        stroke="white"
        filter={`url(#${glowId})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0.65, 0.65, 0.5, 0, 0] }}
        transition={convergence}
      />
      <motion.circle
        cx="8"
        cy="8"
        r="3.7"
        fill="white"
        fillOpacity={0.3}
        stroke="white"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 1, 1, 1, 0, 0] }}
        transition={convergence}
      />
    </motion.svg>
  );
};

const AnimatedIcon = ({
  size = 16,
  strokeWidth = 1,
  animate,
  className,
  onIdle,
}: RGBLensIconProps & {
  onIdle: () => void;
}) => {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [running, setRunning] = useState(animate === true);
  const [iteration, setIteration] = useState(0);

  useEffect(() => {
    if (animate === true) setRunning(true);
    if (!animate && (!running || reduceMotion)) onIdle();
  }, [animate, running, reduceMotion, onIdle]);

  if (reduceMotion)
    return (
      <StaticIcon size={size} strokeWidth={strokeWidth} className={className} />
    );

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', width: size, height: size }}
      onMouseEnter={() => {
        setHovered(true);
        if (animate === 'hover') setRunning(true);
      }}
      onMouseLeave={() => setHovered(false)}
    >
      {animate === true || running ? (
        <AnimationCycle
          key={iteration}
          size={size}
          strokeWidth={strokeWidth}
          onComplete={() => {
            // A cycle always ends at the original geometry and rotation.
            if (animate === true || (animate === 'hover' && hovered)) {
              setIteration((value) => value + 1);
            } else {
              setRunning(false);
            }
          }}
        />
      ) : (
        <StaticIcon size={size} strokeWidth={strokeWidth} />
      )}
    </span>
  );
};

const RGBLensIcon = (props: RGBLensIconProps) => {
  // Retain an enabled instance until it reports that its current cycle ended.
  const [active, setActive] = useState(Boolean(props.animate));
  const handleIdle = useCallback(() => setActive(false), []);
  if (props.animate && !active) setActive(true);

  return props.animate || active ? (
    <AnimatedIcon {...props} onIdle={handleIdle} />
  ) : (
    <StaticIcon {...props} />
  );
};

export default RGBLensIcon;
