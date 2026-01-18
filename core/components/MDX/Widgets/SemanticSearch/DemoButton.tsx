import { Button, Icon } from '@maximeheckel/design-system';
import dynamic from 'next/dynamic';
import { useState } from 'react';

import Glow from '@core/components/Glow';

const Search = dynamic(() => import('@core/components/Search'));

const DemoButton = () => {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      <Glow>
        <Button
          onClick={() => setShowSearch(true)}
          startIcon={<Icon.AIChat variant="default" />}
          variant="primary"
        >
          Ask me anything!
        </Button>
      </Glow>
      <Search onClose={() => setShowSearch(false)} open={showSearch} />
    </>
  );
};

export default DemoButton;
