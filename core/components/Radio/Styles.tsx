import styled from '@emotion/styled';

export const StyledRadio = styled('input')`
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

  border-radius: 50%;
  border: 1px solid var(--border-color, var(--maximeheckel-form-input-border));
  background: var(--background, var(--maximeheckel-form-input-background));
  box-shadow: var(--shadow, none);
  transition: background 0.3s, border-color 0.3s, box-shadow 0.2s;

  --shadow-hover-primary: 0 2px 20px 3px var(--maximeheckel-form-input-focus);

  &:after {
    content: '';
    display: block;
    left: 0;
    top: 0;
    position: absolute;
    transition: transform var(--d-t, 0.3s) var(--d-t-e, ease),
      opacity var(--d-o, 0.2s);

    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--maximeheckel-form-input-background);
    opacity: var(--opacity, 0);
    transform: scale(var(--scale, 0.7));
  }
  &:checked {
    --background: var(--maximeheckel-form-input-active);
    --border-color: var(--maximeheckel-form-input-active);
    --d-o: 0.3s;
    --d-t: 0.6s;
    --d-t-e: cubic-bezier(0.2, 0.85, 0.32, 1.2);
    --scale: 0.5;
    --opacity: 1;
  }
  &:disabled {
    --background: var(--maximeheckel-form-input-disabled);
    cursor: not-allowed;
    opacity: 0.65;
    &:checked {
      --border-color: var(--maximeheckel-form-input-border);
    }
    & + label {
      cursor: not-allowed;
    }
  }
  &:hover {
    &:not(:disabled) {
      &:not(:checked) {
        --border-color: var(--maximeheckel-form-input-active);
      }
      --shadow: var(--shadow-hover-primary);
    }
  }

  &:focus-visible {
    --border-color: var(--maximeheckel-form-input-active);
    --shadow: var(--shadow-hover-primary);
  }
`;
