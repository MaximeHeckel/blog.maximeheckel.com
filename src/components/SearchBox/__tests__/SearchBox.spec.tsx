import { ThemeProvider } from 'emotion-theming';
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import theme from '../../../utils/theme_mock';
import SearchBox from '../';

afterEach(() => {
  cleanup();
});

jest.mock('gatsby-theme-maximeheckel/src/utils/styled', () => {
  const styled = require('@emotion/styled');
  return styled;
});

jest.mock('gatsby-theme-maximeheckel/src/context/ThemeContext', () => {
  return {
    useTheme: () => ({
      dark: true,
    }),
  };
});

jest.mock('gatsby-theme-maximeheckel/src/components/Logo', () => {
  return {
    __esModule: true,
    // eslint-disable-next-line react/display-name
    default: () => {
      return <div></div>;
    },
  };
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
