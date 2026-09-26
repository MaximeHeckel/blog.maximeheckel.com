import dynamic from 'next/dynamic';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';

import type { FloatingWindowState } from '../FloatingWindow';

const AskPanel = dynamic(() =>
  import('./AskPanel').then((module) => module.AskPanel)
);
const AskContext = createContext<(() => void) | null>(null);

export const AskProvider = ({ children }: { children: ReactNode }) => {
  const [panelState, setPanelState] = useState<FloatingWindowState | null>(
    null
  );
  const openAsk = useCallback(() => setPanelState('open'), []);

  return (
    <AskContext.Provider value={openAsk}>
      {children}
      {panelState ? (
        <AskPanel state={panelState} onStateChange={setPanelState} />
      ) : null}
    </AskContext.Provider>
  );
};

export const useAsk = () => {
  const openAsk = useContext(AskContext);
  if (!openAsk) throw new Error('useAsk must be used within an AskProvider');
  return openAsk;
};
