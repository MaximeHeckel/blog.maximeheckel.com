import { Anchor, Text } from '@maximeheckel/design-system';
import Callout from './Callout';

const SupportCallout = () => {
  return (
    // @ts-ignore
    <Callout
      label="Support my work"
      css={{
        '--icon-background': 'var(--orange-900) !important',
        '--callout-background': 'var(--orange-400)',
      }}
    >
      <Text>
        <Text as="span" weight="4">
          Enjoying the content and feeling like supporting my work?
        </Text>{' '}
        You can show your appreciation by{' '}
        <Anchor
          href="https://www.buymeacoffee.com/maximeheckel"
          target="_blank"
          rel="noopener noreferrer"
        >
          buying me a coffee
        </Anchor>{' '}
        which will give me the much-needed energy to take on more
        ambitious/high-quality articles and projects.
      </Text>
      <Text weight="4">Thank you for reading!</Text>
    </Callout>
  );
};

export default SupportCallout;
