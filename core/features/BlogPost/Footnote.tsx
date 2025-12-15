import { styled, Anchor, Text, Box, Flex } from '@maximeheckel/design-system';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

import { HR } from '@core/components/HR';

const StyledSection = styled('section', {
  background: 'var(--background)',
  color: 'var(--text-primary)',
  paddingBottom: 48,
  width: '100%',

  '@media (max-width: 700px)': {
    paddingLeft: '20px',
    paddingRight: '20px',
  },
});

const signatureSvgVariants = {
  initial: {
    rotate: -12.5,
  },
  revealed: {
    rotate: -12.5,
    transition: {
      staggerChildren: 0.45,
    },
  },
} as const;

const signaturePathVariants = {
  initial: {
    opacity: 0,
    pathLength: 0,
  },
  revealed: {
    opacity: 1,
    pathLength: 1,
    transition: {
      pathLength: {
        duration: 1.0,
        ease: 'easeInOut',
      },
    },
  },
} as const;

const signaturePathVariantsFast = {
  initial: {
    opacity: 0,
    pathLength: 0,
  },
  revealed: {
    opacity: 1,
    pathLength: 1,
    transition: {
      pathLength: {
        duration: 0.45,
        ease: 'linear',
      },
    },
  },
} as const;

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
        width="178"
        height="74"
        viewBox="0 0 89 37"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          variants={signaturePathVariants}
          d="M54.4654 21.4922C4.35293 21.4922 -22.0342 23.1181 27.2931 2.53239C49.6904 -6.81462 22.1086 29.4696 22.5055 33.9449C23.5141 45.3182 30.7844 5.78781 43.0101 5.55587C45.4434 5.50971 33.7665 30.4629 33.6604 31.5812C32.4525 44.3133 45.0998 0.371964 58.765 1.22568C60.9304 1.36096 47.4396 27.6308 46.5885 29.7131"
          stroke="var(--text-tertiary)"
          strokeLinecap="round"
        />
        <motion.path
          variants={signaturePathVariantsFast}
          d="M58.7859 20.9479C58.2711 19.8243 56.741 20.1783 55.9408 20.8431C55.4075 21.286 54.9298 22.023 54.6888 22.6678C53.3845 26.1582 58.2763 22.7488 58.9305 21.8497C59.3452 21.2797 59.9541 19.2229 59.6842 19.874C59.1809 21.0881 57.8133 23.3324 58.5267 24.6763C59.1411 25.8339 62.1559 21.3272 62.5 20.9479"
          stroke="var(--text-tertiary)"
          strokeLinecap="round"
        />
        <motion.path
          variants={signaturePathVariantsFast}
          d="M62.5 20.9003C62.5133 20.9344 62.7544 21.1013 63.0026 21.5032C63.1756 21.7833 63.5631 22.2791 64.0171 22.9349C64.3158 23.3663 64.4792 23.5306 64.8578 23.8562C64.9734 23.9383 65.0952 24.0032 65.1841 24.0442C65.273 24.0853 65.3253 24.1007 65.4059 24.1166M66.287 20.582C66.2424 20.6201 66.093 20.738 65.9016 20.9003C65.6517 21.1124 65.2855 21.4489 64.913 21.7163C64.5061 22.0086 63.993 22.344 63.7179 22.5601C63.4489 22.7715 63.1536 23.0008 62.7284 23.3336C62.4651 23.5397 62.3243 23.6646 62.1714 23.7974C62.0671 23.8795 61.8882 24.0421 61.6729 24.284C61.5773 24.4076 61.5094 24.5328 61.3945 24.6973"
          stroke="var(--text-tertiary)"
          strokeLinecap="round"
        />
        <motion.path
          variants={signaturePathVariantsFast}
          d="M65.5 24C67.6287 23.7467 71.5931 17.8303 70.281 19.5255C69.0628 21.0993 66.8271 26.4932 70 23.5"
          stroke="var(--text-tertiary)"
          strokeLinecap="round"
        />
        <motion.path
          variants={signaturePathVariantsFast}
          d="M70 23.5C71 22.5 72.3131 20.1725 73.2662 20.0625C74 20.5001 70.6552 27.538 73.6709 22.4476C75.9601 18.5835 76.7168 20.216 75 23.9984C74.2491 25.6529 76.858 21.2763 78.5 20.4985C79.5877 19.9833 76.468 25.3557 77.5 24.9984"
          stroke="var(--text-tertiary)"
          strokeLinecap="round"
        />
        <motion.path
          variants={signaturePathVariantsFast}
          d="M77.8008 24.9523C78.4066 24.7331 79.579 23.8135 80 23.5C81.5858 22.3192 82.6468 19.8429 84.5 19.0006C86.5 18.5 86.1638 20.346 84.8358 21.187C83.9761 21.7314 82.3271 21.4218 81.5103 22C80.8035 22.5003 81.6768 24.0919 82.2943 24.5831C84.3681 26.2329 86.8281 22.7622 87.7608 21.405"
          stroke="var(--text-tertiary)"
          strokeLinecap="round"
        />
        <motion.path
          variants={signaturePathVariantsFast}
          d="M71.1367 17.5371C71.1367 17.3666 71.1765 17.8653 71.1016 18.0185"
          stroke="var(--text-tertiary)"
          strokeLinecap="round"
        />
      </motion.svg>
    </Box>
  );
};

const Footnote = ({ title, url }: { title: string; url: string }) => {
  const textTwitter = `${title} by @MaximeHeckel ${url}`;
  const textBluesky = `${title} by @maxime.bsky.social ${url}`;

  return (
    <StyledSection data-testid="footnote">
      <Flex
        alignItems="start"
        direction="column"
        css={{
          maxWidth: 700,
          margin: '0 auto',
        }}
        gap="5"
      >
        <HR />
        <Text as="p">
          Liked this article? Share it with a friend on{' '}
          <Anchor
            favicon
            href={`https://bsky.app/intent/compose?text=${encodeURI(
              textBluesky
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Bluesky
          </Anchor>{' '}
          or{' '}
          <Anchor
            favicon
            href={`https://twitter.com/intent/tweet?text=${encodeURI(
              textTwitter
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter
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
    </StyledSection>
  );
};

export { Footnote };
