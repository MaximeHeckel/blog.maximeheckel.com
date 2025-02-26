import { Text } from '@maximeheckel/design-system';
import { motion, useReducedMotion } from 'motion/react';

type ViewFinderMarksProps = {
  text: string;
};

const ViewFinderMarks = ({ text }: ViewFinderMarksProps) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return null;
  }

  return (
    <motion.div
      exit={{ '--opacity': 0 }}
      animate={{ '--opacity': 1 }}
      initial={{
        '--opacity': 0,
      }}
      style={{
        opacity: 'var(--opacity)',
        position: 'absolute',
        top: -6,
        left: -8,
        width: 'fit-content',
        height: 'calc(100% + 12px)',
        zIndex: 0,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      >
        {/* Top Left */}
        <motion.div
          layoutId="top-left"
          transition={{
            layout: {
              type: 'spring',
              stiffness: 100,
              damping: 15,
            },
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 12,
            height: 12,
            borderTop: '3px solid var(--accent)',
            borderLeft: '3px solid var(--accent)',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '1px',
            borderBottomLeftRadius: '1px',
          }}
        />

        {/* Top Right */}
        <motion.div
          layoutId="top-right"
          transition={{
            layout: {
              type: 'spring',
              stiffness: 100,
              damping: 15,
            },
          }}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 12,
            height: 12,
            borderTop: '3px solid var(--accent)',
            borderRight: '3px solid var(--accent)',
            borderTopRightRadius: '4px',
            borderTopLeftRadius: '1px',
            borderBottomRightRadius: '1px',
          }}
        />

        {/* Bottom Left */}
        <motion.div
          layoutId="bottom-left"
          transition={{
            layout: {
              type: 'spring',
              stiffness: 100,
              damping: 15,
            },
          }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: 12,
            height: 12,
            borderBottom: '3px solid var(--accent)',
            borderLeft: '3px solid var(--accent)',
            borderBottomLeftRadius: '4px',
            borderTopLeftRadius: '1px',
            borderBottomRightRadius: '1px',
          }}
        />

        {/* Bottom Right */}
        <motion.div
          layoutId="bottom-right"
          transition={{
            layout: {
              type: 'spring',
              stiffness: 100,
              damping: 15,
            },
          }}
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 12,
            height: 12,
            borderBottom: '3px solid var(--accent)',
            borderRight: '3px solid var(--accent)',
            borderBottomRightRadius: '4px',
            borderTopRightRadius: '1px',
            borderBottomLeftRadius: '1px',
          }}
        />
      </div>
      <Text
        aria-hidden
        as="p"
        css={{
          padding: '0px 8px',
          visibility: 'hidden',
        }}
        size="2"
        weight="3"
      >
        {text}
      </Text>
    </motion.div>
  );
};

export { ViewFinderMarks };
