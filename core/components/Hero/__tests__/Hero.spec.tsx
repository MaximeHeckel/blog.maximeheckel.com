import { cleanup, render } from '@testing-library/react';
import React from 'react';
import Hero from '../';

describe('Hero', () => {
  afterEach(cleanup);
  it('can render a full Hero', () => {
    const { queryByTestId } = render(
      <Hero>
        <Hero.Title>Test title</Hero.Title>
        <Hero.Subtitle>Test subtitle</Hero.Subtitle>
        <Hero.Info>Test Info</Hero.Info>
      </Hero>
    );
    expect(queryByTestId('hero')).toBeDefined();
  });
});
