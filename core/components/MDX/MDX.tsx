import React from 'react';
import styled from '@emotion/styled';
import { ArrowIcon } from '../Icons';

// TODO This should be in its own folder/file
export const ListItem: React.FC<HTMLLIElement> = (props) => {
  return (
    <li>
      <span>
        <ArrowIcon stroke="var(--maximeheckel-colors-brand)" />
      </span>
      <div>{props.children}</div>
    </li>
  );
};

const MDXBody = styled('div')<{ layout?: 'medium' | 'small' }>`
  padding: 20px 0px;
  grid-column: 2;

  display: grid;
  grid-template-columns: ${(p) =>
    p.layout === 'medium' ? 'var(--layout-medium)' : 'var(--layout-small)'};
  grid-column-gap: ${(p) => (p.layout === 'medium' ? '0px' : '20px')};

  > * {
    grid-column: 2;
  }

  color: var(--maximeheckel-colors-typeface-1);

  figure {
    margin-bottom: 2.25rem;
  }

  figcaption {
    font-size: 14px;
    text-align: left;
    line-height: 1.5;
    font-weight: 500;
    color: var(--maximeheckel-colors-typeface-2);
    padding-top: 10px;
  }

  h1 {
    color: var(--maximeheckel-colors-typeface-0);
  }

  h2 {
    color: var(--maximeheckel-colors-typeface-0);
    margin-top: 2em;
  }

  h3 {
    color: var(--maximeheckel-colors-typeface-0);
    margin-top: 2em;
  }

  strong {
    color: var(--maximeheckel-colors-typeface-0);
  }

  hr {
    height: 2px;
    width: 40%;
    margin: 50px auto;
    background-color: var(--maximeheckel-colors-typeface-0);
  }

  ul {
    margin-left: 0px;
    li {
      list-style: none;
      display: flex;
      span {
        padding-right: 8px;
        transform: translateY(4px);
      }
    }
  }

  ol {
    margin-left: 0px;
    list-style: none;
    li {
      counter-increment: li;
      display: flex;

      svg {
        display: none;
      }

      &:before {
        content: counters(li, '.') '. ';
        color: var(--maximeheckel-colors-brand);
        padding-right: 12px;
      }
    }
  }

  a {
    color: var(--maximeheckel-colors-brand);
    word-break: break-word;
  }

  twitter-widget {
    margin: 0 auto;
  }
`;

export default MDXBody;
