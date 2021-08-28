import preloadAll from 'jest-next-dynamic';
import { render } from '@testing-library/react';
import React from 'react';
import Card from '../';

beforeAll(async () => {
  await preloadAll();
});

describe('Card', () => {
  it('renders a Card', () => {
    const { getByTestId, getByText } = render(
      <Card data-testid="test-card">
        <Card.Body>Basic Card</Card.Body>
      </Card>
    );

    expect(getByTestId('test-card')).toBeInTheDocument();
    expect(getByText('Basic Card')).toBeInTheDocument();
  });

  it('renders a basic Card with a title', () => {
    const { getByTestId, getByText } = render(
      <Card data-testid="test-card" title="Title Card">
        <Card.Body>Basic Card</Card.Body>
      </Card>
    );

    expect(getByTestId('test-card')).toBeInTheDocument();
    expect(getByText('Basic Card')).toBeInTheDocument();
    expect(getByText('Title Card')).toBeInTheDocument();
  });

  it('renders a Card with a Card.Header', () => {
    const { getByTestId, getByText } = render(
      <Card data-testid="test-card">
        <Card.Header>Title Card in Header</Card.Header>
        <Card.Body>Basic Card</Card.Body>
      </Card>
    );

    expect(getByTestId('test-card')).toBeInTheDocument();
    expect(getByText('Basic Card')).toBeInTheDocument();
    expect(getByText('Title Card in Header')).toBeInTheDocument();
  });

  it('renders a Card with a Card.Header even if a title is specified', () => {
    const { getByTestId, getByText, queryByText } = render(
      <Card data-testid="test-card" title="FooBar">
        <Card.Header>Title Card in Header</Card.Header>
        <Card.Body>Basic Card</Card.Body>
      </Card>
    );

    expect(getByTestId('test-card')).toBeInTheDocument();
    expect(getByText('Basic Card')).toBeInTheDocument();
    expect(getByText('Title Card in Header')).toBeInTheDocument();
    expect(queryByText('FooBar')).not.toBeInTheDocument();
  });

  it('renders a Card without a Card.Body', () => {
    const { getByTestId, getByText, queryByText } = render(
      <Card data-testid="test-card">No Body!</Card>
    );

    expect(getByTestId('test-card')).toBeInTheDocument();
    expect(getByText('No Body!')).toBeInTheDocument();
  });
});
