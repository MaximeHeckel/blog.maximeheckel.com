import 'jest-dom/extend-expect';
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import Printer from '../';

afterEach(() => {
  cleanup();
});

describe('Printer', () => {
  it('Renders the Printer component with the proper title', () => {
    const { asFragment, container } = render(<Printer title="my post" />);
    expect(asFragment()).toMatchSnapshot();
    expect(container.querySelector('h1')).toHaveTextContent('my post');
  });
});
