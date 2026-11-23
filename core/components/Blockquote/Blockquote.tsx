import { useEffect, useRef } from 'react';

import { BlockquoteContent, BlockquoteWrapper } from './Blockquote.styles';
import { BlockquoteProps } from './Blockquote.types';

const Blockquote = (props: BlockquoteProps) => {
  const { children, ...rest } = props;

  const ref = useRef<HTMLQuoteElement>(null);

  const handleResize = () => {
    if (ref.current) {
      const vw = document.documentElement.clientWidth / 100;
      ref.current.style.setProperty('--vw', `${vw}px`);
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <BlockquoteWrapper ref={ref} {...rest}>
      <BlockquoteContent>{children}</BlockquoteContent>
    </BlockquoteWrapper>
  );
};

export default Blockquote;
