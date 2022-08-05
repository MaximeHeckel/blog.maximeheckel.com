import {
  Button,
  Card as DesignSystemCard,
  Flex,
  H3,
  Icon,
  Shadows,
  styled,
} from '@maximeheckel/design-system';
import { motion } from 'framer-motion';
import React from 'react';
import { AnimationCardContent } from '../Components';

const CardWrapper = styled('div', {
  position: 'relative',
  width: '300px',
  height: '200px',
});

const Wrapper = styled(motion.div, {
  position: 'relative',
  cursor: 'default',
});

const CaptureLayer = styled(motion.div, {
  position: 'absolute',
  width: '300px',
  height: '300px',
  borderRadius: '32px',
  background: `repeating-linear-gradient(
    -45deg,
    var(--maximeheckel-colors-foreground),
    var(--maximeheckel-colors-foreground) 5px,
    var(--maximeheckel-colors-emphasis) 5px,
    var(--maximeheckel-colors-emphasis) 10px
  )`,

  zIndex: '3',
  transformStyle: 'preserve-3d',
  boxShadow: `1px 1px 0 1px var(--maximeheckel-colors-emphasis),
    -1px 0 28px 0 rgb(34 33 81 / 1%), 28px 28px 28px 0 rgb(34 33 81 / 25%)`,
  transition: '0.4s ease-in-out box-shadow, 0.4s ease-in-out opacity',

  '&:hover': {
    boxShadow: `1px 1px 0 1px var(--maximeheckel-colors-emphasis),
      -1px 0 28px 0 rgba(34, 33, 81, 0.01),
      54px 54px 28px -10px rgba(34, 33, 81, 0.15)`,
  },

  variants: {
    show: {
      true: {
        opacity: 1,
      },
      false: {
        opacity: 0,
      },
    },
  },
});

const Glow = styled(motion.div, {
  background: 'linear-gradient(104.01deg, #9bebeb 5.51%, #0fa6e9 98.93%)',
  position: 'absolute',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  webkitFilter: 'blur(15px)',
  filter: 'blur(15px)',
  borderRadius: '32px',
});

const Card = styled('div', {
  borderRadius: '32px',
  border: '1px solid var(--maximeheckel-colors-emphasis)',
  marginBottom: '0px',
  overflow: 'hidden',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  background: 'hsla(var(--palette-gray-05), 0.55)',
  boxShadow: Shadows[3],
  height: '100%',
  div: {
    color: '#4a4a4c',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50px',
  },
});

const CardWithGlow = () => {
  const glowVariants = {
    hover: (inPerspective: boolean) => ({
      opacity: 0.8,
      translateX: inPerspective ? 35 : 0,
      translateY: inPerspective ? 35 : 0,
    }),
    initial: {
      opacity: 0,
    },
  };

  const tagVariants = {
    hover: {
      opacity: 1,
    },
    initial: {
      opacity: 0,
    },
  };

  const topLayerVariants = {
    hover: {
      translateX: -25,
      translateY: -10,
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
    initial: {
      translateX: -10,
      translateY: 5,
    },
  };

  const layerVariants = {
    active: (inPerspective: boolean) => ({
      rotateX: inPerspective ? 51 : 0,
      rotateY: 0,
      rotateZ: inPerspective ? 43 : 0,
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
      },
    }),
    initial: {
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
  };

  const [inPerspective, setInPerspective] = React.useState(false);

  return (
    <Flex
      alignItems="center"
      direction="column"
      css={{
        position: 'relative',
        textAlign: 'center',
      }}
    >
      <Wrapper
        initial="initial"
        whileHover="hover"
        whileTap="hover"
        animate="active"
        custom={inPerspective}
        variants={layerVariants}
      >
        <CaptureLayer show={inPerspective} variants={topLayerVariants} />
        <H3>Hover me!</H3>
        <CardWrapper>
          <Glow variants={glowVariants} custom={inPerspective} />
          <Card>
            <div>✨ It&apos;s magic! ✨</div>
          </Card>
        </CardWrapper>
        {inPerspective ? (
          <motion.div
            style={{
              position: 'absolute',
              fontSize: '12px',
              top: '-55px',
              maxWidth: '250px',
            }}
            variants={tagVariants}
          >
            Top Layer: motion component wrapper sets variant &quot;hover&quot;
            on hover
          </motion.div>
        ) : null}
        {inPerspective ? (
          <motion.div
            style={{
              position: 'absolute',
              fontSize: '12px',
              bottom: '-75px',
              right: '-15px',
              maxWidth: '250px',
            }}
            variants={tagVariants}
          >
            Bottom Layer: &quot;Glow&quot; motion component consumes hover
            variant
          </motion.div>
        ) : null}
      </Wrapper>
      <br />
      <br />
      <Button
        variant="icon"
        icon={<Icon.Stack />}
        title={inPerspective ? 'Disable perspective' : 'Enable perspective'}
        onClick={() => setInPerspective((prev) => !prev)}
      />
    </Flex>
  );
};

const FramerMotionPropagation = () => {
  return (
    <DesignSystemCard
      depth={1}
      css={{
        marginBottom: '2.25rem',
      }}
    >
      <AnimationCardContent>
        <CardWithGlow />
      </AnimationCardContent>
    </DesignSystemCard>
  );
};

export default FramerMotionPropagation;
