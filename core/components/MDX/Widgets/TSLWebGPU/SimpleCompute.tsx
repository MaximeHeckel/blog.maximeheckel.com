import {
  Box,
  Flex,
  Icon,
  IconButton,
  Tooltip,
} from '@maximeheckel/design-system';
import { motion, useInView } from 'motion/react';
import { useState, useRef } from 'react';

import { ComputeShaderGrid } from './common/ComputeShaderGrid';
import { DataLinkMagnified } from './common/DataLinkMagnified';
import { DataLink1, DataLink2 } from './common/DataLinks';
import { DiagramLabel } from './common/DiagramLabel';
import { FragmentShader } from './common/FragmentShader';
import { StorageBuffer } from './common/StorageBuffer';
import { VertexShader } from './common/VertexShader';

const SimpleCompute = () => {
  const ref = useRef(null);
  const inView = useInView(ref);

  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  const toggleAnimations = () => {
    setAnimationsEnabled((prev) => !prev);
  };

  const toggleKey = () => {
    setAnimationsEnabled((prev) => !prev);
    setTimeout(() => {
      setAnimationsEnabled((prev) => !prev);
    }, 0);
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
        <Tooltip content="Restart">
          <IconButton
            aria-label="Restart"
            onClick={toggleKey}
            disabled={!animationsEnabled}
            variant="secondary"
          >
            <Icon.Repeat />
          </IconButton>
        </Tooltip>
      </Flex>
      <Flex as={motion.div} alignItems="end" direction="row" gap="3">
        <ComputeShaderGrid enabled={animationsEnabled && inView} repeat={2} />
        <DataLinkMagnified enabled={animationsEnabled && inView} repeat={0} />
      </Flex>
      <Box css={{ alignSelf: 'end' }}>
        <StorageBuffer enabled={animationsEnabled && inView} />
      </Box>
      <DiagramLabel compute="x1" render="x1 per frame" />
      <Box css={{ alignSelf: 'center' }}>
        <DataLink1 enabled={animationsEnabled && inView} />
      </Box>
      <Flex alignItems="center" justifyContent="space-between" gap="4">
        <VertexShader enabled={animationsEnabled && inView} />
        <DataLink2 enabled={animationsEnabled && inView} />
        <FragmentShader enabled={animationsEnabled && inView} />
      </Flex>
    </Flex>
  );
};

export default SimpleCompute;
