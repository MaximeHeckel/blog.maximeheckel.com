import { motion } from 'framer-motion';
import React from 'react';
import { styled } from 'lib/stitches.config';
import { HeaderContext } from './Context';

export const TitleWrapper = styled('div', {
  overflow: 'hidden',
  marginLeft: '40px',

  h3: {
    marginBottom: '0px',
  },

  a: {
    color: 'var(--maximeheckel-colors-typeface-primary)',
    display: 'block',
    textDecoration: 'none',
    overflow: 'hidden',
    maxWidth: '600px',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },

  '@media (max-width: 1000px)': {
    a: {
      maxWidth: '450px',
    },
  },

  '@media (max-width: 900px)': {
    a: {
      maxWidth: '300px',
    },
  },

  '@media (max-width: 700px)': {
    h3: {
      display: 'none',
    },
  },
});

const variants = {
  hide: {
    y: 80,
  },
  show: {
    y: 0,
  },
};

export interface HeaderTitleProps {}

export const Title: React.FC<HeaderTitleProps> = (props) => {
  const { children } = props;
  const { collapsed, sticky } = React.useContext(HeaderContext);

  return (
    <TitleWrapper>
      {children ? (
        <div data-testid="header-title">
          {sticky ? (
            <motion.div
              initial="hide"
              variants={variants}
              animate={collapsed ? 'show' : 'hide'}
              transition={{ ease: 'easeInOut', duration: 0.5 }}
            >
              <h3>
                <a
                  href="#top"
                  onClick={(event) => {
                    event.preventDefault();
                    document
                      .getElementById('top')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  {children}
                </a>
              </h3>
            </motion.div>
          ) : null}
        </div>
      ) : null}
    </TitleWrapper>
  );
};
