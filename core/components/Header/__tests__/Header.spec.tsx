import { ThemeContext } from '@maximeheckel/design-system';
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
        <Header />
      </ThemeContext.Provider>
    );
    expect(queryByTestId('header-title')).toBeNull();
    expect(queryByTestId('darkmode-switch')).toBeInTheDocument();
  });

  it('renders the header with a title', () => {
    const { getByTestId, queryByTestId } = render(
      <ThemeContext.Provider value={{ dark: false, toggleDark: () => null }}>
        <Header title="Maxime Heckel" />
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
        <Header />
      </ThemeContext.Provider>
    );
    fireEvent.click(getByTestId('darkmode-switch'));
    expect(mockToggleDark).toHaveBeenCalled();
  });
});
