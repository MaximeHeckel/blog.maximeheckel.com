import styled from '@emotion/styled';
import useScrollSpy from '@theme/hooks/useScrollSpy';
import { useReducedMotion, motion, useViewportScroll } from 'framer-motion';
import React from 'react';
import ProgressBar from './ProgressBar';

interface WrapperProps {
  showTableOfContents: boolean;
}

const Wrapper = styled('div')<WrapperProps>`
  @media (max-width: 1100px) {
    left: 10px;
  }
  position: fixed;
  top: 266px;
  display: flex;
  left: 30px;

  ${(p) =>
    !p.showTableOfContents
      ? `
   ul {
     display: none;
   }
  `
      : ''}

  ul {
    @media (max-width: 1250px) {
      display: none;
    }

    max-width: 200px;
    display: flex;
    flex-direction: column;

    li {
      list-style: none;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.5;
      margin-bottom: 22px;
      a {
        ${(p) =>
          !p.showTableOfContents ? `cursor: none;  pointer-events: none;` : ''}
        color: var(--maximeheckel-colors-typeface-2);
        text-decoration: none;
      }

      &:focus:not(:focus-visible) {
        outline: 0;
      }

      &:focus-visible {
        outline: 2px solid var(--maximeheckel-colors-brand);
        opacity: 1 !important;
      }
    }
  }
`;

interface TableOfContentProps {
  ids: Array<{ id: string; title: string }>;
}

const OFFSET = 120;

const TableOfContent = ({ ids }: TableOfContentProps) => {
  const shouldReduceMotion = useReducedMotion();
  const [readingProgress, setReadingProgress] = React.useState(0);
  const { scrollYProgress } = useViewportScroll();

  const shouldShowTableOfContent =
    readingProgress > 0.07 && readingProgress < 0.95;

  const variants = {
    hide: {
      opacity: shouldReduceMotion ? 1 : 0,
    },
    show: (shouldShowTableOfContent: boolean) => ({
      opacity: shouldReduceMotion || shouldShowTableOfContent ? 1 : 0,
    }),
  };

  const handleLinkClick = (event: React.MouseEvent, id: string) => {
    event.preventDefault();

    const element = document.getElementById(id)!;
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = element.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - OFFSET;

    /**
     * Note @MaximeHeckel: This doesn't work on Safari :(
     */
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  };

  React.useEffect(
    () =>
      scrollYProgress.onChange((latest: number) => {
        setReadingProgress(parseFloat(latest.toFixed(2)));
      }),
    [scrollYProgress]
  );

  const [currentActiveIndex] = useScrollSpy(
    ids.map(
      (item) => document.querySelector(`section[id="${item.id}-section"]`)!
    ),
    OFFSET
  );

  return (
    <Wrapper showTableOfContents={shouldShowTableOfContent}>
      <ProgressBar progress={readingProgress} />
      {ids.length > 0 ? (
        <ul>
          {ids.map((item, index) => {
            return (
              <motion.li
                initial="hide"
                className={currentActiveIndex === index ? 'isCurrent' : ''}
                variants={variants}
                animate="show"
                transition={{ type: 'spring' }}
                key={item.id}
                custom={shouldShowTableOfContent}
              >
                <a
                  href={`#${item.id}`}
                  onClick={(event) =>
                    handleLinkClick(event, `${item.id}-section`)
                  }
                >
                  {item.title}
                </a>
              </motion.li>
            );
          })}
        </ul>
      ) : null}
    </Wrapper>
  );
};

export default TableOfContent;
