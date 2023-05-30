import { Button } from '@maximeheckel/design-system';
import Glow from '@theme/components/Glow';
import { Sparkles } from '@theme/components/Search/Icons';
import { AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useState } from 'react';

const Search = dynamic(() => import('@theme/components/Search'));

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
      <AnimatePresence>
        {showSearch ? (
          <Search forceAIMode onClose={() => setShowSearch(false)} />
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default DemoButton;
