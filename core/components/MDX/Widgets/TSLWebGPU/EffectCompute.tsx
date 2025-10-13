import {
  Flex,
  IconButton,
  Icon,
  Box,
  Tooltip,
} from '@maximeheckel/design-system';
import { useInView, useReducedMotion, motion } from 'motion/react';
import { useRef, useState } from 'react';

import { ComputeShaderGrid } from './common/ComputeShaderGrid';
import { DataLink0, DataLink11 } from './common/DataLinks';
import { DiagramLabel } from './common/DiagramLabel';
import { EffectFragment } from './common/EffectFragment';
import { TextureBuffer } from './common/TextureBuffer';

const EffectCompute = () => {
  const ref = useRef(null);
  const inView = useInView(ref);

  const isReducedMotionEnabled = useReducedMotion();
  const [animationsEnabled, setAnimationsEnabled] = useState(
    !isReducedMotionEnabled ? true : false
  );

  const toggleAnimations = () => {
    setAnimationsEnabled((prev) => !prev);
  };

  return (
    <Flex
      ref={ref}
      alignItems="stretch"
      css={{ userSelect: 'none' }}
      direction="column"
      gap="2"
    >
      <Flex justifyContent="end" gap="2">
        <Tooltip content="Toggle Animations">
          <IconButton
            aria-label="Toggle Animations"
            onClick={toggleAnimations}
            variant="secondary"
          >
            {animationsEnabled ? <Icon.Pause /> : <Icon.Play />}
          </IconButton>
        </Tooltip>
      </Flex>
      <Flex as={motion.div} alignItems="end" direction="row" gap="3">
        <ComputeShaderGrid enabled={animationsEnabled && inView} />
        <DataLink0 enabled={animationsEnabled && inView} />
      </Flex>
      <Flex css={{ alignSelf: 'end', paddingRight: '5vw' }} gap="3">
        <TextureBuffer enabled={animationsEnabled && inView} />
      </Flex>
      <DiagramLabel compute="x1 per frame" render="x1 per frame" />
      <Box css={{ alignSelf: 'center' }}>
        <DataLink11 enabled={animationsEnabled && inView} />
      </Box>
      <Flex alignItems="center" justifyContent="center" gap="4">
        <EffectFragment enabled={animationsEnabled && inView} />
      </Flex>
    </Flex>
  );
};

export default EffectCompute;
