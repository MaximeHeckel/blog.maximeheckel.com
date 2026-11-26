import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { imageConfigDefault } from 'next/dist/shared/lib/image-config';
import { ImageConfigContext } from 'next/dist/shared/lib/image-config-context.shared-runtime';
import { afterEach, expect, it, vi } from 'vitest';

import Fullbleed from '@core/components/Fullbleed';

import Image from '..';

afterEach(cleanup);

const imageProps = {
  src: 'blog/motion-mask.png',
  alt: 'Frame differencing diagram',
  width: 663,
  height: 355,
};

const renderImage = (children: React.ReactNode) =>
  render(
    <ImageConfigContext.Provider
      value={{ ...imageConfigDefault, qualities: [25, 50, 75, 90, 100] }}
    >
      {children}
    </ImageConfigContext.Provider>
  );

it('sizes inline images to the article column and keeps captions and lazy loading', () => {
  renderImage(<Image {...imageProps} />);
  const image = screen.getByRole('img');

  expect(image).toHaveAttribute('sizes', 'min(663px, calc(100vw - 32px))');
  expect(image).toHaveAttribute('loading', 'lazy');
  expect(image.getAttribute('srcset')).toContain('q=90');
  expect(image.getAttribute('srcset')).not.toContain('q=100');
  expect(
    screen.getByRole('figure').querySelector('figcaption')
  ).toHaveTextContent(imageProps.alt);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it.each([
  [undefined, undefined, 80, 1000],
  [55, 900, 55, 900],
])(
  'uses the enclosing fullbleed width and cap (%s, %s)',
  (widthPercent, maxWidth, expectedPercent, expectedMax) => {
    renderImage(
      <Fullbleed widthPercent={widthPercent} maxWidth={maxWidth}>
        <Image {...imageProps} />
      </Fullbleed>
    );

    expect(screen.getByRole('img')).toHaveAttribute(
      'sizes',
      `(max-width: 850px) min(663px, calc(100vw - 32px)), max(700px, min(${expectedPercent}vw, ${expectedMax}px))`
    );
  }
);

it('respects explicit sizes and quality for an image with a custom layout', () => {
  renderImage(<Image {...imageProps} sizes="50vw" quality={100} />);
  const image = screen.getByRole('img');

  expect(image).toHaveAttribute('sizes', '50vw');
  expect(image.getAttribute('srcset')).toContain('q=100');
});

it('requests a sharp viewport-fitted image only when opening the lightbox', async () => {
  const onLoad = vi.fn();
  renderImage(<Image {...imageProps} onLoad={onLoad} />);
  const inlineImage = screen.getByRole('img');
  const inlineSrc =
    'https://assets.maximeheckel.com/images/blog/motion-mask.png?w=1080&q=90';
  Object.defineProperty(inlineImage, 'currentSrc', { value: inlineSrc });
  await act(async () => {
    fireEvent.load(inlineImage);
  });
  const trigger = screen.getByRole('button', { name: imageProps.alt });
  trigger.focus();
  fireEvent.click(trigger);

  const dialog = await screen.findByRole('dialog');
  const expandedImage = within(dialog).getByRole('img', {
    name: imageProps.alt,
  });
  expect(expandedImage).toHaveAttribute(
    'sizes',
    `min(97dvw, ${90 * (663 / 355)}dvh)`
  );
  expect(expandedImage).toHaveAttribute('loading', 'eager');
  expect(expandedImage.getAttribute('srcset')).toContain('q=100');
  expect(
    screen.getAllByRole('img', { name: imageProps.alt, hidden: true })
  ).toHaveLength(2);
  expect(expandedImage.parentElement?.style.backgroundImage).toContain(
    inlineSrc
  );

  await act(async () => {
    fireEvent.load(expandedImage);
  });
  expect(expandedImage.parentElement?.style.backgroundImage).toBe('');
  expect(onLoad).toHaveBeenCalledTimes(2);

  fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(dialog).toHaveAttribute('data-closed');
});

it('fits a static portrait to the viewport height and preserves a quality override', async () => {
  renderImage(
    <Image
      src={{ src: '/portrait.png', width: 600, height: 1200 }}
      alt="Portrait"
      quality={75}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Portrait' }));
  const dialog = await screen.findByRole('dialog');
  const image = within(dialog).getByRole('img', { name: 'Portrait' });

  expect(image).toHaveAttribute('sizes', 'min(97dvw, 45dvh)');
  expect(image.getAttribute('srcset')).toContain('q=75');
  fireEvent.keyDown(dialog, { key: 'Escape' });
  expect(dialog).toHaveAttribute('data-closed');
});
