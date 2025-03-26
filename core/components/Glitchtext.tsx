import { Box, CSS, keyframes } from '@maximeheckel/design-system';
import React, { ReactNode, forwardRef, Ref } from 'react';

type GlitchTextProps = {
  children: ReactNode;
  css?: CSS;
  style?: React.CSSProperties;
  enabled?: boolean;
};

const GlitchText = forwardRef(
  (
    { children, css, style, enabled = true }: GlitchTextProps,
    ref: Ref<HTMLDivElement>
  ) => {
    if (typeof children !== 'string') return null;

    if (!enabled) {
      return (
        <Box
          as="span"
          ref={ref}
          css={{
            ...css,
          }}
        >
          {children}
        </Box>
      );
    }

    const glitch = keyframes({
      '0%': {
        clipPath:
          'polygon(0 43%,83% 43%,83% 22%,23% 22%,23% 24%,91% 24%,91% 26%,18% 26%,18% 83%,29% 83%,29% 17%,41% 17%,41% 39%,18% 39%,18% 82%,54% 82%,54% 88%,19% 88%,19% 4%,39% 4%,39% 14%,76% 14%,76% 52%,23% 52%,23% 35%,19% 35%,19% 8%,36% 8%,36% 31%,73% 31%,73% 16%,1% 16%,1% 56%,50% 56%,50% 8%)',
      },
      '5%': {
        clipPath:
          'polygon(0 53%,93% 53%,93% 62%,68% 62%,68% 37%,97% 37%,97% 89%,13% 89%,13% 45%,51% 45%,51% 88%,17% 88%,17% 54%,81% 54%,81% 75%,79% 75%,79% 76%,38% 76%,38% 28%,61% 28%,61% 12%,55% 12%,55% 62%,68% 62%,68% 51%,0 51%,0 92%,63% 92%,63% 4%,65% 4%)',
      },
      '30%': {
        clipPath:
          'polygon(0 53%,93% 53%,93% 62%,68% 62%,68% 37%,97% 37%,97% 89%,13% 89%,13% 45%,51% 45%,51% 88%,17% 88%,17% 54%,81% 54%,81% 75%,79% 75%,79% 76%,38% 76%,38% 28%,61% 28%,61% 12%,55% 12%,55% 62%,68% 62%,68% 51%,0 51%,0 92%,63% 92%,63% 4%,65% 4%)',
      },
      '45%': {
        clipPath:
          'polygon(0 33%,2% 33%,2% 69%,58% 69%,58% 94%,55% 94%,55% 25%,33% 25%,33% 85%,16% 85%,16% 19%,5% 19%,5% 20%,79% 20%,79% 96%,93% 96%,93% 50%,5% 50%,5% 74%,55% 74%,55% 57%,96% 57%,96% 59%,87% 59%,87% 65%,82% 65%,82% 39%,63% 39%,63% 92%,4% 92%,4% 36%,24% 36%,24% 70%,1% 70%,1% 43%,15% 43%,15% 28%,23% 28%,23% 71%,90% 71%,90% 86%,97% 86%,97% 1%,60% 1%,60% 67%,71% 67%,71% 91%,17% 91%,17% 14%,39% 14%,39% 30%,58% 30%,58% 11%,52% 11%,52% 83%,68% 83%)',
      },
      '76%': {
        clipPath:
          'polygon(0 26%,15% 26%,15% 73%,72% 73%,72% 70%,77% 70%,77% 75%,8% 75%,8% 42%,4% 42%,4% 61%,17% 61%,17% 12%,26% 12%,26% 63%,73% 63%,73% 43%,90% 43%,90% 67%,50% 67%,50% 41%,42% 41%,42% 46%,50% 46%,50% 84%,96% 84%,96% 78%,49% 78%,49% 25%,63% 25%,63% 14%)',
      },
      '90%': {
        clipPath:
          'polygon(0 41%,13% 41%,13% 6%,87% 6%,87% 93%,10% 93%,10% 13%,89% 13%,89% 6%,3% 6%,3% 8%,16% 8%,16% 79%,0 79%,0 99%,92% 99%,92% 90%,5% 90%,5% 60%,0 60%,0 48%,89% 48%,89% 13%,80% 13%,80% 43%,95% 43%,95% 19%,80% 19%,80% 85%,38% 85%,38% 62%)',
      },
      '1%, 33%, 47%, 7%, 78%, 93%': {
        clipPath: 'none',
      },
    });

    const blur = keyframes({
      '0%': {
        filter: 'blur(3px)',
      },
      '20%': {
        filter: 'blur(0px)',
      },
      '50%': {
        filter: 'blur(3px)',
      },
      '60%': {
        filter: 'blur(0px)',
      },
      '90%': {
        filter: 'blur(6px)',
      },
    });

    const opacity = keyframes({
      '0%': {
        opacity: 0.0,
      },

      '5%': {
        opacity: 0.7,
      },

      '30%': {
        opacity: 0.4,
      },

      '45%': {
        opacity: 0.6,
      },

      '76%': {
        opacity: 0.4,
      },

      '90%': {
        opacity: 0.8,
      },

      '1%,33%,47%,7%,78%,93%': {
        opacity: 0,
      },
    });

    const move = keyframes({
      '0%': {
        top: 0,
        left: -20,
      },

      '15%': {
        top: 10,
        left: 10,
      },

      '60%': {
        top: 5,
        left: -10,
      },

      '75%': {
        top: -5,
        left: 20,
      },

      to: {
        top: 10,
        left: 5,
      },
    });

    // ADD SKEW X ANIMATION ON HOVER

    return (
      <Box
        as="span"
        aria-hidden="true"
        ref={ref}
        data-text={children}
        css={{
          position: 'relative',
          animation: `${glitch} 10s step-end infinite`,
          overflow: 'visible',
          ...css,
          '&:before': {
            content: 'attr(data-text)',
            position: 'absolute',
            width: '110%',
            zIndex: -1,
            top: 10,
            left: 15,
            color: 'inherit',
            animation: `${glitch} 10s step-end infinite, ${opacity} 10s step-end infinite, ${blur} 13s step-end infinite, ${move} 15s step-end infinite`,
          },
          '&:after': {
            content: 'attr(data-text)',
            position: 'absolute',
            width: '110%',
            zIndex: -1,
            top: 5,
            left: -10,
            color: 'inherit',
            animation: `${glitch} 10s step-end infinite, ${opacity} 10s step-end infinite, ${blur} 13s step-end infinite, ${move} 15s step-end infinite`,
          },
        }}
        style={{
          ...style,
        }}
      >
        {children}
      </Box>
    );
  }
);

GlitchText.displayName = 'GlitchText';

export default GlitchText;
