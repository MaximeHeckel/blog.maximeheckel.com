import preloadAll from 'jest-next-dynamic';
import { render } from '@testing-library/react';
import React from 'react';
import Radio from '../';

// eslint-disable-next-line no-console
const originalWarn = console.warn;
let consoleOutput = [];

beforeAll(async () => {
  await preloadAll();
});

afterEach(() => {
  consoleOutput = [];
  // eslint-disable-next-line no-console
  console.warn = originalWarn;
});

describe('Radio', () => {
  const mockedWarn = (output) => consoleOutput.push(output);
  // eslint-disable-next-line no-console
  beforeEach(() => (console.warn = mockedWarn));

  it('logs a warning if a Radio.Item component is used outside of the scope of a Radio.Group and does not render', () => {
    const { queryByRole } = render(
      <Radio.Item id="test" value="test" aria-label="test" />
    );
    expect(consoleOutput).toContain(
      'Radio.Item must be rendered within a Radio.Group component!'
    );
    expect(queryByRole('radio')).not.toBeInTheDocument();
  });

  it('logs a warning if a Radio.Item component is used outside of the scope of a Radio.Group', () => {
    const { getByRole } = render(
      <Radio.Group name="test" onChange={jest.fn}>
        <Radio.Item id="test" value="test" aria-label="test" />
      </Radio.Group>
    );
    expect(consoleOutput).toHaveLength(0);
    expect(getByRole('radiogroup')).toBeInTheDocument();
    expect(getByRole('radio')).toBeInTheDocument();
  });

  it('only renders children of type Radio.Item', () => {
    const { getByRole, queryByTestId } = render(
      <Radio.Group name="test" onChange={jest.fn}>
        <Radio.Item id="test" value="test" aria-label="test" />
        <div data-testid="random" />
      </Radio.Group>
    );
    expect(consoleOutput).toHaveLength(0);
    expect(getByRole('radiogroup')).toBeInTheDocument();
    expect(getByRole('radio')).toBeInTheDocument();
    expect(queryByTestId('random')).not.toBeInTheDocument();
  });
});
