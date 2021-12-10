import { cleanup, render } from '@testing-library/react';
import React from 'react';
import Pill from '../';

afterEach(() => {
  cleanup();
});

describe('Pill', () => {
  it('Renders the Pill component with the info variant', () => {
    const { getByText, asFragment } = render(<Pill variant="info">test</Pill>);
    expect(getByText('test')).toBeDefined();
    expect(asFragment()).toMatchSnapshot();
  });

  it('Renders the Pill component with the success variant', () => {
    const { getByText, asFragment } = render(
      <Pill variant="success">test</Pill>
    );
    expect(getByText('test')).toBeDefined();
    expect(asFragment()).toMatchSnapshot();
  });

  it('Renders the Pill component with the danger variant', () => {
    const { getByText, asFragment } = render(
      <Pill variant="danger">test</Pill>
    );
    expect(getByText('test')).toBeDefined();
    expect(asFragment()).toMatchSnapshot();
  });

  it('Renders the Pill component with the warning variant', () => {
    const { getByText, asFragment } = render(
      <Pill variant="warning">test</Pill>
    );
    expect(getByText('test')).toBeDefined();
    expect(asFragment()).toMatchSnapshot();
  });
});
