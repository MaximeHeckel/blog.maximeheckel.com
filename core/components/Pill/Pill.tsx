import React from 'react';
import styled from '@emotion/styled';
import { useTheme } from '@theme/context/ThemeContext';
import { PillVariant } from './constants';
import { PillProps } from './types';

const PillWrapper = styled('span')<PillProps & { dark: boolean }>`
  font-size: 14px;
  border-radius: var(--border-radius-1);
  height: 28px;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  padding: 5px 8px 5px 8px !important;
  min-width: 40px;
  font-weight: 500;
  cursor: default;
  user-select: none;

  ${(p) =>
    p.dark
      ? `
    ${
      p.variant === PillVariant.INFO
        ? `
          background: var(--maximeheckel-colors-emphasis);
          color: var(--maximeheckel-colors-brand);`
        : ''
    }
  
    ${
      p.variant === PillVariant.SUCCESS
        ? `
          background: var(--maximeheckel-colors-success-emphasis);
          color: var(--maximeheckel-colors-success);`
        : ''
    }
  
    ${
      p.variant === PillVariant.WARNING
        ? `
          background: var(--maximeheckel-colors-warning-emphasis);
          color: var(--maximeheckel-colors-warning);`
        : ''
    }
  
    ${
      p.variant === PillVariant.DANGER
        ? `
          background: var(--maximeheckel-colors-danger-emphasis);
          color: var(--maximeheckel-colors-danger);`
        : ''
    }
    `
      : `
      ${
        p.variant === PillVariant.INFO
          ? `
            background: var(--maximeheckel-colors-emphasis);
            color: var(--maximeheckel-colors-brand);`
          : ''
      }
    
      ${
        p.variant === PillVariant.SUCCESS
          ? `
            background: var(--maximeheckel-colors-success-emphasis);
            color: hsl(var(--palette-green-80));`
          : ''
      }
    
      ${
        p.variant === PillVariant.WARNING
          ? `
            background: var(--maximeheckel-colors-warning-emphasis);
            color: hsl(var(--palette-orange-80));`
          : ''
      }
    
      ${
        p.variant === PillVariant.DANGER
          ? `
            background: var(--maximeheckel-colors-danger-emphasis);
            color: var(--maximeheckel-colors-danger);`
          : ''
      }
      `}
`;

const Pill: React.FC<PillProps> = (props) => {
  const theme = useTheme();
  const { children, variant } = props;
  return (
    <PillWrapper {...props} dark={theme.dark} variant={variant}>
      {children}
    </PillWrapper>
  );
};

export { Pill };
