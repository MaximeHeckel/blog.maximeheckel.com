import { motion, useReducedMotion } from 'framer-motion';
import { styled } from '@maximeheckel/design-system';
import React from 'react';

const ProgressBarWrapper = styled(motion.div, {
  height: 'calc(88vh - 40px)',
  maxHeight: '425px',
  width: '2px',
  backgroundColor: 'hsla(var(--palette-gray-20), 0.3)',

  '@media(max-width: 700px)': {
    display: 'none',
  },
});

const ProgressBar = ({ progress }: { progress: number }) => {
  const [visibility, setVisibility] = React.useState(true);
  const shouldReduceMotion = useReducedMotion();

  const progressBarWrapperVariants = {
    hide: {
      opacity: shouldReduceMotion ? 1 : 0,
    },
    show: (visibility: boolean) => ({
      opacity: shouldReduceMotion ? 1 : visibility ? 0.7 : 0,
    }),
  };

  React.useEffect(() => setVisibility(progress >= 0.07 && progress <= 0.95), [
    progress,
  ]);

  return (
    <ProgressBarWrapper
      initial="hide"
      variants={progressBarWrapperVariants}
      animate="show"
      transition={{ type: 'spring' }}
      custom={visibility}
    >
      <motion.div
        style={{
          transformOrigin: 'top',
          scaleY: progress,
          width: '2px',
          backgroundColor: 'var(--maximeheckel-colors-typeface-tertiary)',
          height: '100%',
        }}
        data-testid="progress-bar"
        data-testprogress={progress}
      />
    </ProgressBarWrapper>
  );
};

export default ProgressBar;
