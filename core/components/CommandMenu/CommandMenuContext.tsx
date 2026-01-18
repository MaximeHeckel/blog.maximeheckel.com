import { useKeyboardShortcut } from '@maximeheckel/design-system';
import dynamic from 'next/dynamic';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { CommandMenu } from './CommandMenu';

const Search = dynamic(() => import('@core/components/Search'));

export interface Action {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number | string }>;
  onSelect: () => void;
  keywords?: string[];
}

interface CommandMenuContextValue {
  actions: Action[];
  registerAction: (action: Action) => void;
  unregisterAction: (id: string) => void;
  openCommandMenu: () => void;
  openAIMode: () => void;
}

export const CommandMenuContext = createContext<CommandMenuContextValue | null>(
  null
);

interface CommandMenuProviderProps {
  children: React.ReactNode;
}

export const CommandMenuProvider = ({ children }: CommandMenuProviderProps) => {
  const [actions, setActions] = useState<Action[]>([]);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [isAIModeOpen, setIsAIModeOpen] = useState(false);

  useKeyboardShortcut('ctrl+k|meta+k', () => setIsCommandMenuOpen(true));

  const registerAction = useCallback((action: Action) => {
    setActions((prev) => {
      if (prev.some((a) => a.id === action.id)) {
        return prev;
      }
      return [...prev, action];
    });
  }, []);

  const unregisterAction = useCallback((id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const openCommandMenu = useCallback(() => {
    setIsCommandMenuOpen(true);
  }, []);

  const openAIMode = useCallback(() => {
    setIsAIModeOpen(true);
  }, []);

  const contextRef = useRef({
    registerAction,
    unregisterAction,
    openCommandMenu,
    openAIMode,
  });

  const value: CommandMenuContextValue = {
    actions,
    registerAction: contextRef.current.registerAction,
    unregisterAction: contextRef.current.unregisterAction,
    openCommandMenu: contextRef.current.openCommandMenu,
    openAIMode: contextRef.current.openAIMode,
  };

  return (
    <CommandMenuContext.Provider value={value}>
      <CommandMenu
        open={isCommandMenuOpen}
        onOpenChange={setIsCommandMenuOpen}
        onAskAI={() => setIsAIModeOpen(true)}
      />
      <Search open={isAIModeOpen} onClose={() => setIsAIModeOpen(false)} />
      {children}
    </CommandMenuContext.Provider>
  );
};

export const useCommandMenuActions = () => {
  const context = useContext(CommandMenuContext);
  if (!context) {
    throw new Error(
      'useCommandMenuActions must be used within a CommandMenuProvider'
    );
  }
  return context.actions;
};

export const useRegisterAction = (action: Action) => {
  const context = useContext(CommandMenuContext);
  const actionRef = useRef(action);
  actionRef.current = action;

  useEffect(() => {
    if (!context) {
      return;
    }

    context.registerAction(actionRef.current);

    return () => {
      context.unregisterAction(actionRef.current.id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action.id]);
};
