import styled from '@emotion/styled';
import { IconButtonVariant, MainButtonVariant } from './types';

export const StyledButton = styled('button')<{
  variant: MainButtonVariant;
}>`
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;

  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  display: flex;
  justify-content: center;
  flex-shrink: 0;
  outline: none;
  cursor: pointer;
  border: 0;

  /* Constant properties */
  font-size: 16px;
  font-weight: 500;
  height: 44px;
  width: max-content;
  padding: 11px 16px;
  transition: background 0.2s, transform 0.2s, color 0.2s, box-shadow 0.3s;
  border-radius: var(--border-radius-1);

  /* Computed properties */
  background: var(--background, white);
  color: var(--color, black);
  transform: scale(var(--button-scale, 1)) translateZ(0);
  box-shadow: var(--shadow, none);
  opacity: var(--opacity, 1);

  /* Local variables */
  --shadow-hover-primary: 0 2px 40px -4px var(--maximeheckel-form-input-focus);

  &:active {
    --button-scale: 0.95;
  }

  &:disabled {
    cursor: not-allowed;
  }

  ${(p) => {
    switch (p.variant) {
      case 'primary':
        return `
  --background: var(--maximeheckel-colors-brand);
  --color: hsl(var(--palette-gray-00));

  &:disabled {
    --background: var(--maximeheckel-form-input-disabled);
    --color: var(--maximeheckel-colors-typeface-tertiary);
  }

  &:hover {
    &:not(:disabled) {
      --shadow: var(--shadow-hover-primary);
    }
  }

  &:focus-visible {
    --shadow: var(--shadow-hover-primary);
  }
        `;
      case 'secondary':
        return `
  --color: var(--maximeheckel-colors-brand);
  --background: var(--maximeheckel-colors-emphasis);

  &:disabled {
    --background: var(--maximeheckel-form-input-disabled);
    --color: var(--maximeheckel-colors-typeface-tertiary);
  }

  &:hover {
    &:not(:disabled) {
       --shadow: var(--shadow-hover-primary);
    }
  }

  &:focus-visible {
     --shadow: var(--shadow-hover-primary);
  }
        `;
    }
  }}
`;

export const StyledIconButton = styled('button')<{
  variant: IconButtonVariant;
}>`
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;

  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  display: flex;
  justify-content: center;
  align-items: center;
  outline: none;
  cursor: pointer;
  border: 0;

  /* Constant properties */
  width: 44px;
  height: 44px;
  background: transparent;
  transition: color 0.3s ease, transform 0.3s ease;
  border-radius: var(--border-radius-1);

  /* Computed properties */
  color: var(--color, var(--maximeheckel-colors-typeface-secondary));
  transform: scale(var(--button-content-scale, 1)) translateZ(0);

  /* Local variables */
  --shadow-hover-primary: 0 2px 40px -2px var(--maximeheckel-form-input-focus);

  &::after {
    z-index: 0;
    position: absolute;
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 12px;
    transition: box-shadow 0.3s ease, border-color 0.2s, background 0.3s ease,
      transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

    background: var(--background, var(--maximeheckel-colors-foreground));
    transform: scale(var(--button-background-scale, 1)) translateZ(0);
    border: 2px solid var(--border-color, var(--maximeheckel-colors-foreground));
    border-radius: var(--corner, var(--border-radius-1));
    box-shadow: var(--shadow, none);
  }

  &:disabled {
    cursor: not-allowed;
    --background: var(--maximeheckel-form-input-disabled);
    --color: var(--maximeheckel-colors-typeface-tertiary);
  }

  &:hover {
    &:not(:disabled) {
      --border-color: var(--maximeheckel-colors-brand);
      --color: var(--maximeheckel-colors-brand);
      --corner: calc(var(--border-radius-1) + 2px);
      --button-background-scale: 0.92;
      --shadow: var(--shadow-hover-primary);
    }
  }

  &:focus-visible {
    &:not(:disabled) {
      --border-color: var(--maximeheckel-colors-brand);
      --color: var(--maximeheckel-colors-brand);
      --corner: calc(var(--border-radius-1) + 2px);
      --button-background-scale: 0.92;
      --shadow: var(--shadow-hover-primary);
    }
  }

  &:active {
    --button-content-scale: 0.95;
  }
`;
