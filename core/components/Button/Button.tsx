import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import React from 'react';
interface ButtonProps {
  primary?: boolean;
  secondary?: boolean;
  tertiary?: boolean;
  white?: boolean;
  danger?: boolean;
  vercel?: boolean;
  disabled?: boolean;
  children: ReactNode;
  onClick?: () => any;
}

const StyledButton = styled(motion.button)<ButtonProps>`
  height: 48px;
  margin: 0;
  border: none;
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  position: relative;
  font-weight: 600;
  font-size: 18px;
  padding: 0 30px;
  border-radius: var(--border-radius-1);

  &:focus:not(:focus-visible) {
    outline: 0;
  }

  &:focus-visible {
    outline: 2px solid var(--maximeheckel-colors-brand);
    background-color: var(--maximeheckel-colors-foreground);
  }

  ${(p) =>
    p.primary
      ? `
      background-color: var(--maximeheckel-colors-brand);
      color: hsla(var(--palette-gray-00), 100%);
      min-width: 150px;

  ${
    p.danger
      ? `
        background-color: var(--maximeheckel-colors-danger);
            `
      : ''
  }
  
  ${
    p.vercel
      ? `
          display: flex;
          align-item: center;
          color: var(--maximeheckel-colors-body);
          background-color: var(--maximeheckel-colors-typeface-0);
        `
      : ''
  }

  ${
    p.disabled
      ? `
      cursor: not-allowed;
      opacity: 0.5;
      background-color: var(--maximeheckel-colors-typeface-1);
      color: #000000;
      &:hover {
        transform: none;
      }
        `
      : ''
  }
  
      `
      : ''};

  ${(p) =>
    p.secondary
      ? `
      background-color: transparent;
      color: var(--maximeheckel-colors-brand);
      border: 2px solid var(--maximeheckel-colors-brand);
      min-width: 150px;

  ${
    p.danger
      ? `
          color: var(--maximeheckel-colors-danger);
          border-color: var(--maximeheckel-colors-danger);
        `
      : ''
  }

  ${
    p.disabled
      ? `
      cursor: not-allowed;
      opacity: 0.5;
      color: var(--maximeheckel-colors-typeface-1);
      border-color: var(--maximeheckel-colors-typeface-1);
      &:hover {
        transform: none;
      }
        `
      : ''
  }

      `
      : ''};

  ${(p) =>
    p.tertiary
      ? `
      background-color: transparent;
      color: var(--maximeheckel-colors-brand);
      min-width: inherited;
      padding: 0px;

      ::after {
        content: '';
        display: block;
        position: absolute;
        top: 96%;
        left: 0;
        right: 0;
        height: 2px;
        background-color: var(--maximeheckel-colors-brand);
        transform: scaleX(0);
        transition: transform 0.25s ease-in;
        transform-origin: right center;
        text-decoration: none;
      }
    
      &:hover::after {
        transform: scale(1);
        transform-origin: left center;
      }

      ${
        p.danger
          ? `
              color: var(--maximeheckel-colors-danger);
              ::after { 
                background-color: var(--maximeheckel-colors-danger);
              }
            `
          : ''
      }

      ${
        p.disabled
          ? `
              opacity: 0.5;
              cursor: not-allowed;
              color: var(--maximeheckel-colors-typeface-1);
              ::after { 
                background-color: var(--maximeheckel-colors-typeface-1);
              }
            `
          : ''
      }
          `
      : ''};
`;

const Button = React.forwardRef(
  ({ children, ...props }: ButtonProps, ref: React.Ref<HTMLButtonElement>) => {
    return (
      <StyledButton
        whileHover={props.tertiary ? {} : { scale: 1.075 }}
        transition={{ type: 'spring' }}
        ref={ref}
        {...props}
      >
        {props.vercel ? (
          <img
            style={{
              marginBottom: '0px',
              marginRight: '8px',
            }}
            alt="Vercel logo"
            src="https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png"
            height="30"
          />
        ) : null}
        {children}
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';

export { Button };
