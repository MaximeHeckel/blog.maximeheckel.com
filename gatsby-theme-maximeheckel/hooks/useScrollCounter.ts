import React from 'react';

const useScrollCounter = (offset: number) => {
  const [reached, setReached] = React.useState(false);
  React.useEffect(() => {
    const showTitle = () => setReached(window.scrollY > offset);
    window.addEventListener('scroll', showTitle);
    return () => {
      window.removeEventListener('scroll', showTitle);
    };
  }, [offset]);

  return reached;
};

export default useScrollCounter;
