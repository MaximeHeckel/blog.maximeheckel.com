import styled from '@emotion/styled';
import Anchor from '@theme/components/Anchor';
import useProgress from '@theme/hooks/useProgress';
import useScrollSpy from '@theme/hooks/useScrollSpy';
import { useReducedMotion, motion } from 'framer-motion';
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

/**
 * This offset is meant for the smooth scrolling and
 * Scrollspy to take into account the header height
 */
const OFFSET = 150;

const TableOfContent = ({ ids }: TableOfContentProps) => {
  const shouldReduceMotion = useReducedMotion();
  const readingProgress = useProgress();

  /**
   * Only show the table of content between 7% and 95%
   * of the page scrolled.
   */
  const shouldShowTableOfContent =
    readingProgress > 0.07 && readingProgress < 0.95;

  /**
   * Variants handling hidding/showing the table of content
   * based on the amount scrolled by the reader
   */
  const variants = {
    hide: {
      opacity: shouldReduceMotion ? 1 : 0,
    },
    show: (shouldShowTableOfContent: boolean) => ({
      opacity: shouldReduceMotion || shouldShowTableOfContent ? 1 : 0,
    }),
  };

  /**
   * Handles clicks on links of the table of content and smooth
   * scrolls to the corresponding section.
   * @param {React.MouseEvent} event the click event
   * @param {string} id the id of the section to scroll to
   */
  const handleLinkClick = (event: React.MouseEvent, id: string) => {
    event.preventDefault();

    const element = document.getElementById(id)!;
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = element.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - 50;

    /**
     * Note @MaximeHeckel: This doesn't work on Safari :(
     * TODO: find an alternative for Safari
     */
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  };

  /**
   * Get the index of the current active section that needs
   * to have its corresponding title highlighted in the
   * table of content
   */
  const [currentActiveIndex] = useScrollSpy(
    ids.map(
      (item) => document.querySelector(`section[id="${item.id}-section"]`)!
    ),
    { offset: OFFSET }
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
                <Anchor
                  discreet
                  href={`#${item.id}`}
                  onClick={(event) =>
                    handleLinkClick(event, `${item.id}-section`)
                  }
                >
                  {item.title}
                </Anchor>
              </motion.li>
            );
          })}
        </ul>
      ) : null}
    </Wrapper>
  );
};

export default TableOfContent;
