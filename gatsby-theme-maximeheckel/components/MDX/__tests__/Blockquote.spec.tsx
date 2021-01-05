import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { Blockquote } from '../Blockquote';

describe('Blockquote', () => {
  afterEach(cleanup);
  it('can render a Blockquote', () => {
    const component = render(<Blockquote>Test</Blockquote>);
    expect(component.baseElement).toMatchSnapshot();
  });
});
