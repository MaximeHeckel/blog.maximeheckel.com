import Box from '@core/components/Box';
import Flex from '@core/components/Flex';
import Text from '@core/components/Typography';

const H2 = (props: React.HTMLAttributes<HTMLHeadingElement>) => {
  const { children, id, ...rest } = props;

  return (
    <Flex
      alignItems="center"
      css={{
        marginTop: '5rem',
      }}
      gap="1"
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
          backgroundColor: 'var(--border-color)',
          marginTop: '0.25rem',
        }}
      />
    </Flex>
  );
};

export default H2;
