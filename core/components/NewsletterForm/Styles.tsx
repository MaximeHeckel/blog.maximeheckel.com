import styled from '@emotion/styled';
import Card from '@theme/components/Card';

export const NewsletterFormContent = styled(Card.Body)<{
  withOffset?: boolean;
}>`
  padding: ${(p) => (p.withOffset ? '150px 48px 48px 48px' : '36px 24px')};
  h3 {
    max-width: 600px;
    color: var(--maximeheckel-colors-typeface-primary);
  }
  p {
    color: var(--maximeheckel-colors-typeface-secondary);
    margin-bottom: 0px;
  }

  span {
    padding: 6px 0px 7px 0px;
    color: var(--maximeheckel-colors-brand);
    background: var(--maximeheckel-colors-emphasis);
    font-weight: 500;
  }

  @media (max-width: 700px) {
    padding: ${(p) => (p.withOffset ? '150px 20px 30px 20px;' : '24px 20px')};
  }
  ul {
    margin-left: 18px;
    margin-top: 30px;
    li {
      list-style-image: url("data:image/svg+xml,%3Csvg width='16' height='14' viewBox='0 0 16 14' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M11.5858 8H1.5C0.947715 8 0.5 7.55228 0.5 7V7C0.5 6.44771 0.947715 6 1.5 6H11.5858L7.41421 1.82843C7.02369 1.4379 7.02576 0.80267 7.41628 0.412145V0.412145C7.80519 0.0232345 8.43722 0.0193376 8.8284 0.405968L14.7811 6.28944C15.1769 6.68063 15.1772 7.31967 14.7818 7.71124L8.82841 13.6065C8.43734 13.9938 7.80462 13.99 7.41545 13.6008V13.6008C7.02531 13.2107 7.02263 12.5761 7.41222 12.1854L11.5858 8Z' fill='%235184F9'/%3E%3C/svg%3E%0A");
    }
  }

  span {
    padding: 6px 0px 7px 0px;
    color: var(--maximeheckel-colors-brand);
    background: var(--maximeheckel-colors-emphasis);
  }
`;

export const ErrorMessage = styled('p')`
  margin-top: 16px;
  color: var(--maximeheckel-colors-danger) !important;
  max-width: 800px !important;
`;
