import React from 'react';

interface IProps {
  interval: number;
}

const TypistLoop: React.FC<IProps> = ({ interval = 1000, children }) => {
  let timer: number = 0;
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const showNext = () => {
    setCurrentIndex((currentIndex + 1) % React.Children.count(children));
  };

  const onTypingDone = () => {
    timer = window.setTimeout(showNext, interval);
  };

  React.useEffect(() => {
    window.clearTimeout(timer);
  }, [timer]);

  return (
    <>
      {React.Children.map(
        children,
        (child, i) =>
          i === currentIndex &&
          React.cloneElement(child as React.ReactElement<any>, {
            onTypingDone,
          })
      )}
    </>
  );
};

export default TypistLoop;
