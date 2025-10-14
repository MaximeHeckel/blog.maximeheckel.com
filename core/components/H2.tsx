import { Box, Flex, Text } from '@maximeheckel/design-system';

const H2 = (props: React.HTMLAttributes<HTMLHeadingElement>) => {
  const { children, id, ...rest } = props;

  return (
    <Flex
      alignItems="center"
      css={{
        marginTop: '5rem',
        marginBottom: '0.75rem',
      }}
      gap="2"
    >
      <Text as="h2" id={id} variant="primary" weight="4" size="4" {...rest}>
        {children}
      </Text>
      <Box
        css={{
          flex: 1,
          width: '100%',
          height: '1px',
          border: 'none',
          backgroundImage:
            'linear-gradient(to right,var(--border-color) 50%, var(--background) 0)',
          backgroundSize: '8px 1px',
          backgroundRepeat: 'repeat-x',
          marginTop: '0.25rem',
        }}
      />
    </Flex>
  );
};

export default H2;
