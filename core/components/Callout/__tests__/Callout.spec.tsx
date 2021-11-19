import { cleanup, render } from '@testing-library/react';
import React from 'react';
import Callout from '../Callout';

describe('Callout', () => {
  afterEach(cleanup);
  it('can render a Callout with variant info', () => {
    const { container, baseElement } = render(
      <Callout variant="info">Test</Callout>
    );
    expect(
      container.querySelector('[data-variant="info"]')
    ).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(baseElement).toMatchSnapshot();
  });

  it('can render a Callout with variant danger', () => {
    const { container, baseElement } = render(
      <Callout variant="danger">Test</Callout>
    );
    expect(
      container.querySelector('[data-variant="danger"]')
    ).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(baseElement).toMatchSnapshot();
  });

  it('can render a Callout with variant info', () => {
    const { container, queryByText, baseElement } = render(
      <Callout label="Test Label" variant="info">
        Test
      </Callout>
    );
    expect(
      container.querySelector('[data-variant="info"]')
    ).toBeInTheDocument();
    expect(container.querySelector('svg')).not.toBeInTheDocument();
    expect(queryByText('Test Label')).toBeInTheDocument();
    expect(baseElement).toMatchSnapshot();
  });

  it('can render a Callout with variant danger', () => {
    const { container, queryByText, baseElement } = render(
      <Callout label="Test Label" variant="danger">
        Test
      </Callout>
    );
    expect(
      container.querySelector('[data-variant="danger"]')
    ).toBeInTheDocument();
    expect(container.querySelector('svg')).not.toBeInTheDocument();
    expect(queryByText('Test Label')).toBeInTheDocument();
    expect(baseElement).toMatchSnapshot();
  });
});
