import { cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';
import { WebmentionCount } from '../WebmentionCount';

beforeEach(() => {
  global.fetch = jest.fn().mockImplementation(() => {
    const p = new Promise((resolve, reject) => {
      resolve({
        count: 100,
        type: {
          like: 50,
          repost: 25,
          reply: 25,
        },
      });
    });

    return p;
  });
});

afterEach(() => {
  cleanup();
});

describe('Webmention', () => {
  it('renders the webmention counts', async () => {
    const { getByTestId } = render(<WebmentionCount target="foo.com" />);

    await waitFor(() => {
      expect(getByTestId('likes')).toBeDefined();
      expect(getByTestId('replies')).toBeDefined();
      expect(getByTestId('reposts')).toBeDefined();
      expect(getByTestId('likes')).toHaveTextContent('50 Likes •');
      expect(getByTestId('replies')).toHaveTextContent('25 Replies •');
      expect(getByTestId('reposts')).toHaveTextContent('25 Reposts');
    });
  });
});
