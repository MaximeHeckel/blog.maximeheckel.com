import React from 'react';
import styled from '@emotion/styled';
import { WebmentionReplies } from '@theme/components/Webmentions';

const ColoredBlockWrapper = styled('div')`
  background: var(--maximeheckel-colors-emphasis);
  color: var(--maximeheckel-colors-typeface-0);
  position: relative;
  width: 100vw;
  padding-bottom: 50px;
  padding-top: 50px;
  left: calc(-50vw + 50%);

  > div {
    @media (max-width: 700px) {
      padding-left: 20px;
      padding-right: 20px;
    }
    margin: 0 auto;
    max-width: 700px;
  }
`;

const Signature: React.FC<{ title: string; url: string }> = ({
  title,
  url,
}) => {
  return (
    <ColoredBlockWrapper data-testid="signature">
      <div>
        <WebmentionReplies title={title} url={url} />
        <p>
          Do you have any questions, comments or simply wish to contact me
          privately? Don&rsquo;t hesitate to shoot me a DM on{' '}
          <a
            href="http://twitter.com/MaximeHeckel"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter
          </a>
          .
        </p>
        <br />
        <p>
          Have a wonderful day. <br />
          Maxime
        </p>
      </div>
    </ColoredBlockWrapper>
  );
};

export { Signature };
