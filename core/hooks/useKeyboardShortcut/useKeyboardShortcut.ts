import React from 'react';
import { defaultConfig, specialKeys } from './constants';
import { Config, EventType } from './types';
import { extractRegularKeys } from './utils';

const useKeyboardShortcut = (
  shortcut: string,
  callback: (e: KeyboardEvent) => any,
  config?: Config
) => {
  const innerConfig = React.useMemo(
    () => ({ ...defaultConfig, ...(config || {}) }),
    [config]
  );

  const handler = React.useCallback(
    (event: KeyboardEvent) => {
      const options = shortcut
        .replace(/ /g, '')
        .toUpperCase()
        .split(innerConfig.orSeparator as string);

      const match = options.find((option) => {
        const combination = option.split(innerConfig.separator as string);
        const requireCtrl = combination.includes(specialKeys.CTRL);
        const requireShift = combination.includes(specialKeys.SHIFT);
        const requireAlt = combination.includes(specialKeys.ALT);
        const requireMeta = combination.includes(specialKeys.META);

        const regularKeys = extractRegularKeys(option, innerConfig);

        return (
          regularKeys.includes(event.key.toUpperCase()) &&
          requireCtrl === event.ctrlKey &&
          requireShift === event.shiftKey &&
          requireAlt === event.altKey &&
          requireMeta === event.metaKey
        );
      });

      if (!match) {
        return;
      }

      if (innerConfig.preventDefault) {
        event.preventDefault();
      }

      callback(event);
    },
    [callback, innerConfig, shortcut]
  );

  // Add event listeners
  React.useEffect(() => {
    document.addEventListener(innerConfig.eventType as EventType, handler);
    return () =>
      document.removeEventListener(innerConfig.eventType as EventType, handler);
  }, [innerConfig.eventType, handler]);
};

export default useKeyboardShortcut;
