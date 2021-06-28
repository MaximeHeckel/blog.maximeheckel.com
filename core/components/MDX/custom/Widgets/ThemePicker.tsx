import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { AnimationCard, AnimationCardContent } from './Components';

const setVariableToGlobalStyles = (variable: string, value: string) =>
  document.documentElement.style.setProperty(variable, value);

const ThemeColor = styled(motion.button)<{ hue: number; saturation: number }>`
  width: 50px;
  height: 50px;
  background: ${(p) => `hsla(${p.hue}, ${p.saturation}%, 50%, 100%)`};
  border-radius: 50px;
  box-shadow: none;
  border: none;
  cursor: pointer;
  margin-bottom: 20px;
  outline: none;
`;

const ButtonWrapper = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 25px;
  margin-bottom: 30px;
`;

const ThemePicker = () => {
  const buttonVariants = {
    hover: {
      scale: 1.2,
    },
    tap: {
      scale: 0.9,
    },
  };

  return (
    <AnimationCard>
      <AnimationCardContent>
        <div
          css={css`
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(85px, 1fr));
            grid-gap: 5px;
            margin: 0 auto;
            width: 80%;
          `}
        >
          <ButtonWrapper>
            <ThemeColor
              hue={203}
              saturation={88}
              onClick={() => {
                setVariableToGlobalStyles('--base-hue', '203');
                setVariableToGlobalStyles('--base-saturation', '88');
              }}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              transition={{
                type: 'spring',
              }}
            />
            💙
          </ButtonWrapper>
          <ButtonWrapper>
            <ThemeColor
              hue={38}
              saturation={88}
              onClick={() => {
                setVariableToGlobalStyles('--base-hue', '38');
                setVariableToGlobalStyles('--base-saturation', '88');
              }}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              transition={{
                type: 'spring',
              }}
            />
            ⭐️
          </ButtonWrapper>
          <ButtonWrapper>
            <ThemeColor
              hue={342}
              saturation={88}
              onClick={() => {
                setVariableToGlobalStyles('--base-hue', '342');
                setVariableToGlobalStyles('--base-saturation', '88');
              }}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              transition={{
                type: 'spring',
              }}
            />
            🌸
          </ButtonWrapper>
          <ButtonWrapper>
            <ThemeColor
              hue={263}
              saturation={62}
              onClick={() => {
                setVariableToGlobalStyles('--base-hue', '263');
                setVariableToGlobalStyles('--base-saturation', '62');
              }}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              transition={{
                type: 'spring',
              }}
            />
            🐙
          </ButtonWrapper>
          <ButtonWrapper>
            <ThemeColor
              hue={17}
              saturation={86}
              onClick={() => {
                setVariableToGlobalStyles('--base-hue', '17');
                setVariableToGlobalStyles('--base-saturation', '86');
              }}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              transition={{
                type: 'spring',
              }}
            />
            🔥
          </ButtonWrapper>
          <ButtonWrapper>
            <ThemeColor
              hue={147}
              saturation={87}
              onClick={() => {
                setVariableToGlobalStyles('--base-hue', '147');
                setVariableToGlobalStyles('--base-saturation', '87');
              }}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              transition={{
                type: 'spring',
              }}
            />
            🥑
          </ButtonWrapper>
        </div>
        <ButtonWrapper>
          <ThemeColor
            hue={222}
            saturation={89}
            onClick={() => {
              setVariableToGlobalStyles('--base-hue', '222');
              setVariableToGlobalStyles('--base-saturation', '89');
            }}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            transition={{
              type: 'spring',
            }}
          />
          Reset
        </ButtonWrapper>
      </AnimationCardContent>
    </AnimationCard>
  );
};

export default ThemePicker;
