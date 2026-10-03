import { Button } from '@maximeheckel/design-system';

import { useAsk } from './AskContext';

export const AskButton = () => {
  const openAsk = useAsk();

  return (
    <Button variant="primary" onClick={() => openAsk()}>
      Ask
    </Button>
  );
};
