import { readdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

import { createJiti } from 'jiti';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Use the image processor already installed by Next.js.
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve('next/package.json'))('sharp');
const jiti = createJiti(import.meta.url, { jsx: { runtime: 'automatic' } });
const { default: Logo } = await jiti.import('../core/components/Logo/Logo.tsx');
const output = new URL('../public/static/', import.meta.url);
const renderLogo = (size, stroke) =>
  renderToStaticMarkup(createElement(Logo, { size, stroke }));

for (const size of [16, 32, 96, 128, 196]) {
  for (const [suffix, stroke] of [
    ['', '#ffffff'],
    ['-light', '#111111'],
  ]) {
    await sharp(Buffer.from(renderLogo(size, stroke)))
      .resize(size, size, { fit: 'contain', background: '#00000000' })
      .png({ compressionLevel: 9 })
      .toFile(
        new URL(`favicons/favicon-${size}x${size}${suffix}.png`, output)
          .pathname
      );
  }
}

// Retain all existing platform sizes, with an opaque field for home-screen tiles.
const icons = (await readdir(new URL('favicons/', output))).filter((name) =>
  /^(apple-touch-icon-|android-chrome-|mstile-).*\.png$/.test(name)
);
icons.push('apple-touch-icon.png', 'icon.png');

for (const name of icons) {
  const dimensions = name.match(/(\d+)x(\d+)/);
  const width = dimensions
    ? Number(dimensions[1])
    : name === 'icon.png'
      ? 600
      : 180;
  const height = dimensions ? Number(dimensions[2]) : width;
  const logo = Buffer.from(
    renderLogo(Math.round(Math.min(width, height) * 0.72), '#ffffff')
  );

  await sharp({ create: { width, height, channels: 4, background: '#000000' } })
    .composite([{ input: logo, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toFile(new URL(`favicons/${name}`, output).pathname);
}

const favicon = renderLogo(44, '#111111').replace(
  '</svg>',
  '<style>@media(prefers-color-scheme:dark){path[stroke="#111111"]{stroke:#fff}}</style></svg>'
);
await writeFile(new URL('favicons/favicon.svg', output), favicon);

await sharp({
  create: { width: 2400, height: 1260, channels: 4, background: '#000000' },
})
  .composite([
    { input: Buffer.from(renderLogo(225, '#ffffff')), gravity: 'centre' },
  ])
  .png({ compressionLevel: 9 })
  .toFile(new URL('og/main-og-image.png', output).pathname);
