import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import CopyToClipboardButton from '../CopyToClipboardButton';

const markdown =
  '---\ntitle: Example\n---\n\n# Article\n\n```tsx\n<Widget />\n```\n';
const execCommandDescriptor = Object.getOwnPropertyDescriptor(
  document,
  'execCommand'
);

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (execCommandDescriptor) {
    Object.defineProperty(document, 'execCommand', execCommandDescriptor);
  } else {
    Reflect.deleteProperty(document, 'execCommand');
  }
});

it('copies the exact raw Markdown with the Clipboard API', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('navigator', { clipboard: { writeText } });
  render(
    <CopyToClipboardButton
      text={markdown}
      label="Copy Markdown to clipboard"
      variant="secondary"
      size="large"
    />
  );

  fireEvent.click(
    screen.getByRole('button', { name: 'Copy Markdown to clipboard' })
  );

  await waitFor(() => expect(writeText).toHaveBeenCalledWith(markdown));
  expect(document.querySelector('textarea')).toBeNull();
});

it('falls back to copying the complete source when clipboard access is denied', async () => {
  vi.stubGlobal('navigator', {
    clipboard: {
      writeText: vi.fn().mockRejectedValue(new Error('Permission denied')),
    },
  });
  const execCommand = vi.fn(() => {
    expect(document.querySelector('textarea')?.value).toBe(markdown);
    return true;
  });
  Object.defineProperty(document, 'execCommand', {
    configurable: true,
    value: execCommand,
  });
  render(<CopyToClipboardButton text={markdown} />);

  fireEvent.click(
    screen.getByRole('button', { name: 'Copy code to clipboard' })
  );

  await waitFor(() => expect(execCommand).toHaveBeenCalledWith('copy'));
  expect(document.querySelector('textarea')).toBeNull();
});
