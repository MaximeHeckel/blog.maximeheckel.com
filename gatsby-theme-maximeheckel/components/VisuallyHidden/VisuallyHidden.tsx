import { css } from '@emotion/react';
import React from 'react';

interface Props {
  as: React.ElementType;
  children?: React.ReactNode;
  id?: string;
}

const VisuallyHidden = ({ as: Component, ...props }: Props) => (
  <Component
    {...props}
    css={css`
      border: 0 !important;
      clip: rect(1px, 1px, 1px, 1px) !important;
      -webkit-clip-path: inset(50%) !important;
      clip-path: inset(50%) !important;
      height: 1px !important;
      margin: -1px !important;
      overflow: hidden !important;
      padding: 0 !important;
      position: absolute !important;
      width: 1px !important;
      white-space: nowrap !important;
    `}
  >
    {props.children}
  </Component>
);

export { VisuallyHidden };
