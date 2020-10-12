import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const MiniButton = styled(motion.div)`
  display: flex;
  align-items: center;
  height: 50px;
  border-radius: 50px;
  box-shadow: 3px 5px 8px 1px rgba(0, 0, 0, 0.2), inset 0px -1px 1px 0px #0c77e3,
    inset 0px 1px 4px 0px #5abff8;
`;

const Text = styled('p')<{ text: string }>`
  @media (max-width: 700px) {
    font-size: 12px;
  }

  height: 100%;
  display: flex;
  align-items: center;
  margin: ${p => (p.text.length > 0 ? '0 8px' : 0)};
  font-size: 16px;
  font-weight: 500;
  color: white;
`;

const Window = styled('div')`
  max-width: 700px;
  width: 100%;
  height: 150px;
  margin: 0 auto 60px auto;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SearchIcon = (props: { style: object }) => (
  <svg
    style={{ ...props.style }}
    width="41"
    height="41"
    viewBox="0 0 41 41"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20.5557 40.4728C31.4541 40.4728 40.4775 31.4493 40.4775 20.5509C40.4775 9.672 31.4346 0.629028 20.5361 0.629028C9.65723 0.629028 0.633789 9.672 0.633789 20.5509C0.633789 31.4493 9.67676 40.4728 20.5557 40.4728ZM11.0049 18.3829C11.0049 14.2618 14.3838 10.8829 18.5244 10.8829C22.665 10.8829 26.0244 14.2618 26.0244 18.3829C26.0244 20.004 25.5166 21.4884 24.6377 22.6993L29.5205 27.5822C29.7939 27.8556 29.9697 28.2267 29.9697 28.5978C29.9697 29.4181 29.4229 29.9845 28.6416 29.9845C28.1924 29.9845 27.8408 29.8478 27.4697 29.4767L22.6455 24.6525C21.4541 25.4337 20.0479 25.9025 18.5244 25.9025C14.3838 25.9025 11.0049 22.5236 11.0049 18.3829ZM13.1729 18.3829C13.1729 21.3126 15.5947 23.7345 18.5244 23.7345C21.4346 23.7345 23.8369 21.3126 23.8369 18.3829C23.8369 15.4923 21.4346 13.0704 18.5244 13.0704C15.5947 13.0704 13.1729 15.4923 13.1729 18.3829Z"
      fill="white"
    />
  </svg>
);

const TypingText = () => {
  let i = React.useRef(0);
  const [typedText, setTypedText] = React.useState('');
  const textToType = 'gatsby seo missing meta tags 😱 💥 📉'; /* The text */
  const speed = 50;

  const type = React.useCallback(() => {
    if (i.current < textToType.length) {
      setTypedText(prevState => `${prevState}${textToType.charAt(i.current)}`);
      i.current++;
      setTimeout(type, speed);
    }
  }, []);

  React.useEffect(() => {
    setTimeout(() => type(), 2200);
  }, [type]);

  return <Text text={typedText}>{typedText}</Text>;
};

const SEOAnimation = () => {
  const [ref, inView] = useInView();

  return (
    <Window ref={ref}>
      {inView ? (
        <MiniButton
          initial={{
            width: '50px',
          }}
          animate={{
            width: '450px',
            marginLeft: '8px',
          }}
          transition={{
            duration: 1,
            ease: 'easeInOut',
            delay: 1,
          }}
          style={{
            background: '#336ef5',
          }}
        >
          <SearchIcon
            style={{
              marginLeft: '4px',
            }}
          />
          <TypingText />
        </MiniButton>
      ) : null}
    </Window>
  );
};

export { SEOAnimation };
