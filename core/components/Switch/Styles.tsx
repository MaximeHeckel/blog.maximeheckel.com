import styled from '@emotion/styled';

export const StyledSwitch = styled('input')`
  -webkit-appearance: none;
  -moz-appearance: none;

  flex-shrink: 0;

  height: 24px;
  width: 44px;

  outline: none;
  display: inline-block;
  position: relative;
  margin: 0;
  cursor: pointer;

  border-radius: 11px;
  border: 1px solid var(--border-color, var(--maximeheckel-form-input-border));
  background: var(--background, var(--maximeheckel-form-input-background));
  transition: background 0.3s, border-color 0.3s, box-shadow 0.2s;

  &:after {
    content: '';
    display: block;
    position: absolute;

    left: 2px;
    top: 2px;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    background: var(--ab, var(--maximeheckel-form-input-border));

    transition: transform var(--d-t, 0.3s) var(--d-t-e, ease),
      opacity var(--d-o, 0.2s);
    transform: translateX(var(--x, 0));
  }

  &:checked {
    --background: var(--maximeheckel-form-input-active);
    --border-color: var(--maximeheckel-form-input-active);
    --d-o: 0.3s;
    --d-t: 0.6s;
    --d-t-e: cubic-bezier(0.2, 0.85, 0.32, 1.2);
    --ab: #ffffff;
    --x: 20px;
  }

  &:disabled {
    --background: var(--maximeheckel-form-input-disabled);
    cursor: not-allowed;
    opacity: 0.9;
    &:checked {
      --border-color: var(--maximeheckel-form-input-border);
    }
    & + label {
      cursor: not-allowed;
    }
    &:not(:checked) {
      &:after {
        opacity: 0.6;
      }
    }
  }
  &:hover {
    &:not(:checked) {
      &:not(:disabled) {
        --border-color: var(--maximeheckel-form-input-active);
      }
    }
  }
  &:focus {
    box-shadow: 0 0 0 2px var(--maximeheckel-form-input-focus);
  }
`;
