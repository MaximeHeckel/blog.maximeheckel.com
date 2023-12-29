import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import SearchBox from '..';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next-mdx-remote/serialize', () => ({
  serialize: jest.fn(() => Promise.resolve()),
}));

window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('SearchBox', () => {
  it('Renders the SearchBox component properly', () => {
    const { getByTestId, container } = render(
      <SearchBox open onClose={jest.fn} />
    );

    expect(container.querySelector('input[name="search"]')).toBeDefined();
    expect(getByTestId('navigation')).toBeDefined();
    expect(getByTestId('design')).toBeDefined();
    expect(getByTestId('aimode')).toBeDefined();
    expect(getByTestId('twitter-social-link')).toBeDefined();
    expect(getByTestId('maximeheckelcom-link')).toBeDefined();
    expect(getByTestId('rss-link')).toBeDefined();
    expect(getByTestId('email-link')).toBeDefined();
  });

  it('Can toggle AI mode and send a request', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    const { getByTestId } = render(<SearchBox open onClose={jest.fn} />);
    expect(getByTestId('aimode')).toBeDefined();

    act(() => {
      fireEvent.click(getByTestId('aimode-button'));
    });

    expect(getByTestId('ai-prompt-input')).toBeDefined();
    expect(getByTestId('ai-prompt-result-card')).toBeDefined();

    act(() => {
      fireEvent.change(getByTestId('ai-prompt-input'), {
        target: { value: 'test' },
      });
    });

    expect(getByTestId('ai-prompt-submit-button')).toBeDefined();

    act(() => {
      fireEvent.click(getByTestId('ai-prompt-submit-button'));
    });

    // Wait for the next tick of the event loop to allow the component to handle the API call
    await Promise.resolve();

    // Verify that fetch was called with the expected URL
    expect(fetch).toHaveBeenCalledWith('/api/semanticsearch/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'test', mock: false }),
      signal: expect.anything(),
    });
  });

  it('Can toggle AI mode off by pressing escape', () => {
    const { queryByTestId, getByTestId } = render(
      <SearchBox open onClose={jest.fn} />
    );
    expect(getByTestId('aimode')).toBeDefined();

    act(() => {
      fireEvent.click(getByTestId('aimode-button'));
    });

    expect(getByTestId('ai-prompt-input')).toBeDefined();

    act(() => {
      fireEvent.keyDown(getByTestId('ai-prompt-input'), { key: 'Escape' });
    });

    expect(getByTestId('aimode')).toBeDefined();
    expect(queryByTestId('ai-prompt-input')).toBeNull();
  });
});
