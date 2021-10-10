import useProgress from '@theme/hooks/useProgress';
import { motion } from 'framer-motion';
import { css, styled } from 'lib/stitches.config';
import React from 'react';
import useScrollCounter from '../../hooks/useScrollCounter';
import Flex from '../Flex';
import Grid from '../Grid';
import { HeaderContext } from './Context';
import { HeaderProps } from './types';

const progressbar = css({
  '@media (min-width: 700px)': {
    display: 'none',
  },

  position: 'absolute',
  bottom: '0px',
});

const HeaderWrapper = styled(motion.div, {
  transition: 'background-color 0.5s',
  backgroundColor: 'var(--maximeheckel-colors-body)',

  '@media (max-width: 700px)': {
    height: '65px !important',
  },

  variants: {
    slim: {
      true: {
        boxShadow: 'var(--maximeheckel-shadow-1)',
        backdropFilter: 'blur(6px)',
        opacity: 0.88,
      },
      false: {
        boxShadow: 'none',
      },
    },
    sticky: {
      true: {
        '@media (max-width: 700px)': {
          boxShadow: 'var(--maximeheckel-shadow-1)',
        },
      },
      false: {
        boxShadow: 'none',
      },
    },
  },
});

const HeaderContent = styled(Flex, {
  gridColumn: 2,
  height: 'inherit',
});

export const Wrapper: React.FC<HeaderProps> = (props) => {
  const collapsed = useScrollCounter(150);
  const shouldCollapse = props.collapsableOnScroll ? collapsed : false;
  const readingProgress = useProgress();

  const memoizedContextValue = React.useMemo(
    () => ({
      collapsed: shouldCollapse,
      sticky: props.sticky || false,
    }),
    [props.sticky, shouldCollapse]
  );

  const variants = {
    open: {
      height: 120,
    },
    collapsed: (shouldCollapse: boolean) => ({
      height: shouldCollapse ? 70 : 120,
    }),
  };

  return (
    <HeaderContext.Provider value={memoizedContextValue}>
      <div
        style={{
          position: `${props.sticky ? 'fixed' : 'inherit'}`,
          width: '100%',
          zIndex: 999,
        }}
      >
        <div
          style={{
            height: '6px',
            backgroundColor: 'var(--maximeheckel-colors-brand)',
          }}
        />
        <HeaderWrapper
          sticky={props.sticky}
          slim={shouldCollapse}
          initial="open"
          animate="collapsed"
          variants={variants}
          custom={shouldCollapse}
          transition={{ ease: 'easeInOut', duration: 0.5 }}
        >
          <Grid columns="var(--layout-medium)" columnGap={20}>
            <HeaderContent alignItems="center" justifyContent="space-between">
              {props.children}
            </HeaderContent>
          </Grid>
        </HeaderWrapper>

        {props.progress ? (
          <motion.div
            className={progressbar()}
            style={{
              transformOrigin: 'left',
              scaleX: readingProgress,
              height: '2px',
              backgroundColor: 'var(--maximeheckel-colors-typeface-tertiary)',
              width: '100%',
            }}
          />
        ) : null}
      </div>
    </HeaderContext.Provider>
  );
};
