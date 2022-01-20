import { getGPUTier } from 'detect-gpu';
import React from 'react';

const useGPUTier = () => {
  const [tier, setTier] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getGPUTier().then(({ tier }) => {
      setTier(tier);
      setLoading(false);
    });
  }, [setTier]);

  return { tier, loading };
};

export default useGPUTier;
