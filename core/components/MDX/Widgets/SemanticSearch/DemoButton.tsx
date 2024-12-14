import { Button } from '@maximeheckel/design-system';
import dynamic from 'next/dynamic';
import { useState } from 'react';

import Glow from '@core/components/Glow';
import { Sparkles } from '@core/components/Search/Icons';

const Search = dynamic(() => import('@core/components/Search'));

const DemoButton = () => {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      <Glow>
        <Button
          onClick={() => setShowSearch(true)}
          startIcon={<Sparkles />}
          variant="primary"
        >
          Ask me anything!
        </Button>
      </Glow>
      <Search
        forceAIMode
        onClose={() => setShowSearch(false)}
        open={showSearch}
      />
    </>
  );
};

export default DemoButton;
