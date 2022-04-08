import { styled, Anchor, Text } from '@maximeheckel/design-system';
import WebmentionReplies from '@theme/components/Webmentions/WebmentionReplies';
import dynamic from 'next/dynamic';

const NewsletterForm = dynamic(
  () => import('@theme/components/NewsletterForm')
);

const ColoredBlockWrapper = styled('div', {
  background: 'var(--maximeheckel-colors-emphasis)',
  color: 'var(--maximeheckel-colors-typeface-primary)',
  paddingBottom: '50px',
  paddingTop: '50px',
  width: '100%',
  gridColumn: '1 / 4',

  section: {
    '@media (max-width: 700px)': {
      paddingLeft: '20px',
      paddingRight: '20px',
    },

    margin: '0 auto',
    maxWidth: '700px',
  },
});

const Signature = ({ title, url }: { title: string; url: string }) => {
  return (
    <ColoredBlockWrapper data-testid="signature">
      <section>
        <WebmentionReplies title={title} url={url} />
        <Text as="p">
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
        </Text>
        <br />
        <Text as="p">
          Have a wonderful day. <br />
          Maxime
        </Text>
        <NewsletterForm />
      </section>
    </ColoredBlockWrapper>
  );
};

export { Signature };
