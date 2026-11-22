import type { CSSProperties, ReactNode } from 'react';
import { styled } from 'styled-system/jsx';

const GridFrame = styled('div', {
  base: {
    display: 'grid',
    height: 'inherit',
    width: '100%',
    alignItems: 'stretch',
    gridTemplateColumns: 'var(--pilot-grid-columns)',
    gap: 'var(--space-3)',
  },
});

interface GridProps {
  children: ReactNode;
  templateColumns: string;
}

export const PilotGrid = ({ children, templateColumns }: GridProps) => {
  const style: CSSProperties & { '--pilot-grid-columns': string } = {
    '--pilot-grid-columns': templateColumns,
  };

  return <GridFrame style={style}>{children}</GridFrame>;
};
