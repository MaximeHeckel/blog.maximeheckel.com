import { getGPUTier } from 'detect-gpu';
import React from 'react';

// Share both the in-flight detection and its result across all hook consumers.
let gpuTierPromise: Promise<number> | undefined;

const getSharedGPUTier = () => {
  gpuTierPromise ??= getGPUTier()
    .then(({ tier }) => tier)
    .catch(() => 0);

  return gpuTierPromise;
};

const useGPUTier = () => {
  const [tier, setTier] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;

    getSharedGPUTier().then((tier) => {
      if (!active) {
        return;
      }

      setTier(tier);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  return { tier, loading };
};

export default useGPUTier;
