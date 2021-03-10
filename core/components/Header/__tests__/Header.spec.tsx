import preloadAll from 'jest-next-dynamic';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { ThemeContext } from '@theme/context/ThemeContext';
import MainHeader from '../';

beforeAll(async () => {
  await preloadAll();
});

describe('Header', () => {
  it('renders the header without the site title or the post title or theme switcher', () => {
    const { queryByTestId } = render(
      <ThemeContext.Provider value={{ dark: false, toggleDark: () => null }}>
        <MainHeader />
      </ThemeContext.Provider>
    );
    expect(queryByTestId('header-title')).toBeNull();
    expect(queryByTestId('darkmode-switch')).toBeNull();
  });

  it('renders the header with a title', () => {
    const { queryByTestId } = render(
      <ThemeContext.Provider value={{ dark: false, toggleDark: () => null }}>
        <MainHeader title="Maxime Heckel" />
      </ThemeContext.Provider>
    );
    expect(queryByTestId('header-title')).toBeDefined();
    expect(queryByTestId('darkmode-switch')).toBeNull();
  });

  it('renders the header with the theme switcher', () => {
    const { queryByTestId, getByTestId } = render(
      <ThemeContext.Provider value={{ dark: false, toggleDark: () => null }}>
        <MainHeader themeSwitcher={true} />
      </ThemeContext.Provider>
    );

    expect(queryByTestId('header-title')).toBeNull();
    expect(getByTestId('darkmode-switch')).toBeDefined();
  });

  it('clicking on the theme switcher calls the toggle dark function', () => {
    const mockToggleDark = jest.fn();

    const { getByTestId } = render(
      <ThemeContext.Provider
        value={{ dark: false, toggleDark: mockToggleDark }}
      >
        <MainHeader themeSwitcher />
      </ThemeContext.Provider>
    );
    fireEvent.click(getByTestId('darkmode-switch'));
    expect(mockToggleDark).toHaveBeenCalled();
  });
});
