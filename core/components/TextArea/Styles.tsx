import styled from '@emotion/styled';
import { StyledTextAreaProps } from './types';

export const StyledTextArea = styled('textarea')<StyledTextAreaProps>`
  position: relative;
  width: 100%;
  -webkit-appearance: none;
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
  transition: border-color 0.3s, box-shadow 0.3s;

  resize: ${(p) => p.resize};

  &::placeholder {
    color: var(--maximeheckel-colors-typeface-tertiary);
    opacity: 0.5;
  }

  &::-webkit-autofill {
    background: transparent;
  }

  &:disabled {
    --background: var(--maximeheckel-form-input-disabled);
    cursor: not-allowed;
    opacity: 0.8;
    & + label {
      cursor: not-allowed;
    }
  }

  &:hover {
    &:not(:disabled) {
      --border-color: var(--maximeheckel-form-input-active);
    }
  }

  &:focus {
    --border-color: var(--maximeheckel-form-input-active);
  }
`;
