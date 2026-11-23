import Button from '@core/components/Button';

import { useAsk } from './AskContext';

export const AskButton = () => {
  const openAsk = useAsk();

  return (
    <Button variant="primary" onClick={() => openAsk()}>
      Ask
    </Button>
  );
};
