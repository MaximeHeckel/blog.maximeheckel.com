import { css } from '@emotion/react';
import styled from '@emotion/styled';
import useProgress from '@theme/hooks/useProgress';
import { motion } from 'framer-motion';
import React from 'react';
import useScrollCounter from '../../hooks/useScrollCounter';
import Grid from '../Grid';
import { HeaderContext } from './Context';
import { HeaderProps } from './types';

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
        css={css`
          position: ${props.sticky ? 'fixed' : 'inherit'};
          width: 100%;
          z-index: 999;
        `}
      >
        <div
          css={css`
            height: 6px;
            background-color: var(--maximeheckel-colors-brand);
          `}
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
            <HeaderContent>{props.children}</HeaderContent>
          </Grid>
        </HeaderWrapper>

        {props.progress ? (
          <motion.div
            css={css`
              @media (min-width: 700px) {
                display: none;
              }
              position: absolute;
              bottom: 0px;
            `}
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

interface StyledHeaderWrapperProps {
  slim?: boolean;
  sticky?: boolean;
}

const HeaderWrapper = styled(motion.div)<StyledHeaderWrapperProps>`
  @media (max-width: 700px) {
    height: 65px !important;
    box-shadow: ${(props) =>
      props.sticky ? 'var(--maximeheckel-shadow-1)' : 'none'};
  }
  transition: background 0.5s;
  background-color: var(--maximeheckel-colors-body);

  ${(props) =>
    props.slim
      ? `box-shadow: var(--maximeheckel-shadow-1); backdrop-filter: blur(6px); opacity: 0.88;`
      : 'box-shadow: none;'}
`;

const HeaderContent = styled('div')`
  grid-column: 2;
  height: inherit;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
