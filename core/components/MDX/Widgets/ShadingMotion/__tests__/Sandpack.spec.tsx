import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import ShadingMotionSandpack from '../Sandpack';

const state = vi.hoisted(() => ({
  near: false,
  visible: false,
  editorLoads: vi.fn(),
  asciiLoads: vi.fn(),
  blobLoads: vi.fn(),
  unrelatedLoads: vi.fn(),
}));

vi.mock('motion/react', () => ({
  useInView: (_ref: unknown, options?: { once?: boolean }) =>
    options?.once ? state.near : state.visible,
}));
vi.mock('@core/hooks/useGPUTier', () => ({
  default: () => ({ tier: 3, loading: false }),
}));
vi.mock('@core/components/Code/Sandpack', async () => {
  state.editorLoads();
  const { useState } = await import('react');
  return {
    default: function Editor({
      previewActive,
      files,
    }: {
      previewActive: boolean;
      files: Record<string, string>;
    }) {
      const [code, setCode] = useState(files['/App.js']);
      return (
        <>
          <textarea
            aria-label="Example code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
          {previewActive ? <div title="Preview" /> : null}
        </>
      );
    },
  };
});
vi.mock('../asciiMotionMaskScene', () => {
  state.asciiLoads();
  return { default: { '/App.js': 'ASCII example' } };
});
vi.mock('../blobTrackingScene', () => {
  state.blobLoads();
  return { default: { '/App.js': 'Blob example' } };
});
vi.mock('../blobTrackingEffectsScene', () => {
  state.unrelatedLoads();
  return { default: {} };
});
vi.mock('../blobTrackingSegmentsScene', () => {
  state.unrelatedLoads();
  return { default: {} };
});
vi.mock('../objectSmearScene', () => {
  state.unrelatedLoads();
  return { default: {} };
});
vi.mock('../opticalFlowScene', () => {
  state.unrelatedLoads();
  return { default: {} };
});
vi.mock('../velocityMapScene', () => {
  state.unrelatedLoads();
  return { default: {} };
});

afterEach(cleanup);

it('loads only the approached example and keeps its editor mounted after leaving the viewport', async () => {
  const { rerender } = render(
    <ShadingMotionSandpack scene="asciiMotionMask" />
  );
  expect(state.editorLoads).not.toHaveBeenCalled();
  expect(state.asciiLoads).not.toHaveBeenCalled();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

  state.near = true;
  await act(async () =>
    rerender(<ShadingMotionSandpack scene="asciiMotionMask" />)
  );
  const editor = await screen.findByRole('textbox', { name: 'Example code' });
  expect(editor).toHaveValue('ASCII example');
  fireEvent.change(editor, { target: { value: '// my edit' } });
  expect(state.editorLoads).toHaveBeenCalledTimes(1);
  expect(state.asciiLoads).toHaveBeenCalledTimes(1);
  expect(state.blobLoads).not.toHaveBeenCalled();
  expect(state.unrelatedLoads).not.toHaveBeenCalled();
  expect(screen.queryByTitle('Preview')).not.toBeInTheDocument();

  state.visible = true;
  rerender(<ShadingMotionSandpack scene="asciiMotionMask" />);
  expect(screen.getByTitle('Preview')).toBeInTheDocument();
  state.visible = false;
  rerender(<ShadingMotionSandpack scene="asciiMotionMask" />);
  expect(screen.getByRole('textbox')).toBe(editor);
  expect(editor).toHaveValue('// my edit');
  expect(screen.queryByTitle('Preview')).not.toBeInTheDocument();
  state.visible = true;
  rerender(<ShadingMotionSandpack scene="asciiMotionMask" />);
  expect(screen.getByRole('textbox')).toBe(editor);
  expect(editor).toHaveValue('// my edit');

  await act(async () =>
    rerender(<ShadingMotionSandpack scene="blobTracking" />)
  );
  expect(await screen.findByRole('textbox')).toHaveValue('Blob example');
  expect(state.blobLoads).toHaveBeenCalledTimes(1);
  expect(state.unrelatedLoads).not.toHaveBeenCalled();
});
