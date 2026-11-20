import { Button, styled } from '@maximeheckel/design-system';
import { motion, useReducedMotion } from 'motion/react';
import { ReactNode, useId, useLayoutEffect, useRef, useState } from 'react';

interface CollapsibleCodeProps {
  children: ReactNode;
  start: number;
  end: number;
  lineCount: number;
}

const CollapsibleCode = (props: CollapsibleCodeProps) => {
  const { children, start, end, lineCount } = props;
  const [expanded, setExpanded] = useState(false);
  const viewport = useRef<HTMLDivElement>(null);
  const id = useId();
  const reducedMotion = useReducedMotion();
  const focusLines = end - start + 1;
  const visibleLines = expanded
    ? Math.min(lineCount, focusLines * 1.5)
    : focusLines;
  const transition = {
    duration: reducedMotion ? 0 : 0.15,
    ease: 'easeOut' as const,
  };

  // Keep the focus area in view on expansion, while allowing readers to scroll
  // back to the beginning. Restore it when collapsing after scrolling elsewhere.
  useLayoutEffect(() => {
    if (!expanded && viewport.current) {
      viewport.current.scrollTop = (start - 1) * 24;
    }
  }, [expanded, start]);

  return (
    <Container>
      <Viewport
        ref={viewport}
        id={id}
        role="region"
        aria-label="Code snippet"
        tabIndex={expanded ? 0 : -1}
        data-expanded={expanded}
        data-offset={start > 1}
        initial={false}
        animate={{
          height: `calc(${visibleLines * 24}px + var(--space-2) * 2)`,
        }}
        transition={transition}
        style={{ overflowY: expanded ? 'auto' : 'hidden' }}
      >
        {children}
      </Viewport>
      <ToggleBar>
        <Button
          type="button"
          size="small"
          variant="tertiary"
          rounded
          css={{
            border: '1px solid var(--border-color)',
            background: 'var(--code-snippet-background)',
            pointerEvents: 'auto',
          }}
          aria-controls={id}
          aria-expanded={expanded}
          onClick={() => {
            setExpanded((value) => !value);
          }}
        >
          {expanded ? 'Show less' : `Show all ${lineCount} lines`}
        </Button>
      </ToggleBar>
    </Container>
  );
};

export default CollapsibleCode;

const Container = styled('div', {
  position: 'relative',
  minWidth: 0,
  overflow: 'hidden',
  borderBottomLeftRadius: 'var(--code-block-radius, var(--border-radius-2))',
  borderBottomRightRadius: 'var(--code-block-radius, var(--border-radius-2))',
  background: 'var(--code-snippet-background)',
});

const Viewport = styled(motion.div, {
  position: 'relative',
  overflowX: 'hidden',
  overscrollBehavior: 'contain',
  scrollbarGutter: 'stable',
  '&[data-expanded="false"]': {
    maskImage: 'linear-gradient(to bottom, black 65%, transparent)',
    '&[data-offset="true"]': {
      maskImage:
        'linear-gradient(to bottom, transparent, black 10%, black 65%, transparent)',
    },
  },
  '&:focus-visible': {
    outline: '2px solid var(--accent)',
    outlineOffset: '-2px',
  },
});

const ToggleBar = styled('div', {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 3,
  display: 'flex',
  justifyContent: 'center',
  padding: 'var(--space-2)',
  pointerEvents: 'none',
});
