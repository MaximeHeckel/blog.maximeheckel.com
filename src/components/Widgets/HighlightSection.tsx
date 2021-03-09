import { css } from '@emotion/core';
import React from 'react';
import { InlineCode } from 'gatsby-theme-maximeheckel/src/components/MDX/Code';
import { AnimationCard, AnimationCardContent } from './Components';

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
    <AnimationCard>
      <AnimationCardContent
        css={css`
          height: 100px;
        `}
      >
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
      </AnimationCardContent>
    </AnimationCard>
  );
};

export default HighlightSection;
