import { styled } from 'lib/stitches.config';

export const StyledCalloutIconWrapper = styled('div', {
  position: 'absolute',
  display: 'flex',
  top: '-24px',
  right: '-18px',
  borderRadius: '50%',
  padding: '8px',
  color: 'var(--maximeheckel-colors-body)',
  border: '8px solid var(--maximeheckel-colors-body)',
  background: 'var(--icon-background, var(--maximeheckel-colors-body))',

  variants: {
    variant: {
      info: {
        '--icon-background': 'var(--maximeheckel-colors-brand)',
      },
      danger: {
        '--icon-background': 'var(--maximeheckel-colors-danger)',
      },
    },
  },
});

export const StyledCalloutLabelWrapper = styled('div', {
  position: 'absolute',
  display: 'flex',
  top: '-24px',
  right: '-8px',
  borderRadius: 'var(--border-radius-1)',
  padding: '8px',
  color: 'var(--maximeheckel-colors-body)',
  fontSize: 'var(--font-size-1)',
  fontWeight: 'var(--font-weight-3)',
  userSelect: 'none',
  background: 'var(--icon-background, var(--maximeheckel-colors-body))',

  variants: {
    variant: {
      info: {
        '--icon-background': 'var(--maximeheckel-colors-brand)',
      },
      danger: {
        '--icon-background': 'var(--maximeheckel-colors-danger)',
      },
    },
  },
});

export const StyledCallout = styled('aside', {
  '*:last-child': {
    marginBottom: '0px',
  },

  position: 'relative',
  padding: '30px 30px',
  marginBottom: '2.25rem',
  borderRadius: 'var(--border-radius-1)',
  color: 'var(--maximeheckel-colors-typeface-primary)',
  border: '2px solid var(--maximeheckel-colors-foreground)',
  background: 'var(--callout-background, var(--maximeheckel-colors-emphasis))',

  variants: {
    variant: {
      info: {
        '--callout-background': 'var(--maximeheckel-colors-emphasis)',
      },
      danger: {
        '--callout-background': 'var(--maximeheckel-colors-danger-emphasis)',
      },
    },
  },
});
