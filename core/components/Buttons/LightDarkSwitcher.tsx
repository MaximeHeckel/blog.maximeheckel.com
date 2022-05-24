import { useTheme, Button, Tooltip } from '@maximeheckel/design-system';
import { motion, useMotionValue, useTransform } from 'framer-motion';

const LightDarkSwitcher = () => {
  const theme = useTheme();
  const duration = 0.7;

  const moonVariants = {
    checked: {
      scale: 1,
    },
    unchecked: {
      scale: 0,
    },
  };

  const sunVariants = {
    checked: {
      scale: 0,
    },
    unchecked: {
      scale: 1,
    },
  };

  const isChecked = theme.dark;

  const scaleMoon = useMotionValue(isChecked ? 1 : 0);
  const scaleSun = useMotionValue(isChecked ? 0 : 1);
  const pathLengthMoon = useTransform(scaleMoon, [0.6, 1], [0, 1]);
  const pathLengthSun = useTransform(scaleSun, [0.6, 1], [0, 1]);

  return (
    <Tooltip
      id="lightDarkSwitcherTooltip"
      content={theme.dark ? 'Activate light mode' : 'Activate dark mode'}
      visuallyHiddenText="Toggles between light and dark mode."
    >
      <Button
        as={motion.button}
        variant="icon"
        data-testid="darkmode-switch"
        aria-describedby="lightDarkSwitcherTooltip"
        onClick={theme.toggleDark}
        // aria-label={theme.dark ? 'Activate light mode' : 'Activate dark mode'}
        title="Theme toggle"
        initial={false}
        data-theme={isChecked ? 'dark' : 'light'}
        animate={isChecked ? 'checked' : 'unchecked'}
        transition={{ duration }}
        icon={
          <motion.svg
            width="28"
            height="28"
            viewBox="0 0 25 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.path
              d="M12.4058 17.7625C15.1672 17.7625 17.4058 15.5239 17.4058 12.7625C17.4058 10.0011 15.1672 7.76251 12.4058 7.76251C9.64434 7.76251 7.40576 10.0011 7.40576 12.7625C7.40576 15.5239 9.64434 17.7625 12.4058 17.7625Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={sunVariants}
              custom={isChecked}
              transition={{ duration }}
              style={{
                pathLength: pathLengthSun,
                scale: scaleSun,
              }}
            />
            <motion.path
              d="M12.4058 1.76251V3.76251"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={sunVariants}
              custom={isChecked}
              transition={{ duration }}
              style={{
                pathLength: pathLengthSun,
                scale: scaleSun,
              }}
            />
            <motion.path
              d="M12.4058 21.7625V23.7625"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={sunVariants}
              custom={isChecked}
              transition={{ duration }}
              style={{
                pathLength: pathLengthSun,
                scale: scaleSun,
              }}
            />
            <motion.path
              d="M4.62598 4.98248L6.04598 6.40248"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={sunVariants}
              custom={isChecked}
              transition={{ duration }}
              style={{
                pathLength: pathLengthSun,
                scale: scaleSun,
              }}
            />
            <motion.path
              d="M18.7656 19.1225L20.1856 20.5425"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={sunVariants}
              custom={isChecked}
              transition={{ duration }}
              style={{
                pathLength: pathLengthSun,
                scale: scaleSun,
              }}
            />
            <motion.path
              d="M1.40576 12.7625H3.40576"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={sunVariants}
              custom={isChecked}
              transition={{ duration }}
              style={{
                pathLength: pathLengthSun,
                scale: scaleSun,
              }}
            />
            <motion.path
              d="M21.4058 12.7625H23.4058"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={sunVariants}
              custom={isChecked}
              transition={{ duration }}
              style={{
                pathLength: pathLengthSun,
                scale: scaleSun,
              }}
            />
            <motion.path
              d="M4.62598 20.5425L6.04598 19.1225"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={sunVariants}
              custom={isChecked}
              transition={{ duration }}
              style={{
                pathLength: pathLengthSun,
                scale: scaleSun,
              }}
            />
            <motion.path
              d="M18.7656 6.40248L20.1856 4.98248"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={sunVariants}
              custom={isChecked}
              transition={{ duration }}
              style={{
                pathLength: pathLengthSun,
                scale: scaleSun,
              }}
            />
            <motion.path
              d="M21.1918 13.2013C21.0345 14.9035 20.3957 16.5257 19.35 17.8781C18.3044 19.2305 16.8953 20.2571 15.2875 20.8379C13.6797 21.4186 11.9398 21.5294 10.2713 21.1574C8.60281 20.7854 7.07479 19.9459 5.86602 18.7371C4.65725 17.5283 3.81774 16.0003 3.4457 14.3318C3.07367 12.6633 3.18451 10.9234 3.76526 9.31561C4.346 7.70783 5.37263 6.29868 6.72501 5.25307C8.07739 4.20746 9.69959 3.56862 11.4018 3.41132C10.4052 4.75958 9.92564 6.42077 10.0503 8.09273C10.175 9.76469 10.8957 11.3364 12.0812 12.5219C13.2667 13.7075 14.8384 14.4281 16.5104 14.5528C18.1823 14.6775 19.8435 14.1979 21.1918 13.2013Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              transition={{ duration }}
              variants={moonVariants}
              custom={isChecked}
              style={{
                pathLength: pathLengthMoon,
                scale: scaleMoon,
              }}
            />
          </motion.svg>
        }
      />
    </Tooltip>
  );
};

export default LightDarkSwitcher;
