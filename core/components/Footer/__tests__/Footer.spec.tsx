import { cleanup, render } from '@testing-library/react';
import React from 'react';
import Footer from '..';

describe('Footer', () => {
  beforeEach(cleanup);

  it('renders the Footer without the table of contents', () => {
    const { getByTestId } = render(<Footer />);
    expect(getByTestId('footer')).toBeDefined();
  });
});
