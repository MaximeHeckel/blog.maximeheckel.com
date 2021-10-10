import { render } from '@testing-library/react';
import React from 'react';
import Button from '../';

describe('Button', () => {
  it('renders a basic button', () => {
    const { container, getByText } = render(
      <Button variant="primary">Test</Button>
    );
    expect(container.querySelector('button')).toBeInTheDocument();
    expect(container.querySelector('button')).toMatchSnapshot();
    expect(getByText('Test')).toBeInTheDocument();
  });

  it('renders a button with a startIcon', () => {
    const { container, getByTestId, getByText } = render(
      <Button variant="primary" startIcon={<svg data-testid="icon"></svg>}>
        Test
      </Button>
    );
    expect(container.querySelector('button')).toBeInTheDocument();
    expect(container.querySelector('button')).toMatchSnapshot();
    expect(getByTestId('icon')).toBeInTheDocument();
    expect(getByText('Test')).toBeInTheDocument();
  });

  it('renders a button with an endIcon', () => {
    const { container, getByTestId, getByText } = render(
      <Button variant="primary" endIcon={<svg data-testid="icon"></svg>}>
        Test
      </Button>
    );
    expect(container.querySelector('button')).toBeInTheDocument();
    expect(container.querySelector('button')).toMatchSnapshot();
    expect(getByTestId('icon')).toBeInTheDocument();
    expect(getByText('Test')).toBeInTheDocument();
  });

  it('renders an icon button', () => {
    const { container, getByTestId, debug } = render(
      <Button variant="icon" icon={<svg data-testid="icon"></svg>} />
    );
    expect(container.querySelector('button')).toBeInTheDocument();
    expect(container.querySelector('button')).toMatchSnapshot();
    expect(getByTestId('icon')).toBeInTheDocument();
  });
});
