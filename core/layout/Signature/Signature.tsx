import { styled, Anchor, Text, Box, Flex } from '@maximeheckel/design-system';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

// const NewsletterForm = dynamic(() => import('@core/components/NewsletterForm'));

const StyledSection = styled('section', {
  background: 'var(--foreground)',
  color: 'var(--text-primary)',
  paddingBottom: 48,
  paddingTop: 48,
  width: '100%',

  '@media (max-width: 700px)': {
    paddingLeft: '20px',
    paddingRight: '20px',
  },
});

const signatureSvgVariants = {
  initial: {
    opacity: 0,
  },
  revealed: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
};

const signaturePathVariants = {
  initial: {
    pathLength: 0,
  },
  revealed: {
    pathLength: 1,
    transition: {
      delay: 0.2,
      duration: 2.5,
      ease: 'easeInOut',
    },
  },
};

const SignatureSVG = () => {
  const ref = useRef(null);
  const isVisible = useInView(ref);

  return (
    <Box
      css={{
        opacity: 0.7,
        color: 'var(--text-primary)',
      }}
      ref={ref}
    >
      <motion.svg
        initial="initial"
        animate={isVisible ? 'revealed' : 'initial'}
        variants={signatureSvgVariants}
        width="120"
        height="115"
        viewBox="0 0 107 103"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          variants={signaturePathVariants}
          d="M28.5 54C13.9829 72.4763 5.38484 83.2647 1.69578 88.4413C0.899752 89.5584 1.70665 91 3.07829 91V91C3.35562 91 3.62914 90.9354 3.87719 90.8114L4.32918 90.5854C5.08917 90.2054 5.70541 89.5892 6.08541 88.8292L8 85L12.0309 74.9397L16 63.5L35.4818 18.0424C35.4939 18.0142 35.5086 17.9872 35.5256 17.9616V17.9616C35.8639 17.4542 36.644 17.8749 36.4058 18.4364L24.5744 46.3247C24.5253 46.4404 24.5 46.5648 24.5 46.6904V46.6904C24.5 47.5904 25.6457 47.9724 26.1857 47.2524L30.3786 41.6619C30.4588 41.555 30.5589 41.4646 30.6735 41.3959V41.3959C31.4875 40.9075 32.4739 41.6836 32.1907 42.5896L30.5 48V48C30.1191 49.5237 31.7365 50.7699 33.1127 50.013L39.5 46.5L40.4175 45.9757C41.4792 45.3691 41.39 43.81 40.2661 43.3283V43.3283C39.7904 43.1245 39.2429 43.1837 38.8218 43.4845L38.4215 43.7704C37.185 44.6535 37.096 46.459 38.2395 47.4595L38.7954 47.946C39.5464 48.6031 40.5795 48.8344 41.5391 48.5603L43.5 48M43.5 48L43.9117 45.9417C44.2538 44.2312 45.7556 43 47.5 43V43M43.5 48V48C44.4553 48.6369 45.639 48.8402 46.7529 48.5618V48.5618C48.1445 48.2139 49.2578 47.1622 49.6796 45.7912L51 41.5L60.3912 11.8437C60.456 11.639 60.6459 11.5 60.8605 11.5V11.5C61.1835 11.5 61.419 11.8059 61.3364 12.1182L53.9496 40.0238C53.7181 40.8983 54.9135 41.397 55.3722 40.6173L55.9998 39.5504C56.3082 39.0261 57.1135 39.3187 57.0136 39.9186V39.9186C57.0046 39.9726 56.9876 40.0249 56.9631 40.0738L56.8725 40.2551C56.2419 41.5162 57.1589 43 58.5689 43H59.2769C60.0429 43 60.7602 42.6242 61.1962 41.9944L63.7298 38.3348C64.3532 37.4343 63.9074 36.1878 62.8543 35.8869V35.8869C62.0802 35.6658 61.2623 36.0546 60.9452 36.7946L60.8748 36.9588C60.424 38.0108 61.0553 39.2111 62.1776 39.4355L63.646 39.7292C64.5058 39.9012 65.3978 39.6906 66.0899 39.1523L69.5 36.5L71.5138 34.9896C72.8114 34.0164 73.8074 32.6961 74.3867 31.181L80 16.5L84.2646 2.75839C84.3954 2.33701 84.1652 1.88841 83.7467 1.74889V1.74889C83.3308 1.61025 82.88 1.82734 82.729 2.23896L77.5 16.5L72.1354 31.1307C72.0455 31.376 71.9854 31.6313 71.9566 31.891V31.891C71.6249 34.8759 75.1713 36.6763 77.3852 34.6469L82.4928 29.9649C82.7764 29.705 83.2145 29.7145 83.4865 29.9865V29.9865C83.7693 30.2693 83.7669 30.7283 83.4812 31.0081L11.8081 101.208C11.3245 101.682 10.5937 101.797 9.98823 101.494V101.494C9.01405 101.007 8.80899 99.7057 9.58619 98.9427L35.5 73.5L53.5 55.5L106 1.5"
          strokeWidth="2"
          strokeLinecap="round"
          stroke="currentColor"
        />
      </motion.svg>
    </Box>
  );
};

const Signature = ({ title, url }: { title: string; url: string }) => {
  const text = `${title} by @MaximeHeckel ${url}`;

  return (
    <StyledSection data-testid="signature">
      <Flex
        alignItems="start"
        direction="column"
        css={{
          maxWidth: 700,
          margin: '0 auto',
        }}
        gap="5"
      >
        <Text as="p">
          Liked this article? {/* @ts-ignore */}
          <Anchor
            favicon
            href={`https://twitter.com/intent/tweet?text=${encodeURI(text)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Share it with a friend on Twitter
          </Anchor>{' '}
          or{' '}
          <Anchor
            href="https://www.buymeacoffee.com/maximeheckel"
            target="_blank"
            rel="noopener noreferrer"
          >
            support me
          </Anchor>{' '}
          to take on more ambitious projects to write about. Have a question,
          feedback or simply wish to contact me privately?{' '}
          <Anchor
            href="http://twitter.com/MaximeHeckel"
            target="_blank"
            rel="noopener noreferrer"
          >
            Shoot me a DM
          </Anchor>{' '}
          and I&apos;ll do my best to get back to you.
        </Text>

        <Box>
          <Text as="p" variant="primary">
            Have a wonderful day.
          </Text>
          <Flex alignItems="start">
            <Text as="p" variant="primary">
              – Maxime
            </Text>
          </Flex>
        </Box>
        <SignatureSVG />
      </Flex>
      {/* <NewsletterForm /> */}
    </StyledSection>
  );
};

export { Signature };
