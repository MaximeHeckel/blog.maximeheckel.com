import { cleanup, render } from '@testing-library/react';
import React from 'react';
import Button from '../';

describe('Button', () => {
  beforeEach(cleanup);

  it('renders the primary button', () => {
    const component = render(<Button primary={true}>Test</Button>);
    expect(component.baseElement).toMatchSnapshot();
  });

  it('renders the secondary button', () => {
    const component = render(<Button secondary={true}>Test</Button>);
    expect(component.baseElement).toMatchSnapshot();
  });

  it('renders the tertiary button', () => {
    const component = render(<Button tertiary={true}>Test</Button>);
    expect(component.baseElement).toMatchSnapshot();
  });
});
