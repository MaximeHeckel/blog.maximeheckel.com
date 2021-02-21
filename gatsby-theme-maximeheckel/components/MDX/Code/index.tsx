import dynamic from 'next/dynamic';
import { Language } from 'prism-react-renderer';
import React from 'react';
import { PrePropsType } from './types';

const CodeBlock = dynamic(() => import('./CodeBlock'));
const LiveCodeBlock = dynamic(() => import('./LiveCodeBlock'));

export const preToCodeBlock = (
  preProps: PrePropsType
):
  | {
      live?: boolean;
      render?: boolean;
      className: string;
      codeString: string;
      language: Language;
      metastring: string;
    }
  | undefined => {
  if (
    preProps.children &&
    preProps.children.props &&
    preProps.children.props.mdxType === 'code'
  ) {
    const {
      children: codeString,
      className = '',
      ...props
    } = preProps.children.props;

    const matches = className.match(/language-(?<lang>.*)/);
    return {
      className,
      codeString: codeString.trim(),
      language:
        matches && matches.groups && matches.groups.lang
          ? (matches.groups.lang as Language)
          : ('' as Language),
      ...props,
    };
  }
};

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
