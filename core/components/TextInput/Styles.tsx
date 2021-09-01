import styled from '@emotion/styled';
import { TextInputTypes } from './types';

export const StyledInput = styled('input')`
  position: relative;
  width: 100%;
  -webkit-appearance: none;
  outline: none;
  display: block;
  font-size: 16px;
  font-family: inherit;
  margin: 0;
  padding: ${(p) =>
    p.type === 'email' ? '8px 16px 8px 40px' : '8px 40px 8px 16px'};
  line-height: 26px;
  border-radius: var(--border-radius-1);
  color: var(--maximeheckel-colors-typeface-primary);
  border: 1px solid var(--border-color, var(--maximeheckel-form-input-border));
  background: var(--background, var(--maximeheckel-form-input-background));
  transition: border-color 0.3s, box-shadow 0.3s;
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
`;

export const StyledInputWrapper = styled('div')<{ type: TextInputTypes }>`
  display: inline-block;
  position: relative;
  width: 100%;

  svg {
    display: block;
    position: absolute;
    fill: none;
    stroke: var(--icon-color, var(--maximeheckel-form-input-border));
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.6;
    transition: stroke 0.3s;
  }

  &:hover {
    input {
      &:not(:disabled) {
        --border-color: var(--maximeheckel-form-input-active);
        & + svg {
          --icon-color: var(--maximeheckel-form-input-active);
        }

        & + button {
          svg {
            --icon-color: var(--maximeheckel-form-input-active);
          }
        }
      }
    }
  }

  &:focus-within {
    --border-color: var(--maximeheckel-form-input-active);
    --icon-color: var(--maximeheckel-form-input-active);
  }

  input {
    &:not(:placeholder-shown) {
      &:not(:disabled) {
        &:not(:focus) {
          & + svg {
            --icon-color: var(--maximeheckel-form-input-active);
          }

          & + button {
            svg {
              --icon-color: var(--maximeheckel-form-input-active);
            }
          }
        }
      }
    }
  }

  ${(p) =>
    p.type === 'email' &&
    `
svg {
  top: 12px;
  left: 12px;
}

&.valid {
  --at-sign: 150;
  --at-sign-delay: 0s;
  --tick: 0;
  --tick-delay: 0.5s;
  --icon-color: var(--maximeheckel-form-input-active);
}


`}

  ${(p) =>
    p.type === 'password' &&
    `
  button {
    position: absolute;
    -webkit-appearance: none;
    height: 22px;
    width: 22px;
    top: 12px;
    right: 14px;
    background: none;
    border: none;
    cursor: pointer;
    border-radius: 50%;
    outline: none;
    transition: box-shadow 0.2s;
    padding: 0px;

    &:focus-visible {
      box-shadow: 0 0 0 2px var(--maximeheckel-form-input-focus);
    }

    &:disabled {
      cursor: not-allowed;
    }

    svg {
      position: initial;
    }

    &.clicked {
      --eye: 0;
      --eye-delay: 0s;
      --strike: 24;
      --strike-delay: 0s;
    }
  }
  `}
`;
