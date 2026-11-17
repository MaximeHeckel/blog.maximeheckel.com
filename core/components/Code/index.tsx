import CodeBlock from './CodeBlock';
import { PrePropsType } from './types';
import { preToCodeBlock } from './utils';

const Code = (preProps: PrePropsType) => {
  const props = preToCodeBlock(preProps);

  if (props) {
    return <CodeBlock {...props} />;
  }

  return null;
};

export default Code;
