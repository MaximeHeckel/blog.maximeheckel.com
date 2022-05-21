import { Callout, Text } from '@maximeheckel/design-system';
import useGPUTier from '@theme/hooks/useGPUTier';

const CalloutGPUTier = () => {
  const { tier, loading: tierLoading } = useGPUTier();

  const instructionMessage =
    tier > 1
      ? 'Demos will be run automatically.'
      : 'You will need to run demos manually by clicking on the "Run" button present on the bottom right of some code snippets.';

  return (
    <Callout variant="danger">
      <Text as="p">
        This blog post includes WebGL based demos that can be pretty heavy to
        run on some devices. To ensure the best reading experience (and avoid
        crashes) I automatically check your GPU tier when possible to decide
        whether to auto-run the demos or not.
      </Text>
      {!tierLoading ? (
        <Text as="p" variant="info">
          Your current device has a tier {tier} GPU. {instructionMessage}
        </Text>
      ) : null}
    </Callout>
  );
};

export default CalloutGPUTier;
