import { css } from '@emotion/react';
import Label from '../Label';
import { StyledTextArea } from './Styles';
import { TextAreaProps } from './types';

const TextArea = (props: TextAreaProps) => {
  const {
    id,
    disabled,
    label,
    placeholder,
    value,
    resize,
    rows = 10,
    ...rest
  } = props;

  return (
    <div>
      {label ? (
        <Label
          htmlFor={id}
          css={css`
            margin-bottom: 8px;
          `}
        >
          {label}
        </Label>
      ) : null}
      <StyledTextArea
        id={id}
        disabled={disabled}
        placeholder={placeholder}
        resize={resize}
        rows={rows}
        value={value}
        {...rest}
      />
    </div>
  );
};

export default TextArea;
