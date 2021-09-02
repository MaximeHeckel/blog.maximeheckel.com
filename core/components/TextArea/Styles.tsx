import styled from '@emotion/styled';
import { StyledTextAreaProps } from './types';

export const StyledTextArea = styled('textarea')<StyledTextAreaProps>`
  -webkit-appearance: none;
  position: relative;
  width: 100%;
  outline: none;
  display: block;
  font-size: 16px;
  font-family: inherit;
  margin: 0;
  padding: 8px 16px;
  line-height: 26px;

  border-radius: var(--border-radius-1);
  color: var(--maximeheckel-colors-typeface-primary);
  border: 1px solid var(--border-color, var(--maximeheckel-form-input-border));
  background: var(--background, var(--maximeheckel-form-input-background));
  cursor: var(--cursor, default);
  opacity: var(--opacity, 1);
  box-shadow: var(--shadow, none);
  transition: border-color 0.3s, box-shadow 0.3s;

  --shadow-hover-primary: 0 2px 20px -2px var(--maximeheckel-form-input-focus);

  resize: ${(p) => p.resize};

  ${(p) => {
    switch (p.readOnly) {
      case true:
        return `
  --cursor: default;
      `;
      case false:
        return `
  --cursor: initial    
      `;
    }
  }}

  &::placeholder {
    color: var(--maximeheckel-colors-typeface-tertiary);
    opacity: 0.5;
  }

  &::-webkit-autofill {
    background: transparent;
  }

  &:disabled {
    --background: var(--maximeheckel-form-input-disabled);
    --cursor: not-allowed;
    --opacity: 0.65;
    & + label {
      --cursor: not-allowed;
    }
  }

  &:hover {
    &:not(:disabled) {
      --border-color: var(--maximeheckel-form-input-active);
      --shadow: var(--shadow-hover-primary);
    }
  }

  &:focus {
    --border-color: var(--maximeheckel-form-input-active);
    --shadow: var(--shadow-hover-primary);
  }
`;
