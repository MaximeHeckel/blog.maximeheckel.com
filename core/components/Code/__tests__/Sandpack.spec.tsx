import {
  fireEvent,
  render,
  screen,
  waitFor,
  cleanup,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import Sandpack from '../Sandpack';

const previewUnmounted = vi.hoisted(() => vi.fn());
vi.mock('@core/hooks/useIsMobile', () => ({ useIsMobile: () => false }));
vi.mock('@codesandbox/sandpack-react', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@codesandbox/sandpack-react')>();
  const { useEffect } = await import('react');
  return {
    ...actual,
    SandpackCodeEditor: () => {
      const { sandpack } = actual.useSandpack();
      return (
        <textarea
          aria-label="Code"
          value={sandpack.files['/App.js'].code}
          onChange={(event) =>
            sandpack.updateFile('/App.js', event.target.value)
          }
        />
      );
    },
    SandpackPreview: ({
      children,
      style,
    }: {
      children: React.ReactNode;
      style: React.CSSProperties;
    }) => {
      useEffect(
        () => () => {
          previewUnmounted();
        },
        []
      );
      const { sandpack } = actual.useSandpack();
      return (
        <div title="Preview" style={style}>
          <span>{sandpack.status}</span>
          {children}
        </div>
      );
    },
    SandpackConsole: () => null,
  };
});
vi.mock('../components/PreviewTabs', () => ({
  default: ({
    onFullscreen,
    onTabSelect,
    onToggleCode,
  }: {
    onFullscreen: () => void;
    onTabSelect: (tab: string) => void;
    onToggleCode: () => void;
  }) => (
    <>
      <button onClick={onFullscreen}>Fullscreen</button>
      <button onClick={() => onTabSelect('console')}>Console</button>
      <button onClick={onToggleCode}>Toggle code</button>
    </>
  ),
}));

afterEach(() => {
  cleanup();
  document.body.style.overflow = '';
});

it('preserves edits, tabs and run state when the preview pauses, and keeps fullscreen active', async () => {
  const files = { '/App.js': 'export default function App() { return null; }' };
  const dependencies = { three: '0.179.0' };
  const props = {
    template: 'react' as const,
    files,
    dependencies,
    autorun: false,
  };
  const { rerender } = render(<Sandpack {...props} />);
  fireEvent.change(screen.getByRole('textbox', { name: 'Code' }), {
    target: { value: '// edited example' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Run sandbox' }));
  await waitFor(() =>
    expect(
      screen.queryByRole('button', { name: 'Run sandbox' })
    ).not.toBeInTheDocument()
  );
  fireEvent.click(screen.getByRole('button', { name: 'Console' }));
  expect(screen.getByRole('textbox')).toHaveValue('// edited example');

  rerender(<Sandpack {...props} previewActive={false} />);
  expect(screen.queryByTitle('Preview')).not.toBeInTheDocument();
  expect(previewUnmounted).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('textbox')).toHaveValue('// edited example');
  rerender(<Sandpack {...props} previewActive />);
  expect(screen.getByTitle('Preview')).toHaveStyle({ display: 'none' });
  expect(screen.getByText('running')).toBeInTheDocument();
  expect(screen.getByRole('textbox')).toHaveValue('// edited example');

  fireEvent.click(screen.getByRole('button', { name: 'Toggle code' }));
  fireEvent.click(screen.getByRole('button', { name: 'Toggle code' }));
  expect(screen.getByRole('textbox')).toHaveValue('// edited example');
  fireEvent.click(screen.getByRole('button', { name: 'Fullscreen' }));
  rerender(<Sandpack {...props} previewActive={false} />);
  expect(screen.getByTitle('Preview')).toBeInTheDocument();
  expect(document.body.style.overflow).toBe('hidden');
  fireEvent.click(screen.getByRole('button', { name: 'Fullscreen' }));
  expect(screen.queryByTitle('Preview')).not.toBeInTheDocument();
});
