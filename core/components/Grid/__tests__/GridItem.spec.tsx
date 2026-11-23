import { render, screen } from '@testing-library/react';
import { css } from 'styled-system/css';
import { expect, it } from 'vitest';

import Grid from '..';

it('provides placement defaults that responsive styles can override', () => {
  const overrides = {
    '@media (min-width: 640px)': { gridColumn: '3' },
  };

  render(
    <Grid.Item col={2} rowSpan={2} css={overrides}>
      Grid cell
    </Grid.Item>
  );

  const cell = screen.getByText('Grid cell');
  expect(cell.style.gridColumn).toBe('');
  expect(cell.style.getPropertyValue('--grid-item-column')).toBe('2');
  expect(cell.style.getPropertyValue('--grid-item-row')).toBe('span 2/span 2');
  expect(cell).toHaveClass(
    ...css({
      gridColumn: 'var(--grid-item-column)',
      gridRow: 'var(--grid-item-row)',
      ...overrides,
    }).split(' ')
  );
});
