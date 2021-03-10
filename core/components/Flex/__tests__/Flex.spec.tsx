import { cleanup, render } from '@testing-library/react';
import React from 'react';
import Flex from '../';

describe('Flex', () => {
  beforeEach(cleanup);

  it('renders Flex with justifyContent prop', () => {
    const component = render(<Flex justifyContent="center">Test</Flex>);
    expect(component.baseElement).toMatchSnapshot();
  });

  it('renders Flex with direction prop', () => {
    const component = render(<Flex direction="column">Test</Flex>);
    expect(component.baseElement).toMatchSnapshot();
  });

  it('renders Flex with wrap prop', () => {
    const component = render(<Flex wrap="wrap">Test</Flex>);
    expect(component.baseElement).toMatchSnapshot();
  });
});
