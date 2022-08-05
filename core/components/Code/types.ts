import { Language } from 'prism-react-renderer';

export type PrePropsType = {
  children: {
    props: {
      metastring: string;
      mdxType?: string;
      className?: string;
      children: string;
    };
  };
};

export interface CodeBlockProps {
  codeString: string;
  language: Language;
  metastring: string | null;
}

export interface HighlightedCodeTextProps {
  codeString: string;
  language: Language | 'glsl';
  highlightLine?: (index: number) => boolean;
}
