import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
  within,
} from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Slideshow, { SlideshowProps, useAutoPlay } from '..';

const preferences = vi.hoisted(() => ({ reducedMotion: false, inView: true }));

vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('motion/react')>()),
  useReducedMotion: () => preferences.reducedMotion,
  useInView: () => preferences.inView,
}));

const images = [
  'one.jpg',
  'two.jpg',
  'three.jpg',
  'four.jpg',
  'five.jpg',
  'six.jpg',
  'seven.jpg',
];
const selected = (name: string) =>
  expect(screen.getByRole('tab', { name, selected: true })).toHaveAttribute(
    'tabindex',
    '-1'
  );

beforeEach(() => {
  preferences.reducedMotion = false;
  preferences.inView = true;
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it('hydrates autoplay without changing the server-rendered markup', async () => {
  const slideshow = <Slideshow images={images} autoPlay loop />;
  const container = document.createElement('div');
  container.innerHTML = renderToString(slideshow);
  document.body.appendChild(container);
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});

  try {
    await act(async () => {
      render(slideshow, { container, hydrate: true });
    });

    expect(error).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: 'Pause slideshow' })
    ).toBeInTheDocument();
  } finally {
    error.mockRestore();
  }
});

it.each<{
  label: string;
  props: Partial<SlideshowProps>;
  expected: 'slide' | 'fade';
}>([
  { label: 'manual horizontal', props: {}, expected: 'slide' },
  {
    label: 'manual vertical',
    props: { orientation: 'vertical' },
    expected: 'slide',
  },
  { label: 'autoplay horizontal', props: { autoPlay: true }, expected: 'fade' },
  {
    label: 'autoplay vertical',
    props: { autoPlay: true, orientation: 'vertical' },
    expected: 'fade',
  },
  {
    label: 'autoplay slide override',
    props: { autoPlay: true, transition: 'slide' },
    expected: 'slide',
  },
  {
    label: 'autoplay vertical slide override',
    props: { autoPlay: true, orientation: 'vertical', transition: 'slide' },
    expected: 'slide',
  },
  {
    label: 'manual fade override',
    props: { transition: 'fade' },
    expected: 'fade',
  },
])(
  'uses the expected transition and axis for $label',
  ({ props, expected }) => {
    render(<Slideshow images={images.slice(0, 3)} {...props} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Step 2' }));

    const panel = screen.getByRole('tabpanel');
    const track = panel.parentElement;
    expect(panel).toHaveAttribute('data-transition', expected);

    if (expected === 'fade') {
      expect(track?.style.transform).toBe('');
      expect(panel.style.transform).toBe('');
    } else if (props.orientation === 'vertical') {
      expect(track?.style.transform).toBe('');
      expect(panel.style.transform).toBe('translateY(0%)');
      expect(screen.getAllByRole('tabpanel', { hidden: true })[0]).toHaveStyle({
        transform: 'translateY(-100%)',
      });
    } else {
      expect(track).toHaveStyle({ transform: 'translateX(-100%)' });
      expect(panel.style.transform).toBe('');
    }
  }
);

it('links labeled tabs to panels and jumps directly to a selected slide', () => {
  vi.useFakeTimers();
  const change = vi.fn();
  render(<Slideshow images={images} onStepChange={change} />);

  selected('Step 1');
  expect(screen.getByRole('button', { name: 'Previous image' })).toBeDisabled();

  fireEvent.click(screen.getByRole('tab', { name: 'Step 5' }));

  selected('Step 5');
  expect(change).toHaveBeenLastCalledWith(4);
  expect(screen.getByRole('tabpanel')).toHaveAttribute(
    'id',
    screen.getByRole('tab', { name: 'Step 5' }).getAttribute('aria-controls')
  );
  expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Step 5');
  expect(screen.getAllByRole('img')).toHaveLength(1);

  fireEvent.click(screen.getByRole('tab', { name: 'Step 3' }));
  act(() => vi.advanceTimersByTime(3000));
  selected('Step 3');
});

it('keeps keyboard focus on the wrapper while navigating across the visible steps', () => {
  render(<Slideshow images={images} maxVisible={3} loop />);
  const gallery = screen.getByRole('region', { name: 'Slide Show' });

  expect(gallery).toHaveAttribute('tabindex', '0');
  expect(gallery.querySelectorAll('[tabindex="0"]')).toHaveLength(0);
  expect(screen.getByRole('tabpanel')).not.toHaveAttribute('tabindex');
  for (const button of Array.from(gallery.querySelectorAll('button'))) {
    expect(button).toHaveAttribute('tabindex', '-1');
  }

  act(() => gallery.focus());
  fireEvent.keyDown(gallery, { key: 'End' });
  selected('Step 7');
  expect(gallery).toHaveFocus();
  expect(screen.getAllByRole('tab')).toHaveLength(3);

  fireEvent.keyDown(gallery, { key: 'ArrowRight' });
  selected('Step 1');
  expect(gallery).toHaveFocus();
  fireEvent.keyDown(gallery, { key: 'ArrowRight' });
  selected('Step 2');
  fireEvent.keyDown(gallery, { key: 'Home' });
  selected('Step 1');
});

it('uses only Up and Down for a focused vertical slideshow', () => {
  render(<Slideshow images={images} orientation="vertical" />);
  const gallery = screen.getByRole('region');
  act(() => gallery.focus());

  fireEvent.keyDown(gallery, { key: 'ArrowRight' });
  selected('Step 1');
  fireEvent.keyDown(gallery, { key: 'ArrowDown' });
  selected('Step 2');
  fireEvent.keyDown(gallery, { key: 'ArrowUp' });
  selected('Step 1');
  expect(gallery).toHaveFocus();
});

it('controls the nearest visible slideshow without needing focus', () => {
  render(
    <>
      <Slideshow images={images} />
      <Slideshow images={images} />
    </>
  );
  const [first, second] = screen.getAllByRole('region');
  vi.spyOn(first, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 50, 700, 200)
  );
  vi.spyOn(second, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 280, 700, 200)
  );

  expect(fireEvent.keyDown(document, { key: 'ArrowRight' })).toBe(false);
  expect(
    within(first).getByRole('tab', { selected: true })
  ).toHaveAccessibleName('Step 1');
  expect(
    within(second).getByRole('tab', { selected: true })
  ).toHaveAccessibleName('Step 2');
  expect(document.body).toHaveFocus();

  act(() => first.focus());
  fireEvent.keyDown(first, { key: 'ArrowRight' });
  expect(
    within(first).getByRole('tab', { selected: true })
  ).toHaveAccessibleName('Step 2');
  expect(
    within(second).getByRole('tab', { selected: true })
  ).toHaveAccessibleName('Step 2');
  expect(first).toHaveFocus();
});

it('routes unfocused arrows to a visible slideshow on the matching axis', () => {
  render(
    <>
      <Slideshow images={images} />
      <Slideshow images={images} orientation="vertical" />
    </>
  );
  const [horizontal, vertical] = screen.getAllByRole('region');
  vi.spyOn(horizontal, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 50, 700, 200)
  );
  vi.spyOn(vertical, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 280, 700, 200)
  );

  fireEvent.keyDown(document, { key: 'ArrowDown' });
  expect(
    within(horizontal).getByRole('tab', { selected: true })
  ).toHaveAccessibleName('Step 1');
  expect(
    within(vertical).getByRole('tab', { selected: true })
  ).toHaveAccessibleName('Step 2');
  fireEvent.keyDown(document, { key: 'ArrowRight' });
  expect(
    within(horizontal).getByRole('tab', { selected: true })
  ).toHaveAccessibleName('Step 2');
  expect(
    within(vertical).getByRole('tab', { selected: true })
  ).toHaveAccessibleName('Step 2');
});

it('ignores offscreen slideshows but allows explicitly focused ones', () => {
  preferences.inView = false;
  render(<Slideshow images={images} />);
  const gallery = screen.getByRole('region');

  expect(fireEvent.keyDown(document, { key: 'ArrowRight' })).toBe(true);
  selected('Step 1');
  act(() => gallery.focus());
  fireEvent.keyDown(gallery, { key: 'ArrowRight' });
  selected('Step 2');
});

it('leaves editing, widget shortcuts, modified keys and page Home/End alone', () => {
  render(
    <>
      <input aria-label="Caption" />
      <div contentEditable role="textbox" aria-label="Editor" />
      <div role="slider" aria-label="Value" />
      <Slideshow images={images} />
    </>
  );
  const gallery = screen.getByRole('region');
  vi.spyOn(gallery, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 100, 700, 400)
  );

  for (const target of [
    screen.getByLabelText('Caption'),
    screen.getByLabelText('Editor'),
    screen.getByLabelText('Value'),
  ]) {
    expect(fireEvent.keyDown(target, { key: 'ArrowRight' })).toBe(true);
    selected('Step 1');
  }

  for (const modifier of ['ctrlKey', 'altKey', 'metaKey', 'shiftKey']) {
    expect(
      fireEvent.keyDown(document, { key: 'ArrowRight', [modifier]: true })
    ).toBe(true);
  }
  expect(fireEvent.keyDown(document, { key: 'End' })).toBe(true);
  expect(fireEvent.keyDown(document, { key: 'Home' })).toBe(true);
  selected('Step 1');
});

it('clamps arrows without looping and releases the listener on unmount', () => {
  const change = vi.fn();
  const { unmount } = render(
    <Slideshow images={images.slice(0, 2)} onStepChange={change} />
  );
  const gallery = screen.getByRole('region');
  act(() => gallery.focus());

  expect(fireEvent.keyDown(gallery, { key: 'ArrowLeft' })).toBe(true);
  selected('Step 1');
  fireEvent.keyDown(gallery, { key: 'ArrowRight' });
  selected('Step 2');
  expect(fireEvent.keyDown(gallery, { key: 'ArrowRight' })).toBe(true);
  expect(change).toHaveBeenCalledTimes(1);

  unmount();
  fireEvent.keyDown(document, { key: 'ArrowRight' });
  expect(change).toHaveBeenCalledTimes(1);
});

it('lets Space toggle autoplay from the wrapper and pauses for arrow navigation', () => {
  vi.useFakeTimers();
  render(<Slideshow images={images} autoPlay loop stepDuration={1000} />);
  const gallery = screen.getByRole('region');
  act(() => gallery.focus());
  // Explicitly pause before toggling, independent of jsdom's focus-visible support.
  fireEvent.click(screen.getByRole('button', { name: 'Pause slideshow' }));
  fireEvent.keyDown(gallery, { key: ' ' });
  expect(
    screen.getByRole('button', { name: 'Pause slideshow' })
  ).toBeInTheDocument();
  fireEvent.keyDown(gallery, { key: ' ', repeat: true });
  expect(
    screen.getByRole('button', { name: 'Pause slideshow' })
  ).toBeInTheDocument();
  fireEvent.keyDown(gallery, { key: 'ArrowRight' });
  selected('Step 2');
  act(() => vi.advanceTimersByTime(2000));
  selected('Step 2');
  expect(gallery).toHaveFocus();
  expect(
    screen.getByRole('button', { name: 'Play slideshow' })
  ).toBeInTheDocument();
});

it('supports controlled selection, looping buttons, and shrinking image lists', () => {
  const change = vi.fn();
  const { rerender } = render(
    <Slideshow images={images} active={0} onStepChange={change} loop />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Previous image' }));
  expect(change).toHaveBeenLastCalledWith(6);
  selected('Step 1');

  rerender(<Slideshow images={images} active={6} onStepChange={change} loop />);
  selected('Step 7');
  rerender(<Slideshow images={images.slice(0, 2)} active={6} />);
  selected('Step 2');
});

it('handles empty and single-image slideshows without dangling controls', () => {
  const { rerender } = render(<Slideshow images={[]} />);
  expect(screen.queryByRole('region')).not.toBeInTheDocument();

  rerender(<Slideshow images={images.slice(0, 1)} autoPlay />);
  expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Step 1');
  expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('keeps autoplay running through hover and pointer selection with a fresh interval', () => {
  vi.useFakeTimers();
  render(
    <Slideshow images={images.slice(0, 3)} autoPlay stepDuration={1000} loop />
  );
  act(() => vi.advanceTimersByTime(400));

  fireEvent.mouseEnter(screen.getByRole('region'));
  fireEvent.focus(screen.getByRole('tab', { name: 'Step 3' }));
  fireEvent.click(screen.getByRole('tab', { name: 'Step 3' }));
  selected('Step 3');
  expect(
    screen.getByRole('button', { name: 'Pause slideshow' })
  ).toBeInTheDocument();

  act(() => vi.advanceTimersByTime(999));
  selected('Step 3');
  act(() => vi.advanceTimersByTime(1));
  selected('Step 1');

  fireEvent.click(screen.getByRole('button', { name: 'Next image' }));
  selected('Step 2');
  act(() => vi.advanceTimersByTime(1000));
  selected('Step 3');
});

it('keeps an explicitly paused slideshow paused while selecting steps', () => {
  vi.useFakeTimers();
  render(
    <Slideshow images={images.slice(0, 3)} autoPlay stepDuration={1000} loop />
  );

  fireEvent.click(screen.getByRole('button', { name: 'Pause slideshow' }));
  fireEvent.click(screen.getByRole('tab', { name: 'Step 2' }));
  act(() => vi.advanceTimersByTime(2000));
  selected('Step 2');

  fireEvent.click(screen.getByRole('button', { name: 'Play slideshow' }));
  act(() => vi.advanceTimersByTime(999));
  selected('Step 2');
  act(() => vi.advanceTimersByTime(1));
  selected('Step 3');
});

it.each(['horizontal', 'vertical'] as const)(
  'clears paused autoplay progress and restarts from zero for %s steps',
  (orientation) => {
    vi.useFakeTimers();
    render(
      <Slideshow
        images={images.slice(0, 3)}
        orientation={orientation}
        autoPlay
        stepDuration={1000}
        loop
      />
    );
    const indicator = () =>
      screen.getByRole('tab', { selected: true }).firstElementChild;
    const initialFill = indicator()?.firstElementChild;
    expect(initialFill).not.toBeNull();
    act(() => vi.advanceTimersByTime(400));

    fireEvent.click(screen.getByRole('button', { name: 'Pause slideshow' }));
    expect(indicator()).toHaveAttribute('data-progress', 'true');
    expect(indicator()).toBeEmptyDOMElement();
    act(() => vi.advanceTimersByTime(2000));
    selected('Step 1');

    fireEvent.click(screen.getByRole('button', { name: 'Play slideshow' }));
    expect(indicator()).toHaveAttribute('data-progress', 'true');
    expect(indicator()?.firstElementChild).not.toBeNull();
    expect(indicator()?.firstElementChild).not.toBe(initialFill);
    act(() => vi.advanceTimersByTime(999));
    selected('Step 1');
    act(() => vi.advanceTimersByTime(1));
    selected('Step 2');
  }
);

it('keeps rapid selections on the latest slide and starts its full autoplay interval', () => {
  vi.useFakeTimers();
  render(
    <Slideshow images={images.slice(0, 5)} autoPlay stepDuration={1000} loop />
  );

  act(() => vi.advanceTimersByTime(300));
  fireEvent.click(screen.getByRole('tab', { name: 'Step 5' }));
  act(() => vi.advanceTimersByTime(200));
  fireEvent.click(screen.getByRole('tab', { name: 'Step 2' }));
  act(() => vi.advanceTimersByTime(200));
  fireEvent.click(screen.getByRole('tab', { name: 'Step 4' }));

  act(() => vi.advanceTimersByTime(999));
  selected('Step 4');
  act(() => vi.advanceTimersByTime(1));
  selected('Step 5');
});

it('does not autoplay offscreen or when reduced motion is requested', () => {
  vi.useFakeTimers();
  preferences.inView = false;
  const { rerender } = render(
    <Slideshow images={images} autoPlay stepDuration={1000} />
  );
  act(() => vi.advanceTimersByTime(2000));
  selected('Step 1');

  preferences.inView = true;
  preferences.reducedMotion = true;
  rerender(<Slideshow images={images} autoPlay stepDuration={1000} />);
  act(() => vi.advanceTimersByTime(2000));
  selected('Step 1');
  expect(
    screen.queryByRole('button', { name: 'Pause slideshow' })
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: 'Step 4' }));
  selected('Step 4');
});

describe('useAutoPlay', () => {
  it('restarts progress and timing together after pausing, and cleans up on unmount', () => {
    vi.useFakeTimers();
    const change = vi.fn();
    const { result, unmount } = renderHook(() =>
      useAutoPlay({
        count: 3,
        active: 0,
        onStepChange: change,
        stepDuration: 1000,
      })
    );

    act(() => vi.advanceTimersByTime(400));
    act(() => result.current.toggle());
    act(() => vi.advanceTimersByTime(2000));
    expect(change).not.toHaveBeenCalled();
    act(() => result.current.toggle());
    act(() => vi.advanceTimersByTime(999));
    expect(change).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(change).toHaveBeenCalledWith(1);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('stops at the last slide unless looping is enabled', () => {
    vi.useFakeTimers();
    const change = vi.fn();
    const { result, rerender } = renderHook(
      ({ loop }) =>
        useAutoPlay({
          count: 3,
          active: 2,
          onStepChange: change,
          stepDuration: 1000,
          loop,
        }),
      { initialProps: { loop: false } }
    );
    expect(result.current.playing).toBe(false);
    act(() => vi.advanceTimersByTime(1000));
    expect(change).not.toHaveBeenCalled();

    rerender({ loop: true });
    act(() => vi.advanceTimersByTime(1000));
    expect(change).toHaveBeenCalledWith(0);
  });
});
