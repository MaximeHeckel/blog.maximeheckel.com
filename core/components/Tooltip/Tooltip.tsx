import { motion, useAnimation } from 'framer-motion';
import React from 'react';
import { css } from 'lib/stitches.config';
import VisuallyHidden from '../VisuallyHidden';

interface Props {
  id: string;
  tooltipText: string;
  tooltipVisuallyHiddenText?: string;
}

const wrapper = css({
  position: 'relative',
});

const tooltip = css({
  color: 'hsla(var(--palette-gray-00))',
  background: 'hsla(var(--palette-gray-75))',
  borderRadius: 'var(--border-radius-0)',
  position: 'absolute',
  bottom: '-60%',
  fontWeight: 'var(--font-weight-3)',
  fontSize: 'var(--font-size-1)',
  display: 'flex',
  padding: '4px 10px',
  zIndex: 5,
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  userSelect: 'none',
});

const Tooltip: React.FC<Props> = (props) => {
  const { children, id, tooltipText, tooltipVisuallyHiddenText } = props;
  const [dimensions, setDimensions] = React.useState({
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
  });

  const controls = useAnimation();

  const tooltipRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    function handleResize() {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handlePosition = React.useCallback(
    (tooltipRef: React.RefObject<HTMLSpanElement>) => {
      const { current } = tooltipRef!;

      if (current) {
        const tooltipRect = current.getBoundingClientRect();
        if (tooltipRect.left < 0) {
          current.style.left = '0';
          current.style.right = 'auto';
          current.style.transform = `translateX(${-tooltipRect.x - 40}px)`;
        } else if (tooltipRect.right > dimensions.width) {
          current.style.left = 'auto';
          current.style.right = '0';
          current.style.transform = `translateX(${
            dimensions.width - tooltipRect.right + 40
          }px)`;
        }
      }
    },
    [dimensions]
  );

  const resetPosition = (tooltipRef: React.RefObject<HTMLSpanElement>) => {
    const { current } = tooltipRef!;

    if (current) {
      current.style.removeProperty('left');
      current.style.removeProperty('right');
      current.style.removeProperty('transform');
    }
  };

  const showTooltip = () => {
    if (tooltipRef.current) {
      tooltipRef.current.setAttribute('aria-hidden', 'false');
      controls.start('hover');
      handlePosition(tooltipRef);
    }
  };

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
      className={wrapper()}
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
        className={tooltip()}
        aria-hidden={true}
        ref={tooltipRef}
        variants={tipVariants}
        transition={{
          delay: 0.15,
        }}
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
