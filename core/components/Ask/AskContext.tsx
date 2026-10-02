import type { AskAttachment } from 'lib/askAttachments';
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
const AskContext = createContext<((attachment?: AskAttachment) => void) | null>(
  null
);

export const AskProvider = ({ children }: { children: ReactNode }) => {
  const [panelState, setPanelState] = useState<FloatingWindowState | null>(
    null
  );
  const [attachments, setAttachments] = useState<AskAttachment[]>([]);
  const [focusRequest, setFocusRequest] = useState(0);
  const openAsk = useCallback((attachment?: AskAttachment) => {
    if (attachment) {
      setAttachments((previous) => [
        ...previous.filter((item) => item.id !== attachment.id),
        attachment,
      ]);
    }
    setFocusRequest((previous) => previous + 1);
    setPanelState('open');
  }, []);

  return (
    <AskContext.Provider value={openAsk}>
      {children}
      {panelState ? (
        <AskPanel
          state={panelState}
          onStateChange={setPanelState}
          attachments={attachments}
          onAttachmentsChange={setAttachments}
          focusRequest={focusRequest}
        />
      ) : null}
    </AskContext.Provider>
  );
};

export const useAsk = () => {
  const openAsk = useContext(AskContext);
  if (!openAsk) throw new Error('useAsk must be used within an AskProvider');
  return openAsk;
};

// Standalone code renderers can be used outside the application shell.
export const useOptionalAsk = () => useContext(AskContext);
