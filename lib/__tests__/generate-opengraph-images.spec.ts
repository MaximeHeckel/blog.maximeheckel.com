import fs from 'fs';

import { afterEach, describe, expect, it, vi } from 'vitest';

import getOgImage from '../generate-opengraph-images';

afterEach(() => vi.restoreAllMocks());

describe('social image URLs', () => {
  it('returns a public URL for the branded fallback when no article image exists', async () => {
    vi.spyOn(fs, 'statSync').mockImplementation(() => {
      throw new Error('ENOENT');
    });

    expect(await getOgImage({ title: 'Missing article image' })).toBe(
      '/static/og/main-og-image.png'
    );
  });

  it('preserves an existing custom article image', async () => {
    vi.spyOn(fs, 'statSync').mockReturnValue({} as fs.Stats);

    expect(await getOgImage({ title: '' })).toBe(
      '/static/og/d41d8cd98f00b204e9800998ecf8427e.png'
    );
  });
});
