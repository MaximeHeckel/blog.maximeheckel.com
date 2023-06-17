import { Callout as SystemCallout, Flex } from '@maximeheckel/design-system';
import { CalloutProps as SystemCalloutProps } from '@maximeheckel/design-system/dist/types/components/Callout';

const Callout = (props: SystemCalloutProps) => {
  const { children, ...rest } = props;

  return (
    <SystemCallout
      css={{
        marginTop: 'var(--space-3)',
      }}
      {...rest}
    >
      <Flex alignItems="start" direction="column" gap="6">
        {props.children}
      </Flex>
    </SystemCallout>
  );
};

export default Callout;
