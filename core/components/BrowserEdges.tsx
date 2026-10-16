import { useRouter } from 'next/router';

import { useThemeColor } from '@core/hooks/useThemeColor';

const BrowserEdges = () => {
  const router = useRouter();
  const themeColor = useThemeColor(router.pathname === '/');

  // Match the portfolio: resample on palette changes, inside main's isolation.
  return (
    <div
      key={themeColor}
      aria-hidden="true"
      className="browser-edge-top"
      style={{ backgroundColor: themeColor }}
    />
  );
};

export { BrowserEdges };
