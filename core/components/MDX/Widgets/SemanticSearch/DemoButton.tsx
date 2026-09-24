import { Button, Icon } from '@maximeheckel/design-system';
import dynamic from 'next/dynamic';
import { useState } from 'react';

import Glow from '@core/components/Glow';

const Ask = dynamic(() => import('@core/components/Ask'));

const DemoButton = () => {
  const [showAsk, setShowAsk] = useState(false);

  return (
    <>
      <Glow>
        <Button
          onClick={() => setShowAsk(true)}
          startIcon={<Icon.AIChat variant="default" />}
          variant="primary"
        >
          Ask me anything!
        </Button>
      </Glow>
      <Ask onClose={() => setShowAsk(false)} open={showAsk} />
    </>
  );
};

export default DemoButton;
