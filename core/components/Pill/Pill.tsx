import { useTheme } from '@theme/context/ThemeContext';
import { PillProps } from './types';
import { StyledPill } from './Styles';

const Pill = (props: PillProps) => {
  const theme = useTheme();
  const { children, variant } = props;
  return (
    <StyledPill {...props} dark={theme.dark} variant={variant}>
      {children}
    </StyledPill>
  );
};

export default Pill;
