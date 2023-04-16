import React from 'react';

export type IndexOperator = (nudge?: number) => void;

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const wrap = (value: number, min: number, max: number) => {
  const range = max - min;

  return ((((value - min) % range) + range) % range) + min;
};

function useIndexItem<T>(
  items: T[],
  initial = 0
): [
  T,
  IndexOperator,
  IndexOperator,
  React.Dispatch<React.SetStateAction<number>>
] {
  const [index, setIndex] = React.useState(initial);
  const itemsRef = React.useRef(items);

  React.useEffect(() => {
    itemsRef.current = items;

    setIndex((index) => clamp(index, 0, Math.max(items.length - 1, 0)));
  }, [items]);

  const previousItem = React.useCallback((nudge: number = 1) => {
    setIndex((index) =>
      wrap(index - nudge, 0, Math.max(itemsRef.current.length, 0))
    );
  }, []);

  const nextItem = React.useCallback((nudge: number = 1) => {
    setIndex((index) =>
      wrap(index + nudge, 0, Math.max(itemsRef.current.length, 0))
    );
  }, []);

  return [items[index], previousItem, nextItem, setIndex];
}

export default useIndexItem;
