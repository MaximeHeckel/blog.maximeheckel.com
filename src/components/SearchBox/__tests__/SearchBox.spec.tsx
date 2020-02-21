import { ThemeProvider } from 'emotion-theming';
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import theme from '../../../utils/theme_mock';
import SearchBox from '../';

afterEach(() => {
  cleanup();
});

describe('SearchBox', () => {
  it('Renders the SearchBox component properly', () => {
    const location = { search: '' };

    const { container } = render(
      <ThemeProvider theme={theme}>
        <SearchBox location={location} showOverride={true} />
      </ThemeProvider>
    );

    expect(container.querySelector('input[name="search"]')).toBeDefined();
    expect(
      container.querySelector('li[data-testid="portfolio-link"]')
    ).toBeDefined();
    expect(
      container.querySelector('li[data-testid="twitter-link"]')
    ).toBeDefined();
  });
});
