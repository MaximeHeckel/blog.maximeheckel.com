import { render } from '@testing-library/react';
import React from 'react';
import SearchBox from '..';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('SearchBox', () => {
  it('Renders the SearchBox component properly', () => {
    const { container } = render(<SearchBox onClose={jest.fn} />);

    expect(container.querySelector('input[name="search"]')).toBeDefined();
    expect(
      container.querySelector('li[data-testid="portfolio-link"]')
    ).toBeDefined();
    expect(
      container.querySelector('li[data-testid="twitter-link"]')
    ).toBeDefined();
  });
});
