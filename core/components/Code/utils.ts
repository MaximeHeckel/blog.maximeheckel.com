import { Language } from 'prism-react-renderer';
import { JSXElementConstructor, ReactElement } from 'react';

import { PrePropsType } from './types';

export const preToCodeBlock = (preProps: PrePropsType) => {
  const children = preProps.children as // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | ReactElement<any, string | JSXElementConstructor<any>>
    | undefined;

  if (children && children.props) {
    const { children: codeString, className = '', ...props } = children.props;

    const matches = className.match(/language-(?<lang>.*)/);

    return {
      className,
      codeString: typeof codeString === 'string' ? codeString.trim() : '',
      language:
        matches && matches.groups && matches.groups.lang
          ? (matches.groups.lang as Language)
          : ('' as Language),
      ...props,
    };
  }
};

const RE = /(?<!=){([\d,-]+)}/;

export const getCodeFocus = (metastring: string | null, lineCount: number) => {
  if (!/(?:^|\s)collapsible(?=\s|$)/.test(metastring ?? '')) return null;

  const match = /(?:^|\s)focus=\{(\d+)(?:-(\d+))?\}(?=\s|$)/.exec(
    metastring ?? ''
  );
  const start = Number(match?.[1] ?? 1);
  const end = Number(match?.[2] ?? match?.[1] ?? 3);

  if (start < 1 || start > lineCount || end < start) {
    return { start: 1, end: Math.min(3, lineCount) };
  }

  return { start, end: Math.min(end, lineCount) };
};

export const calculateLinesToHighlight = (metastring: string | null) => {
  if (!metastring || !RE.test(metastring)) {
    return () => false;
  } else {
    const lineNumbers = RE.exec(metastring)![1]
      .split(',')
      .map((v) => v.split('-').map((val) => parseInt(val, 10)));
    return (index: number) => {
      const lineNumber = index + 1;
      const inRange = lineNumbers.some(([start, end]) =>
        end ? lineNumber >= start && lineNumber <= end : lineNumber === start
      );
      return inRange;
    };
  }
};

const RETitle = /title=[A-Za-z](.+)/;

export const hasTitle = (metastring: string | null) => {
  metastring =
    metastring
      ?.replace(/(?:^|\s)(?:collapsible|focus=\{[^}]*\})(?=\s|$)/g, '')
      .trim() ?? null;
  if (!metastring || !RETitle.test(metastring)) {
    return '';
  } else {
    return RETitle.exec(metastring)![0].split('title=')[1];
  }
};
