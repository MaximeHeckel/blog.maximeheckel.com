import { useEffect, useRef } from 'react';

type Delay = number | null;
type TimerHandler = (...args: any[]) => void;

const useInterval = (callback: TimerHandler, delay: Delay) => {
  const savedCallback = useRef<TimerHandler>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = (...args: any[]) => savedCallback.current!(...args);

    if (delay !== null) {
      const intervalId = setInterval(handler, delay);
      return () => clearInterval(intervalId);
    }
  }, [delay]);
};

export default useInterval;
