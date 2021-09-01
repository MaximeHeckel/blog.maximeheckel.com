import styled from '@emotion/styled';

export const StyledCheckbox = styled('input')`
  -webkit-appearance: none;
  -moz-appearance: none;

  flex-shrink: 0;

  height: 24px;
  width: 24px;

  outline: none;
  display: inline-block;
  position: relative;
  margin: 0;
  cursor: pointer;

  border-radius: var(--border-radius-1);
  border: 1px solid var(--border-color, var(--maximeheckel-form-input-border));
  background: var(--background, var(--maximeheckel-form-input-background));
  transition: background 0.3s, border-color 0.3s, box-shadow 0.2s;

  &:after {
    content: '';
    display: block;
    left: 0;
    top: 0;
    position: absolute;
    opacity: var(--opacity, 0);
    transition: transform var(--d-t, 0.3s) var(--d-t-e, ease) var(--d-t-d, 0s),
      opacity var(--d-o, 0.2s);
    width: 6px;
    height: 10px;
    border: 2px solid var(--maximeheckel-form-input-background);
    border-top: 0;
    border-left: 0;
    left: 8px;
    top: 5px;
    transform: rotate(var(--rotation, 20deg));

    &:disabled {
      border: 2px solid var(--maximeheckel-form-input-disabled-inner);
    }
  }

  &:checked {
    --background: var(--maximeheckel-form-input-active);
    --border-color: var(--maximeheckel-form-input-active);
    --d-o: 0.3s;
    --d-t: 0.6s;
    --d-t-e: cubic-bezier(0.2, 0.85, 0.32, 1.2);
    --d-t-d: 0.1s;
    --opacity: 1;
    --rotation: 43deg;
  }

  &:disabled {
    --background: var(--maximeheckel-form-input-disabled);
    cursor: not-allowed;
    opacity: 0.8;
    &:checked {
      --border-color: var(--maximeheckel-form-input-border);
    }
    & + label {
      cursor: not-allowed;
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
