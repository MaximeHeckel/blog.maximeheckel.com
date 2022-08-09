import { ThemeContext, Tooltip } from '@maximeheckel/design-system';
import { fireEvent, render } from '@testing-library/react';
import preloadAll from 'jest-next-dynamic';
import React from 'react';
import Header from '../';

beforeAll(async () => {
  await preloadAll();
});

describe('Header', () => {
  it('renders the header without the site title or the post title or theme switcher', () => {
    const { queryByTestId } = render(
      <ThemeContext.Provider value={{ dark: false, toggleDark: () => null }}>
        <Tooltip.Provider>
          <Header />
        </Tooltip.Provider>
      </ThemeContext.Provider>
    );
    expect(queryByTestId('header-title')).toBeNull();
    expect(queryByTestId('darkmode-switch')).toBeInTheDocument();
  });

  it('renders the header with a title', () => {
    const { getByTestId, queryByTestId } = render(
      <ThemeContext.Provider value={{ dark: false, toggleDark: () => null }}>
        <Tooltip.Provider>
          <Header title="Maxime Heckel" />
        </Tooltip.Provider>
      </ThemeContext.Provider>
    );
    expect(queryByTestId('header-title')).toBeInTheDocument();
    expect(queryByTestId('header-title')).toHaveTextContent('Maxime Heckel');
    expect(getByTestId('darkmode-switch')).toBeInTheDocument();
  });

  it('clicking on the theme switcher calls the toggle dark function', () => {
    const mockToggleDark = jest.fn();

    const { getByTestId } = render(
      <ThemeContext.Provider
        value={{ dark: false, toggleDark: mockToggleDark }}
      >
        <Tooltip.Provider>
          <Header />
        </Tooltip.Provider>
      </ThemeContext.Provider>
    );
    fireEvent.click(getByTestId('darkmode-switch'));
    expect(mockToggleDark).toHaveBeenCalled();
  });
});
