import { motion } from 'motion/react';
import Link from 'next/link';
import { styled } from 'styled-system/jsx';

import Box from '@core/components/Box';
import Button from '@core/components/Button';
import GlitchText from '@core/components/Glitchtext';
import Text from '@core/components/Typography';

const OverlayWrapper = styled(motion.div, {
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100dvh',
    width: '100dvw',
    gap: '12px',
  },
});

const NotFound = () => {
  const textVariants = {
    hidden: {
      opacity: 0,
      filter: 'blur(8px)',
    },
    show: {
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        duraction: 0.3,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <OverlayWrapper
      initial="hidden"
      animate="show"
      transition={{
        delayChildren: 0.3,
        staggerChildren: 0.5,
      }}
    >
      <Text
        as={motion.h1}
        css={{
          letterSpacing: '-0.028em',
          lineHeight: 1,
          maxWidth: '400px',
          textWrap: 'balance',
          textAlign: 'center',
        }}
        family="display"
        size="6"
        variant="primary"
        weight="4"
      >
        404 - <GlitchText>Not Found</GlitchText>
      </Text>
      <Text
        as={motion.p}
        variants={textVariants}
        css={{ letterSpacing: '-0.25px', lineHeight: 1.6 }}
        variant="primary"
        size="3"
        weight="3"
      >
        This is not the page you are looking for
      </Text>
      <Box
        as={motion.div}
        variants={textVariants}
        css={{ pointerEvents: 'auto', marginTop: '8px' }}
      >
        <Link href="/">
          <Button variant="primary">Head back home</Button>
        </Link>
      </Box>
    </OverlayWrapper>
  );
};

export default NotFound;
