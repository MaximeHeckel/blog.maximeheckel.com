import Box from '../Box';
import Text from '../Typography';
import { ComponentOrTextProps } from './ComponentOrText.types';

const ComponentOrText = (props: ComponentOrTextProps) => {
  const { children, variant, css } = props;

  if (typeof children === 'string') {
    return (
      <Text
        css={{ margin: 0, ...css }}
        as="p"
        size="2"
        variant={variant}
        weight="3"
      >
        {children}
      </Text>
    );
  }

  return (
    <Box
      css={{
        ...css,
        '& p': {
          margin: 0,
        },
      }}
    >
      {children}
    </Box>
  );
};

export default ComponentOrText;
