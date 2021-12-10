import Flex from '../Flex';
import Label from '../Label';
import { StyledCheckbox } from './Styles';
import { CheckboxProps } from './types';

const Checkbox = (props: CheckboxProps) => {
  const { checked, disabled, id, label, ...rest } = props;
  return (
    <Flex
      css={{
        gap: '8px',
      }}
    >
      <StyledCheckbox
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-checked={checked}
        role="checkbox"
        {...rest}
      />
      {label ? <Label htmlFor={id}>{label}</Label> : null}
    </Flex>
  );
};

export default Checkbox;
