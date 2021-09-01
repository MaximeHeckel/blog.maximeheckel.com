import preloadAll from 'jest-next-dynamic';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import TextInput from '../';

beforeAll(async () => {
  await preloadAll();
});

describe('TextInput', () => {
  it('renders the TextInput with type email', () => {
    const { queryByTestId } = render(
      <TextInput
        id="test"
        value="test"
        aria-label="test"
        type="email"
        onChange={() => {}}
        data-testid="test-email-input"
      />
    );

    expect(queryByTestId('test-email-input')).toBeInTheDocument();
    expect(queryByTestId('at-sign-icon')).toBeInTheDocument();
    expect(queryByTestId('tick-icon')).toBeInTheDocument();
    expect(queryByTestId('reveal-password-button')).not.toBeInTheDocument();
    expect(queryByTestId('eye-icon')).not.toBeInTheDocument();

    expect(queryByTestId('test-email-input')).toHaveAttribute('type', 'email');
  });

  it('renders the TextInput with type password', () => {
    const { queryByTestId } = render(
      <TextInput
        id="test"
        value="test"
        aria-label="test"
        type="password"
        onChange={() => {}}
        data-testid="test-password-input"
      />
    );

    expect(queryByTestId('test-password-input')).toBeInTheDocument();
    expect(queryByTestId('at-sign-icon')).not.toBeInTheDocument();
    expect(queryByTestId('tick-icon')).not.toBeInTheDocument();
    expect(queryByTestId('reveal-password-button')).toBeInTheDocument();
    expect(queryByTestId('eye-icon')).toBeInTheDocument();

    fireEvent.click(queryByTestId('reveal-password-button'));

    expect(queryByTestId('test-password-input')).toHaveAttribute(
      'type',
      'text'
    );

    fireEvent.click(queryByTestId('reveal-password-button'));

    expect(queryByTestId('test-password-input')).toHaveAttribute(
      'type',
      'password'
    );
  });

  it('renders the default TextInput', () => {
    const { queryByTestId } = render(
      <TextInput
        id="test"
        value="test"
        aria-label="test"
        onChange={() => {}}
        data-testid="test-text-input"
      />
    );

    expect(queryByTestId('test-text-input')).toBeInTheDocument();
    expect(queryByTestId('at-sign-icon')).not.toBeInTheDocument();
    expect(queryByTestId('tick-icon')).not.toBeInTheDocument();
    expect(queryByTestId('reveal-password-button')).not.toBeInTheDocument();
    expect(queryByTestId('eye-icon')).not.toBeInTheDocument();

    expect(queryByTestId('test-text-input')).toHaveAttribute('type', 'text');
  });
});
