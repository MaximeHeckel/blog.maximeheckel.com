import { css } from '@emotion/react';
import { motion, useAnimation } from 'framer-motion';
import React from 'react';
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

  function showTooltip() {
    if (tooltipRef.current) {
      tooltipRef.current.setAttribute('aria-hidden', 'false');
      controls.start('hover');
    }
  }

  function hideTooltip() {
    if (tooltipRef.current) {
      tooltipRef.current.setAttribute('aria-hidden', 'true');
      controls.start('idle');
    }
  }

  const tipVariants = {
    hover: {
      rotate: 0,
      scale: 1,
      y: 6,
      opacity: 1,
    },
    idle: {
      rotate: -8,
      scale: 0.97,
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
          border-radius: 4px;
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
    </motion.div>
  );
};

export default Tooltip;
