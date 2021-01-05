import { motion } from 'framer-motion';
import React from 'react';
// @ts-ignore
import AnchorLink from 'react-anchor-link-smooth-scroll';
import styled from '@emotion/styled';
import { HeaderContext } from './Context';

export const TitleWrapper = styled.div`
  overflow: hidden;
  margin-left: 33px;

  h3 {
    margin-bottom: 0px;
  }

  a {
    color: var(--maximeheckel-colors-typeface-0);
    display: block;
    text-decoration: none;
    overflow: hidden;
    max-width: 600px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  @media (max-width: 1000px) {
    a {
      max-width: 450px;
    }
  }

  @media (max-width: 900px) {
    a {
      max-width: 300px;
    }
  }

  @media (max-width: 700px) {
    h3 {
      display: none;
    }
  }
`;

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
  const { collapsed, sticky } = React.useContext(HeaderContext);

  return (
    <TitleWrapper>
      {props.children ? (
        <div data-testid="header-title">
          {sticky ? (
            <motion.div
              initial="hide"
              variants={variants}
              animate={collapsed ? 'show' : 'hide'}
              transition={{ ease: 'easeInOut', duration: 0.5 }}
            >
              <h3>
                <AnchorLink offset="150" href="#top">
                  {props.children}
                </AnchorLink>
              </h3>
            </motion.div>
          ) : null}
        </div>
      ) : null}
    </TitleWrapper>
  );
};
