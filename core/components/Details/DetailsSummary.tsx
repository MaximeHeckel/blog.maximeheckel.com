import { Collapsible } from '@base-ui/react/collapsible';

import ComponentOrText from '../ComponentOrText';
import Flex from '../Flex';
import { glassMaterialPrimitives } from '../GlassMaterial';
import Icon from '../Icon';
import { StyledSummary } from './Details.styles';
import { SummaryProps } from './Details.types';

const Summary = (props: SummaryProps) => {
  const { children } = props;

  return (
    <Collapsible.Trigger render={<StyledSummary />}>
      <ComponentOrText
        css={{ paddingRight: 'var(--space-8)' }}
        variant="primary"
      >
        {children}
      </ComponentOrText>
      <Flex
        alignItems="center"
        css={{
          position: 'absolute',
          right: 'var(--space-4)',
          padding: 'var(--space-1)',
          top: 'var(--space-4)',
          borderRadius: '50%',
          background: glassMaterialPrimitives['background-color'],
        }}
        justifyContent="center"
      >
        <Icon.X size="3" variant="tertiary" />
      </Flex>
    </Collapsible.Trigger>
  );
};

Summary.displayName = 'Summary';

export default Summary;
