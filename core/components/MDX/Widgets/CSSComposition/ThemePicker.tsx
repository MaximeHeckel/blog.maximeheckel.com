import { styled, Card, Grid, Text } from '@maximeheckel/design-system';
import { motion } from 'framer-motion';
import { AnimationCardContent } from '../Components';

const setVariableToGlobalStyles = (variable: string, value: string) =>
  document.body.style.setProperty(variable, value);

const ThemeColor = styled(motion.button, {
  width: '50px',
  height: '50px',
  background: 'hsl(var(--hue), 89%, 50%)',
  borderRadius: '50px',
  boxShadow: 'none',
  border: 'none',
  cursor: 'pointer',
  outline: 'none',
  marginBottom: `var(--space-3)`,
});

const ButtonWrapper = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  fontSize: '25px',
  marginBottom: '2.25rem',
});

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
    <Card depth={1}>
      <AnimationCardContent>
        <Grid
          gap={1}
          css={{
            margin: '0 auto',
            width: '80%',
            height: '100px',
          }}
          templateColumns="repeat(auto-fill, minmax(85px, 1fr))"
        >
          <ButtonWrapper>
            <ThemeColor
              css={{
                '--hue': 203,
                '--saturation': 88,
              }}
              onClick={() => {
                setVariableToGlobalStyles('--base-hue', '203');
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
              css={{
                '--hue': 38,
                '--saturation': 88,
              }}
              onClick={() => {
                setVariableToGlobalStyles('--base-hue', '38');
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
              css={{
                '--hue': 342,
                '--saturation': 88,
              }}
              onClick={() => {
                setVariableToGlobalStyles('--base-hue', '342');
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
              css={{
                '--hue': 263,
                '--saturation': 62,
              }}
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
              css={{
                '--hue': 17,
                '--saturation': 86,
              }}
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
              css={{
                '--hue': 147,
                '--saturation': 87,
              }}
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
        </Grid>

        <ButtonWrapper>
          <ThemeColor
            css={{
              '--hue': 222,
              '--saturation': 89,
            }}
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
          <Text size="2">Reset</Text>
        </ButtonWrapper>
      </AnimationCardContent>
    </Card>
  );
};

export default ThemePicker;
