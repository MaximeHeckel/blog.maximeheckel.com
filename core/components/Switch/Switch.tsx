import Flex from '../Flex';
import Label from '../Label';
import { StyledSwitch } from './Styles';
import { SwitchProps } from './types';

const Switch = (props: SwitchProps) => {
  const { toggled, id, label, ...rest } = props;

  return (
    <Flex gap={8}>
      <StyledSwitch
        className="switch"
        id={id}
        type="checkbox"
        checked={toggled}
        aria-checked={toggled}
        role="switch"
        {...rest}
      />
      {label ? <Label htmlFor={id}>{label}</Label> : null}
    </Flex>
  );
};

export default Switch;
