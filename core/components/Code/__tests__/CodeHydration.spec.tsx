import { act } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expect, it, vi } from 'vitest';

import Code from '../';

it('renders an MDX code block on the server and hydrates it without replacing it', async () => {
  const element = (
    <section>
      <Code>
        <code className="language-tsx">
          {'const scenePass = pass(scene, camera);'}
        </code>
      </Code>
      {'\n'}
      <p>After the code block</p>
    </section>
  );
  const container = document.createElement('div');
  container.innerHTML = renderToString(element);
  const serverCard = container.querySelector('[data-code-block]');
  expect(serverCard).not.toBeNull();
  document.body.appendChild(container);
  const onRecoverableError = vi.fn();
  const root = hydrateRoot(container, element, { onRecoverableError });
  try {
    await act(async () => {});
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.querySelector('[data-code-block]')).toBe(serverCard);
    expect(container.textContent).toContain(
      'const scenePass = pass(scene, camera);'
    );
  } finally {
    await act(async () => root.unmount());
    container.remove();
  }
});
