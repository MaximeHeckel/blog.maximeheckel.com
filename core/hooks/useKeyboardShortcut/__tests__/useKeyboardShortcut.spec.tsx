import userEvent from '@testing-library/user-event';
import { renderHook } from '@testing-library/react-hooks';
import useKeyboardShortcut from '../useKeyboardShortcut';

describe('useKeyboardShortcut', () => {
  it('triggers the callback when a simple key is pressed', () => {
    const callback = jest.fn();
    renderHook(() => useKeyboardShortcut('c', callback));

    userEvent.keyboard('c');

    expect(callback).toHaveBeenCalled();
  });

  it('triggers the callback when a key combination is pressed', () => {
    const callback = jest.fn();
    renderHook(() => useKeyboardShortcut('ctrl+c', callback));

    userEvent.keyboard('{ctrl>}c');

    expect(callback).toHaveBeenCalled();
  });

  it('triggers the callback when one of the keys is pressed', () => {
    const callback = jest.fn();
    renderHook(() => useKeyboardShortcut('ctrl+c|m', callback));

    userEvent.keyboard('{ctrl>}c');

    expect(callback).toHaveBeenCalled();

    userEvent.keyboard('m');

    expect(callback).toHaveBeenCalled();
  });

  it('triggers the callback when a key combination is pressed with a specific separator', () => {
    const callback = jest.fn();
    renderHook(() =>
      useKeyboardShortcut('ctrl*c', callback, { separator: '*' })
    );

    userEvent.keyboard('{ctrl>}c');

    expect(callback).toHaveBeenCalled();
  });

  it('triggers the callback when one of the keys is pressed with a specific OR separator', () => {
    const callback = jest.fn();
    renderHook(() =>
      useKeyboardShortcut('ctrl+c$m', callback, { orSeparator: '$' })
    );

    userEvent.keyboard('{ctrl>}c');

    expect(callback).toHaveBeenCalled();

    userEvent.keyboard('m');

    expect(callback).toHaveBeenCalled();
  });
});
