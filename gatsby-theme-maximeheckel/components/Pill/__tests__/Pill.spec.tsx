import { cleanup, render } from '@testing-library/react';
import React from 'react';
import Pill from '../';

afterEach(() => {
  cleanup();
});

describe('Pill', () => {
  it('Renders the pill component properly', () => {
    const { getByText, asFragment } = render(<Pill color="blue" text="test" />);
    expect(getByText('test')).toBeDefined();
    expect(asFragment()).toMatchSnapshot();
  });
});
