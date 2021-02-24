import dynamic from 'next/dynamic';
import React from 'react';
import { PrePropsType } from './types';
import { preToCodeBlock } from './utils';

const CodeBlock = dynamic(() => import('./CodeBlock'));
const LiveCodeBlock = dynamic(() => import('./LiveCodeBlock'));

// @ts-ignore
const Code: React.FC<PrePropsType> = (preProps) => {
  const props = preToCodeBlock(preProps);

  if (props) {
    return props.live || props.render ? (
      <LiveCodeBlock {...props} />
    ) : (
      <CodeBlock {...props} />
    );
  }

  return null;
};

export default Code;
