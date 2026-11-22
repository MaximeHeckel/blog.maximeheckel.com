import React from 'react';

import Box from '../Box';
import Label from '../Label';
import { StyledInput, StyledInputWrapper } from './TextInput.styles';
import { TextInputProps } from './TextInput.types';
import { AtSignIcon, EyeIcon, Tick } from './TextInputIcons';
import { validateEmail } from './utils';

const TextInput = (props: TextInputProps) => {
  const {
    id,
    disabled,
    label,
    type = 'text',
    placeholder,
    value,
    ...rest
  } = props;

  const [showPassword, setShowPassword] = React.useState(false);
  const isValid = React.useMemo(() => validateEmail(value || ''), [value]);

  const computedType = React.useCallback(() => {
    if (type === 'password' && showPassword) {
      return 'text';
    }
    return type;
  }, [showPassword, type]);

  return (
    <StyledInputWrapper className={isValid ? 'valid' : ''} variant={type}>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <Box css={{ position: 'relative' }}>
        <StyledInput
          id={id}
          className={isValid ? 'valid' : ''}
          disabled={disabled}
          // TODO cleanup variants: variants != types
          variant={computedType()}
          type={computedType()}
          placeholder={placeholder}
          value={value}
          {...rest}
        />
        {type === 'email' && (
          <>
            <AtSignIcon />
            <Tick />
          </>
        )}
        {type === 'password' && (
          <>
            <button
              aria-label="Reveal Password"
              className={showPassword ? 'clicked' : ''}
              data-testid="reveal-password-button"
              disabled={disabled}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              <EyeIcon />
            </button>
          </>
        )}
      </Box>
    </StyledInputWrapper>
  );
};

export default TextInput;
