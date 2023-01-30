import { ThemeContext, Tooltip } from '@maximeheckel/design-system';
import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import Header from '../';

describe('Header', () => {
  it('renders the header without the site title or the post title or theme switcher', async () => {
    const { queryByTestId, debug } = render(
      <ThemeContext.Provider value={{ dark: false, toggleDark: () => null }}>
        <Tooltip.Provider>
          <Header />
        </Tooltip.Provider>
      </ThemeContext.Provider>
    );

    expect(queryByTestId('header-title')).toBeNull();
    await waitFor(() => {
      expect(queryByTestId('darkmode-switch')).toBeInTheDocument();
    });
  });

  it('renders the header with a title', async () => {
    const { getByTestId, queryByTestId } = render(
      <ThemeContext.Provider value={{ dark: false, toggleDark: () => null }}>
        <Tooltip.Provider>
          <Header title="Maxime Heckel" />
        </Tooltip.Provider>
      </ThemeContext.Provider>
    );
    expect(queryByTestId('header-title')).toBeInTheDocument();
    expect(queryByTestId('header-title')).toHaveTextContent('Maxime Heckel');
    await waitFor(() => {
      expect(getByTestId('darkmode-switch')).toBeInTheDocument();
    });
  });

  it('clicking on the theme switcher calls the toggle dark function', async () => {
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

    await waitFor(() => {
      expect(getByTestId('darkmode-switch')).toBeInTheDocument();
    });
    fireEvent.click(getByTestId('darkmode-switch'));
    expect(mockToggleDark).toHaveBeenCalled();
  });
});
