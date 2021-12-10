import { styled } from 'lib/stitches.config';
import Card from '@theme/components/Card';

export const NewsletterFormContent = styled(Card.Body, {
  h3: {
    maxWidth: '600px',
    color: 'var(--maximeheckel-colors-typeface-primary)',
  },

  p: {
    color: 'var(--maximeheckel-colors-typeface-secondary)',
    marginBottom: '0px',
  },

  'span:not([data-list-item])': {
    padding: '6px 0px 7px 0px',
    color: 'var(--maximeheckel-colors-brand)',
    background: 'var(--maximeheckel-colors-emphasis)',
    fontWeight: 500,
  },

  variants: {
    withOffset: {
      true: {
        padding: '48px',
        '@media (max-width: 700px)': {
          padding: '48px 20px 30px 20px',
        },
      },
      false: {
        padding: '24px',
      },
    },
  },
});

export const ErrorMessage = styled('p', {
  marginTop: '16px',
  color: 'var(--maximeheckel-colors-danger) !important',
  maxWidth: '800px !important',
});
