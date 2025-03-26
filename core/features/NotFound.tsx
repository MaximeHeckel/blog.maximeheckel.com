import { Box, Button, styled, Text } from '@maximeheckel/design-system';
import { motion } from 'motion/react';
import Link from 'next/link';

import GlitchText from '@core/components/Glitchtext';

const OverlayWrapper = styled(Box, {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  width: '100vw',
  gap: 12,
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
        ease: 'easeOut',
      },
    },
  };

  return (
    <OverlayWrapper
      as={motion.div}
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
          letterSpacing: '-1.5px',
          lineHeight: 1.2,
          maxWidth: 400,
          textWrap: 'balance',
          textAlign: 'center',
        }}
        family="serif"
        size="8"
        variant="primary"
        weight="3"
      >
        404 - <GlitchText>Not Found</GlitchText>
      </Text>
      <Text
        as={motion.p}
        variants={textVariants}
        css={{ letterSpacing: '-1.0px', lineHeight: 1.6 }}
        variant="primary"
        size="3"
        weight="3"
      >
        This is not the page you are looking for
      </Text>
      <Box
        as={motion.div}
        variants={textVariants}
        css={{ pointerEvents: 'auto' }}
      >
        <Link href="/">
          <Button variant="primary">Head back home</Button>
        </Link>
      </Box>
    </OverlayWrapper>
  );
};

export default NotFound;
