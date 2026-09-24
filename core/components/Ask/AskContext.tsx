import dynamic from 'next/dynamic';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';

const Ask = dynamic(() => import('./Ask').then((module) => module.Ask));
const AskContext = createContext<(() => void) | null>(null);

export const AskProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const openAsk = useCallback(() => setOpen(true), []);
  const closeAsk = useCallback(() => setOpen(false), []);

  return (
    <AskContext.Provider value={openAsk}>
      {children}
      {open ? <Ask open onClose={closeAsk} /> : null}
    </AskContext.Provider>
  );
};

export const useAsk = () => {
  const openAsk = useContext(AskContext);
  if (!openAsk) throw new Error('useAsk must be used within an AskProvider');
  return openAsk;
};
