import { Language } from 'prism-react-renderer';

export type PrePropsType = {
  props: {
    live?: boolean;
    render?: boolean;
  };
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
  live?: boolean;
  render?: boolean;
}

export interface HighlightedCodeTextProps {
  codeString: string;
  language: Language | 'glsl';
  highlightLine?: (index: number) => boolean;
}
