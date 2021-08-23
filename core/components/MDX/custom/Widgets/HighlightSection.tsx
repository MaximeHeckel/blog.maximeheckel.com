import { css } from '@emotion/react';
import Card from '@theme/components/Card';
import React from 'react';
import InlineCode from '../../InlineCode';

const HighlightSection = () => {
  const [highlight, setHighlight] = React.useState(false);

  React.useEffect(() => {
    const sections = document.querySelectorAll('section[id]');

    if (highlight) {
      sections.forEach((section) => {
        // @ts-ignore
        section.style = `
        -webkit-transition: box-shadow linear 0.5s;
        transition: box-shadow linear 0.5s;
        box-shadow: 0 0 20px #ff008c;
        `;
      });
    } else {
      sections.forEach((section) => {
        // @ts-ignore
        section.style = `
        -webkit-transition: box-shadow linear 0.5s;
        transition: box-shadow linear 0.5s;
        box-shadow: none;
        `;
      });
    }
  }, [highlight]);

  return (
    <Card
      depth={1}
      css={css`
        margin-bottom: 2.25rem;
      `}
    >
      <Card.Body>
        <div>
          <input
            css={css`
              margin-right: 8px;
            `}
            id="highlight"
            type="checkbox"
            checked={highlight}
            onChange={() => {
              setHighlight((prev) => !prev);
            }}
          />
          <label htmlFor="highlight">
            Highlight the <InlineCode>{'<section/>'}</InlineCode> tags of this
            post
          </label>
        </div>
      </Card.Body>
    </Card>
  );
};

export default HighlightSection;
