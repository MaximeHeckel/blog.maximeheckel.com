import { styled, Card, Text } from '@maximeheckel/design-system';
import React from 'react';

export const NewsletterFormContent = styled(Card.Body, {
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

export const ErrorMessage = (props: { children: React.ReactNode }) => (
  <Text
    as="p"
    css={{
      margin: '16px 0px 0px 0px',
      maxWidth: '800px !important',
    }}
    variant="danger"
  >
    {props.children}
  </Text>
);
