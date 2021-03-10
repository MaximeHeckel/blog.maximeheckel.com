import Mousetrap from 'mousetrap';
import React, { Dispatch, ReactNode, SetStateAction } from 'react';

enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

const KEY = 'mode';

const defaultContextData = {
  dark: false,
  toggleDark: () => {},
};

export const ThemeContext = React.createContext(defaultContextData);

const useTheme = () => React.useContext(ThemeContext);

const storage = {
  get: (init?: Theme) => window.localStorage.getItem(KEY) || init,
  set: (value: Theme) => window.localStorage.setItem(KEY, value),
};

const supportsDarkMode = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches === true;

const useDarkMode = (): [Theme, Dispatch<SetStateAction<Theme>>] => {
  const [themeState, setThemeState] = React.useState(Theme.LIGHT);

  const setThemeStateEnhanced = () => {
    setThemeState((prevState) => {
      const nextState = prevState === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
      document.body.classList.remove('maximeheckel-' + prevState);

      document.body.classList.add('maximeheckel-' + nextState);
      storage.set(nextState);

      return nextState;
    });
  };

  React.useEffect(() => {
    const storedMode = storage.get();
    if (!storedMode && supportsDarkMode()) {
      return setThemeStateEnhanced();
    }

    if (!storedMode || storedMode === themeState) {
      return;
    }
    setThemeStateEnhanced();
  }, [themeState]);

  return [themeState, setThemeStateEnhanced];
};

const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeState, setThemeStateEnhanced] = useDarkMode();
  const toggleDark = () => {
    setThemeStateEnhanced(
      themeState === Theme.LIGHT ? Theme.DARK : Theme.LIGHT
    );
  };

  React.useEffect(() => {
    Mousetrap.bind(['ctrl+t'], () => toggleDark());
    return () => {
      Mousetrap.unbind(['ctrl+t']);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        dark: themeState === Theme.DARK,
        toggleDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeProvider, useTheme };
