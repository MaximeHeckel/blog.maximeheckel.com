import { Anchor, EM, Text, styled } from '@maximeheckel/design-system';
import { useCallback, useEffect, useState } from 'react';
import { Supporter } from 'types/supporter';

import { DotMatrixTicker } from '../DotMatrixTicker';

const StyledCallout = styled('aside', {
  position: 'relative',
  padding: '16px 16px',
  borderRadius: 'var(--border-radius-1)',
  color: 'var(--text-primary)',
  border: '1px solid var(--emphasis)',
  background: 'var(--callout-background, var(--foreground))',
  overflow: 'hidden',
  width: '100%',
  display: 'inline-grid',
  gap: 'var(--space-5)',
});

const fetchSupporters = async (): Promise<{
  total: number;
  supporters: Supporter[];
}> => {
  try {
    const response = await fetch('/api/supporters');
    if (!response.ok) {
      throw new Error('Failed to fetch supporters');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching supporters:', error);
    return { total: 0, supporters: [] };
  }
};

const SupportCallout = () => {
  const [supporterString, setSupporterString] = useState('');

  const buildSupporterString = async () => {
    try {
      const response = await fetchSupporters();
      return (
        response.supporters
          .map(
            (supporter: Supporter) =>
              `${supporter.supporter_name} ${supporter.support_coffees} ${supporter.support_coffees > 1 ? 'coffees' : 'coffee'}`
          )
          .join(', ') + ', '
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error building supporter string:', error);
      return '';
    }
  };

  const handleSupporterString = useCallback(async () => {
    const stringifiedSupporters = await buildSupporterString();
    setSupporterString(stringifiedSupporters);
  }, []);

  useEffect(() => {
    handleSupporterString();
  }, [handleSupporterString]);

  return (
    <StyledCallout>
      <Text as="span" weight="4">
        Enjoying my writing and feeling like supporting my work?
      </Text>
      <Text>
        You can show your appreciation by{' '}
        <Anchor
          href="https://www.buymeacoffee.com/maximeheckel"
          target="_blank"
          rel="noopener noreferrer"
          external
        >
          buying me a coffee
        </Anchor>{' '}
        (I really really <EM>really</EM> do like coffee) which will give me the
        much-needed energy (and fuel my caffeine addiction) to take on more
        ambitious/high-quality articles and (probably over-engineered but fun)
        projects.
      </Text>
      <Text>
        As a token of gratitude, your name will be featured on this little
        screen below!
      </Text>
      <DotMatrixTicker
        text={supporterString}
        steps={supporterString.length * 2.5}
        speed={2}
      />
      <Text weight="4">Thank you for reading!</Text>
    </StyledCallout>
  );
};

export default SupportCallout;
