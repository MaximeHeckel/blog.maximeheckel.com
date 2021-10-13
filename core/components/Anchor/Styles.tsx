import styled from '@emotion/styled';
import { ArrowPosition } from './types';

export const StyledAnchor = styled('a')<{
  arrow?: ArrowPosition;
  discreet?: boolean;
  favicon?: boolean;
  icon: string | null;
  underline?: boolean;
}>`
  --hover-color: var(--maximeheckel-colors-typeface-primary);

  font-size: inherit;
  line-height: inherit;
  color: var(--color, var(--maximeheckel-colors-brand));
  font-weight: 500;
  word-break: break-word;
  text-decoration: none;
  outline: none;
  transition: border-color 0.3s ease, color 0.3s ease;

  &:focus {
    --color: var(--hover-color, var(--maximeheckel-colors-brand));
    --hover-translation-distance: var(--arrow-translation, 0);
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      --color: var(--hover-color, var(--maximeheckel-colors-brand));
      --hover-translation-distance: var(--arrow-translation, 0);
    }
  }

  ${(p) =>
    p.discreet &&
    `
        --color: var(--maximeheckel-colors-typeface-tertiary);
    `}

  ${(p) => {
    if (p.arrow) {
      switch (p.arrow) {
        case 'left':
          return `
            --size: 1.1em;
            --arrow-direction: -1;
            --arrow-translation: -0.25em;
            --icon: url(${p.icon});
            --hover-color: unset;
    
            &:before {
                content: '';
                display: inline-block;
                vertical-align: middle;
                width: var(--size, 1.05em);
                height: var(--size, 1.05em);
                mask: var(--icon) no-repeat;
                background-color: currentColor;
                margin-right: 0.18em;
                transition: transform 0.4s ease;
                transform: translateY(-2px) translateX(var(--hover-translation-distance, 0px)) scaleX(var(--arrow-direction, 1));
            }
          `;
        case 'right':
          return `
            --size: 1.1em;
            --arrow-translation: 0.25em;
            --arrow-direction: 1;
            --icon: url(${p.icon});
            --hover-color: unset;
    
            &:after {
                content: '';
                display: inline-block;
                 vertical-align: middle;
                width: var(--size, 1.05em);
                height: var(--size, 1.05em);
                mask: var(--icon) no-repeat;
                background-color: currentColor;
    
                margin-left: 0.18em;
                transition: transform 0.4s ease;
                transform: translateY(-2px) translateX(var(--hover-translation-distance, 0px)) scaleX(var(--arrow-direction, 1));
            }
          `;
      }
    }

    if (p.favicon) {
      return `
        --size: 1.1em;
        --icon: url(${p.icon});

        &:before {
        content: '';
        display: inline-block;
        vertical-align: middle;
        width: var(--size, 1.05em);
        height: var(--size, 1.05em);
        mask: var(--icon) no-repeat;
        background-color: currentColor;
        margin-right: 0.18em;
        transform: translateY(-2px);
        }
    `;
    }

    if (p.underline) {
      return `
        border-bottom: 2px solid;
        border-color: var(--border-color, transparent);

        --hover-color: unset;

        &:focus {
          --border-color: hsl(var(--palette-blue-40));
        }

        @media (hover: hover) and (pointer: fine) {
          &:hover {
            --border-color: hsl(var(--palette-blue-40));
          }
        }
    `;
    }
  }}
`;
