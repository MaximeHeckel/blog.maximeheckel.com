import { cleanup, render } from '@testing-library/react';
import React from 'react';
import Pill from '../';
import { PillVariant } from '../constants';

afterEach(() => {
  cleanup();
});

describe('Pill', () => {
  it('Renders the Pill component with the info variant', () => {
    const { getByText, asFragment } = render(
      <Pill variant={PillVariant.INFO}>test</Pill>
    );
    expect(getByText('test')).toBeDefined();
    expect(asFragment()).toMatchSnapshot();
  });

  it('Renders the Pill component with the success variant', () => {
    const { getByText, asFragment } = render(
      <Pill variant={PillVariant.SUCCESS}>test</Pill>
    );
    expect(getByText('test')).toBeDefined();
    expect(asFragment()).toMatchSnapshot();
  });

  it('Renders the Pill component with the danger variant', () => {
    const { getByText, asFragment } = render(
      <Pill variant={PillVariant.DANGER}>test</Pill>
    );
    expect(getByText('test')).toBeDefined();
    expect(asFragment()).toMatchSnapshot();
  });

  it('Renders the Pill component with the warning variant', () => {
    const { getByText, asFragment } = render(
      <Pill variant={PillVariant.WARNING}>test</Pill>
    );
    expect(getByText('test')).toBeDefined();
    expect(asFragment()).toMatchSnapshot();
  });
});
