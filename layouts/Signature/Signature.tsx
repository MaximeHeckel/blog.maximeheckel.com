import styled from '@emotion/styled';
import Anchor from '@theme/components/Anchor';
import WebmentionReplies from '@theme/components/Webmentions/WebmentionReplies';
import dynamic from 'next/dynamic';

const NewsletterForm = dynamic(
  () => import('@theme/components/NewsletterForm')
);

const ColoredBlockWrapper = styled('div')`
  background: var(--maximeheckel-colors-emphasis);
  color: var(--maximeheckel-colors-typeface-primary);
  padding-bottom: 50px;
  padding-top: 50px;
  width: 100%;
  grid-column: 1 / 4;

  section {
    @media (max-width: 700px) {
      padding-left: 20px;
      padding-right: 20px;
    }

    margin: 0 auto;
    max-width: 700px;
  }
`;

const Signature = ({ title, url }: { title: string; url: string }) => {
  return (
    <ColoredBlockWrapper data-testid="signature">
      <section>
        <WebmentionReplies title={title} url={url} />
        <p>
          Do you have any questions, comments or simply wish to contact me
          privately? Don&rsquo;t hesitate to shoot me a DM on{' '}
          <Anchor
            favicon
            href="http://twitter.com/MaximeHeckel"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter
          </Anchor>
          .
        </p>
        <br />
        <p>
          Have a wonderful day. <br />
          Maxime
        </p>
        <NewsletterForm />
      </section>
    </ColoredBlockWrapper>
  );
};

export { Signature };
