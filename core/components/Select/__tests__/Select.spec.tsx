import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { Select } from '..';

it('names both a visible-label and a compact dropdown', () => {
  const props = {
    items: [{ value: 'box', label: 'Box' }],
    value: 'box',
    onChange: vi.fn(),
  };

  render(
    <>
      <Select {...props} label="Shape" size="md" />
      <Select {...props} label="Pattern" />
    </>
  );

  expect(screen.getByRole('combobox', { name: 'Shape' })).toHaveTextContent(
    'Box'
  );
  expect(screen.getByRole('combobox', { name: 'Pattern' })).toHaveTextContent(
    'Box'
  );
  expect(screen.queryByText('Pattern')).not.toBeInTheDocument();
});
