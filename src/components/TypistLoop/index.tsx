import React from 'react';

const TypistLoop = ({ interval = 1000, children }) => {
  let timer;
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const showNext = () => {
    setCurrentIndex((currentIndex + 1) % React.Children.count(children));
  };

  const onTypingDone = () => {
    timer = setTimeout(showNext, interval);
  };

  React.useEffect(() => {}, [clearTimeout(timer)]);

  return React.Children.map(
    children,
    (child, i) =>
      i === currentIndex && React.cloneElement(child, { onTypingDone })
  );
};

export default TypistLoop;
