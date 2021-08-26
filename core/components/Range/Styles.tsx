import styled from '@emotion/styled';

export const StyledRange = styled('input')<{ fill: string }>`
  -webkit-appearance: none;
  -moz-appearance: none;

  flex-shrink: 0;

  outline: none;
  display: inline;
  position: relative;
  margin: 0;

  width: 100%;

  background: transparent;

  &::-moz-range-track {
    -moz-appearance: none;
    width: 100%;
    height: 4px;
    opacity: var(--opacity, 1);
    border: none;
    border-radius: var(--border-radius-0);
    background: ${(p) => p.fill || 'transparent'};
    transition: box-shadow 0.2s;
  }

  &::-webkit-slider-runnable-track {
    -webkit-appearance: none;
    width: 100%;
    height: 4px;
    opacity: var(--opacity, 1);
    border: none;
    border-radius: var(--border-radius-0);
    background: ${(p) => p.fill || 'transparent'};
    transition: box-shadow 0.2s;
  }

  &::-moz-range-thumb {
    -moz-appearance: none;
    border: none;
    height: 24px;
    width: 24px;
    border-radius: 50%;
    background: var(--maximeheckel-form-input-background);
    border: 1px solid var(--border-color, var(--maximeheckel-form-input-border));
    margin-top: -10px;
    cursor: grab;
    box-shadow: var(--maximeheckel-shadow-2);
    transition: background 0.3s, border-color 0.3s;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    border: none;
    height: 24px;
    width: 24px;
    border-radius: 50%;
    background: var(--maximeheckel-form-input-background);
    border: 1px solid var(--border-color, var(--maximeheckel-form-input-border));
    margin-top: -10px;
    cursor: grab;
    box-shadow: var(--maximeheckel-shadow-2);
    transition: background 0.3s, border-color 0.3s;
  }

  &:active {
    &::-moz-range-thumb {
      cursor: grabbing;
    }
    &::-webkit-slider-thumb {
      cursor: grabbing;
    }
  }

  &:disabled {
    &::-moz-range-thumb {
      cursor: not-allowed;
    }
    &::-webkit-slider-thumb {
      cursor: not-allowed;
    }
  }

  &:hover {
    &:not(:disabled) {
      &::-moz-range-thumb {
        --border-color: var(--maximeheckel-form-input-active);
      }

      &::-webkit-slider-thumb {
        --border-color: var(--maximeheckel-form-input-active);
      }
    }
  }

  &:focus {
    &::-moz-range-track {
      box-shadow: 0 0 0 2px var(--maximeheckel-form-input-focus);
    }

    &::-webkit-slider-runnable-track {
      box-shadow: 0 0 0 2px var(--maximeheckel-form-input-focus);
    }
  }

  & + label {
    font-size: 16px;
    display: inline-block;
    cursor: pointer;
    color: var(--maximeheckel-colors-typeface-secondary);
    font-weight: 500;
    margin-right: 8px;
    vertical-align: top;
  }
`;
