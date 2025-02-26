import { motion, MotionValue } from 'motion/react';

const MiniProgressCircular = (props: { progress: MotionValue<number> }) => {
  const { progress } = props;
  return (
    <motion.div
      layout
      style={{
        width: 20,
        height: 20,
        y: 2,
        borderRadius: '50%',
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx="10"
          cy="10"
          r="8"
          strokeWidth="2"
          stroke="var(--gray-700)"
          fill="none"
          strokeLinecap="round"
        />
        <motion.circle
          cx="10"
          cy="10"
          r="8"
          strokeWidth="2"
          stroke="var(--blue-500)"
          fill="none"
          strokeDasharray="50.26548245743669"
          strokeLinecap="round"
          style={{
            pathLength: progress,
          }}
        />
      </svg>
    </motion.div>
  );
};

export { MiniProgressCircular };
