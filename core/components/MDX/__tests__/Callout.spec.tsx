import { cleanup, render } from '@testing-library/react';
import React from 'react';
import Callout from '../Callout';
import { VARIANT } from '../Callout/Callout';

describe('Callout', () => {
  afterEach(cleanup);
  it('can render a Callout with variant info', () => {
    const component = render(<Callout variant={VARIANT.INFO}>Test</Callout>);
    expect(component.baseElement).toMatchSnapshot();
  });

  it('can render a Callout with variant danger', () => {
    const component = render(<Callout variant={VARIANT.DANGER}>Test</Callout>);
    expect(component.baseElement).toMatchSnapshot();
  });
});
