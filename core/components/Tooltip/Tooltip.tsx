import { css } from '@emotion/react';
import { motion, useAnimation } from 'framer-motion';
import React from 'react';
// import ReactDOM from 'react-dom';
import VisuallyHidden from '../VisuallyHidden';

interface Props {
  id: string;
  tooltipText: string;
  tooltipVisuallyHiddenText?: string;
}

const Tooltip: React.FC<Props> = (props) => {
  const { children, id, tooltipText, tooltipVisuallyHiddenText } = props;

  const controls = useAnimation();

  const tooltipRef = React.useRef<HTMLSpanElement>(null);

  function handlePosition(tooltipRef: React.RefObject<HTMLSpanElement>) {
    const { current } = tooltipRef!;

    if (current) {
      const tooltipRect = current.getBoundingClientRect();
      if (tooltipRect.x < 0) {
        current.style.left = '0';
        current.style.right = 'auto';
        current.style.transform = `translateX(${-tooltipRect.x + 15}px)`;
      } else if (tooltipRect.x > window.outerWidth) {
        current.style.left = 'auto';
        current.style.right = '0';
        current.style.transform = `translateX(${
          window.outerWidth - tooltipRect.x - 15
        }px)`;
      }
    }
  }

  function resetPosition(tooltipRef: React.RefObject<HTMLSpanElement>) {
    const { current } = tooltipRef!;

    if (current) {
      current.style.removeProperty('left');
      current.style.removeProperty('right');
      current.style.removeProperty('transform');
    }
  }

  function showTooltip() {
    if (tooltipRef.current) {
      tooltipRef.current.setAttribute('aria-hidden', 'false');
      controls.start('hover');
      handlePosition(tooltipRef);
    }
  }

  function hideTooltip() {
    if (tooltipRef.current) {
      tooltipRef.current.setAttribute('aria-hidden', 'true');
      controls.start('idle');
      resetPosition(tooltipRef);
    }
  }

  const tipVariants = {
    hover: {
      scale: 1,
      y: 6,
      opacity: 1,
    },
    idle: {
      scale: 0.95,
      y: 10,
      opacity: 0,
    },
  };

  return (
    <motion.div
      css={css`
        position: relative;
      `}
      initial="idle"
      animate={controls}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      onKeyDown={(event) => {
        if (event.which === 27) {
          event.preventDefault();
          hideTooltip();
          return false;
        }
      }}
    >
      {children}
      {/* {ReactDOM.createPortal( */}
      <motion.span
        id={id}
        aria-hidden={true}
        ref={tooltipRef}
        variants={tipVariants}
        transition={{
          delay: 0.15,
        }}
        css={css`
          color: hsla(var(--palette-gray-00));
          background: hsla(var(--palette-gray-80));
          box-shadow: var(--maximeheckel-shadow-2);
          border-radius: var(--border-radius-0);
          position: absolute;
          right: 0;
          bottom: -60%;
          font-weight: 500;
          font-size: 14px;
          display: flex;
          padding: 4px 10px;
          z-index: 5;
          white-space: nowrap;
          pointer-events: none;
          user-select: none;
        `}
        role="tooltip"
      >
        {tooltipText}
        {tooltipVisuallyHiddenText ? (
          <VisuallyHidden as="p">{tooltipVisuallyHiddenText}</VisuallyHidden>
        ) : null}
      </motion.span>
      {/* ,document.body
      )} */}
    </motion.div>
  );
};

export default Tooltip;
