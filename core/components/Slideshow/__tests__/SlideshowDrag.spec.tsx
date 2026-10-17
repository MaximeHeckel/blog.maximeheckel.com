import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { animate, MotionValue } from 'motion/react';
import { ReactElement, useState } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import Slideshow, { SlideshowProps } from '..';

const motion = vi.hoisted(() => ({
  reducedMotion: false,
  progress: 1,
  completions: [] as (() => void)[],
}));

vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('motion/react')>()),
  useReducedMotion: () => motion.reducedMotion,
  useInView: () => true,
  animate: vi.fn((offset: MotionValue<number>, target: number) => {
    offset.set(offset.get() + (target - offset.get()) * motion.progress);

    return {
      stop: vi.fn(),
      then: (complete: () => void) => motion.completions.push(complete),
    };
  }),
}));

const images = ['one.jpg', 'two.jpg', 'three.jpg'];

beforeEach(() => {
  motion.reducedMotion = false;
  motion.progress = 1;
  motion.completions = [];

  class TestPointerEvent extends MouseEvent {
    pointerId: number;
    pointerType: string;
    isPrimary: boolean;

    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 1;
      this.pointerType = init.pointerType ?? 'mouse';
      this.isPrimary = init.isPrimary ?? true;
    }
  }

  vi.stubGlobal('PointerEvent', TestPointerEvent);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const setup = (props: Partial<SlideshowProps> = {}, element?: ReactElement) => {
  const rendered = render(element ?? <Slideshow images={images} {...props} />);
  const gallery = screen.getByRole('region');
  const viewport = screen.getByRole('tabpanel').parentElement!.parentElement!;
  const captured = new Set<number>();

  Object.defineProperties(viewport, {
    clientWidth: { value: 500 },
    clientHeight: { value: 300 },
  });
  viewport.setPointerCapture = vi.fn((id) => captured.add(id));
  viewport.hasPointerCapture = (id) => captured.has(id);
  viewport.releasePointerCapture = vi.fn((id) => captured.delete(id));

  let position = { clientX: 250, clientY: 150 };

  const down = (extra: PointerEventInit = {}) => {
    position = { clientX: 250, clientY: 150 };

    return fireEvent.pointerDown(viewport, {
      button: 0,
      ...position,
      ...extra,
    });
  };

  const move = (dx: number, dy = 0) => {
    position = { clientX: 250 + dx, clientY: 150 + dy };

    return fireEvent.pointerMove(viewport, position);
  };

  const up = (extra: PointerEventInit = {}) =>
    fireEvent.pointerUp(viewport, { ...position, ...extra });

  const finish = () =>
    act(() => {
      while (motion.completions.length) motion.completions.shift()?.();
    });
  const preview = () => viewport.querySelector('[data-drag-preview]');

  return { ...rendered, gallery, viewport, down, move, up, finish, preview };
};

it.each(['horizontal', 'vertical'] as const)(
  'drags %s neighbors and commits only past the threshold',
  (orientation) => {
    const change = vi.fn();
    const { viewport, down, move, up, finish, preview } = setup({
      orientation,
      onStepChange: change,
    });
    down();
    expect(viewport).toHaveAttribute('data-grabbing', 'true');
    move(
      orientation === 'horizontal' ? -130 : 0,
      orientation === 'vertical' ? -100 : 0
    );
    expect(preview()).toHaveAttribute('aria-hidden', 'true');
    expect(preview()).toHaveAttribute('inert');
    expect(preview()?.querySelectorAll('img')).toHaveLength(2);
    expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
      'Step 1'
    );
    expect(change).not.toHaveBeenCalled();

    up();
    expect(change).toHaveBeenLastCalledWith(1);
    expect(viewport).toHaveAttribute('data-grabbing', 'false');
    finish();
    expect(preview()).toBeNull();
    expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
      'Step 2'
    );

    down();
    move(
      orientation === 'horizontal' ? 130 : 0,
      orientation === 'vertical' ? 100 : 0
    );
    up();
    finish();
    expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
      'Step 1'
    );
  }
);

it('snaps a short drag back without selecting another slide', () => {
  const now = vi.spyOn(performance, 'now').mockReturnValue(0);
  const change = vi.fn();
  const { down, move, up, finish, preview } = setup({ onStepChange: change });
  down();
  now.mockReturnValue(200);
  move(-7);
  expect(preview()).not.toBeNull();
  now.mockReturnValue(300);
  up();
  finish();
  expect(change).not.toHaveBeenCalled();
  expect(preview()).toBeNull();
  expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
    'Step 1'
  );
});

it.each([
  {
    label: 'short forward flick',
    distance: -25,
    movedAt: 30,
    releasedAt: 40,
    step: 2,
  },
  {
    label: 'short backward flick',
    distance: 25,
    movedAt: 30,
    releasedAt: 40,
    step: 3,
  },
  {
    label: 'tiny forward flick',
    distance: -8,
    movedAt: 15,
    releasedAt: 20,
    step: 2,
  },
  {
    label: 'tiny backward flick',
    distance: 8,
    movedAt: 15,
    releasedAt: 20,
    step: 3,
  },
  {
    label: 'held intentional drag',
    distance: -25,
    movedAt: 30,
    releasedAt: 200,
    step: 2,
  },
  {
    label: 'small quick movement',
    distance: -4,
    movedAt: 10,
    releasedAt: 15,
    step: 1,
  },
  {
    label: 'lower distance threshold',
    distance: -12,
    movedAt: 200,
    releasedAt: 210,
    step: 2,
  },
])(
  'handles $label without requiring a long pull',
  ({ distance, movedAt, releasedAt, step }) => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(0);
    const { down, move, up, finish } = setup({ loop: true });
    down();
    now.mockReturnValue(movedAt);
    move(distance);
    now.mockReturnValue(releasedAt);
    up();
    finish();
    expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
      `Step ${step}`
    );
  }
);

it.each([-8, -7])(
  'preserves a flick through a final pointer position of %s',
  (lastPosition) => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(0);
    const { down, move, up, finish } = setup();
    down();
    now.mockReturnValue(20);
    move(-8);
    now.mockReturnValue(25);
    move(lastPosition);
    now.mockReturnValue(30);
    up();
    finish();
    expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
      'Step 2'
    );
  }
);

it.each([
  { orientation: 'horizontal', direction: -1 },
  { orientation: 'horizontal', direction: 1 },
  { orientation: 'vertical', direction: -1 },
  { orientation: 'vertical', direction: 1 },
] as const)(
  'registers a quick $orientation flick in direction $direction from the release position',
  ({ orientation, direction }) => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(0);
    const { down, up, finish } = setup({ orientation, loop: true });

    down();

    now.mockReturnValue(15);
    up({
      clientX: 250 + (orientation === 'horizontal' ? direction * 8 : 0),
      clientY: 150 + (orientation === 'vertical' ? direction * 8 : 0),
    });
    finish();

    expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
      `Step ${direction < 0 ? 2 : 3}`
    );
  }
);

it.each(['horizontal', 'vertical'] as const)(
  'includes movement between the last move event and the %s release',
  (orientation) => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(0);
    const { down, move, up, finish } = setup({ orientation });

    down();
    now.mockReturnValue(10);
    move(
      orientation === 'horizontal' ? -3 : 0,
      orientation === 'vertical' ? -3 : 0
    );

    now.mockReturnValue(20);
    up({
      clientX: orientation === 'horizontal' ? 220 : 250,
      clientY: orientation === 'vertical' ? 120 : 150,
    });
    finish();

    expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
      'Step 2'
    );
  }
);

it.each(['horizontal', 'vertical'] as const)(
  'does not discard a %s mouse flick that starts diagonally',
  (orientation) => {
    const { down, move, up, finish } = setup({ orientation });

    down();
    move(
      orientation === 'horizontal' ? -3 : 12,
      orientation === 'vertical' ? -3 : 12
    );
    move(
      orientation === 'horizontal' ? -25 : 14,
      orientation === 'vertical' ? -25 : 14
    );
    up();
    finish();

    expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
      'Step 2'
    );
  }
);

it('accepts another swipe before the previous slide has finished settling', () => {
  const { down, move, up, finish, viewport, preview } = setup();
  down();
  move(-130);
  up();
  expect(preview()).not.toBeNull();
  expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
    'Step 2'
  );
  down();
  expect(viewport).toHaveAttribute('data-grabbing', 'true');
  move(-130);
  up();
  finish();
  expect(preview()).toBeNull();
  expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
    'Step 3'
  );
});

it('keeps decoded preview images mounted when a settling swipe is grabbed again', () => {
  motion.progress = 0.1;
  const { down, move, up, preview } = setup();

  down({ pointerType: 'touch' });
  move(-130);

  const track = preview();
  const image = track?.querySelector('img[src*="two.jpg"]');

  expect(image).toHaveAttribute('loading', 'eager');
  expect(image).toHaveAttribute('decoding', 'sync');

  up();
  down({ pointerType: 'touch' });

  expect(preview()).toBe(track);
  expect(preview()?.querySelector('img[src*="two.jpg"]')).toBe(image);

  move(130);
  up();
  down({ pointerType: 'touch' });

  expect(preview()).toBe(track);
  expect(preview()?.querySelector('img[src*="two.jpg"]')).toBe(image);
});

it('holds the settled preview position until removal and starts the next swipe at zero', () => {
  const { down, move, up, finish, preview } = setup();

  down();
  move(-130);
  up();

  const offset = vi
    .mocked(animate)
    .mock.calls.at(-1)![0] as MotionValue<number>;

  expect(offset.get()).toBe(-500);
  finish();
  expect(preview()).toBeNull();
  expect(offset.get()).toBe(-500);

  down();
  expect(offset.get()).toBe(0);
  move(-25);
  expect(offset.get()).toBe(-25);
});

it('can reverse direction while consecutive unfinished transitions overlap', () => {
  motion.progress = 0.1;
  const { down, move, up, finish, preview } = setup();
  down();
  move(-130);
  up();
  down();
  move(-130);
  up();
  expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
    'Step 3'
  );
  down();
  expect(preview()?.querySelector('img[src*="one.jpg"]')).not.toBeNull();
  move(130);
  up();
  finish();
  expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
    'Step 2'
  );
});

it('allows a snapback to be grabbed again, without requiring a pause between swipes', () => {
  const now = vi.spyOn(performance, 'now').mockReturnValue(0);
  const { down, move, up, finish } = setup();
  down();
  now.mockReturnValue(200);
  move(-7);
  now.mockReturnValue(350);
  up();
  down();
  move(-130);
  up();
  finish();
  expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
    'Step 2'
  );
});

it('keeps the accepted slide when a settling image is grabbed and released without moving', () => {
  const { down, move, up, finish } = setup();
  down();
  move(-130);
  up();
  down();
  up();
  finish();
  expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
    'Step 2'
  );
});

it.each([0, 2])('resists the non-looping boundary at slide %s', (active) => {
  const change = vi.fn();
  const { down, move, up, finish } = setup({ active, onStepChange: change });
  down();
  move(active === 0 ? 300 : -300);
  up();
  finish();
  expect(change).not.toHaveBeenCalled();
});

it('snaps back when the release is moving toward the current image', () => {
  const now = vi.spyOn(performance, 'now').mockReturnValue(0);
  const change = vi.fn();
  const { down, move, up, finish } = setup({ onStepChange: change });
  down();
  now.mockReturnValue(20);
  move(-70);
  now.mockReturnValue(40);
  move(-4);
  now.mockReturnValue(45);
  up();
  finish();
  expect(change).not.toHaveBeenCalled();
  expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
    'Step 1'
  );
});

it.each([0, 2])(
  'reveals the wrapped neighbor at slide %s when looping',
  (active) => {
    const change = vi.fn();
    const { down, move, up, finish, preview } = setup({
      active,
      loop: true,
      onStepChange: change,
    });
    down();
    move(active === 0 ? 150 : -150);
    expect(preview()?.querySelectorAll('img')).toHaveLength(3);
    up();
    expect(change).toHaveBeenLastCalledWith(active === 0 ? 2 : 0);
    finish();
    // The controlled owner has not accepted the selection, so restore its image.
    expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
      `Step ${active + 1}`
    );
    expect(preview()).toBeNull();
  }
);

it.each(['pointerCancel', 'lostPointerCapture'] as const)(
  'restores the current image after %s',
  (event) => {
    const change = vi.fn();
    const { viewport, down, move, finish, preview } = setup({
      onStepChange: change,
    });
    down();
    move(-150);
    fireEvent[event](viewport);
    finish();
    expect(change).not.toHaveBeenCalled();
    expect(preview()).toBeNull();
    expect(viewport.releasePointerCapture).toHaveBeenCalledWith(1);
  }
);

it('leaves cross-axis touch gestures and simple taps to the browser without pausing autoplay', () => {
  const { down, move, up, preview } = setup({ autoPlay: true });
  down({ pointerType: 'touch' });
  move(2, 100);
  up();
  expect(preview()).toBeNull();
  down({ pointerType: 'touch' });
  up();
  expect(
    screen.getByRole('button', { name: 'Pause slideshow' })
  ).toBeInTheDocument();
});

it('cancels the preview when a second touch begins, allowing pinch zoom', () => {
  const { viewport, down, move, preview } = setup();
  down({ pointerType: 'touch' });
  move(-150);
  expect(preview()).not.toBeNull();
  fireEvent.pointerDown(viewport, {
    pointerId: 2,
    pointerType: 'touch',
    isPrimary: false,
  });
  expect(preview()).toBeNull();
  expect(viewport.releasePointerCapture).toHaveBeenCalledWith(1);
});

it('pauses autoplay on an intentional drag and retains the selected fade mode afterwards', () => {
  vi.useFakeTimers();
  const { down, move, up, finish } = setup({ autoPlay: true, loop: true });
  down();
  move(-150);
  expect(
    screen.getByRole('button', { name: 'Play slideshow' })
  ).toBeInTheDocument();
  up();
  finish();
  act(() => vi.advanceTimersByTime(10000));
  expect(screen.getByRole('tabpanel')).toHaveAttribute(
    'data-transition',
    'fade'
  );
  expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
    'Step 2'
  );
});

it('cancels an unfinished gesture on resize or keyboard navigation', () => {
  const { gallery, viewport, down, move, preview } = setup();
  down();
  move(-150);
  fireEvent(window, new Event('resize'));
  expect(preview()).toBeNull();
  expect(viewport).toHaveAttribute('data-grabbing', 'false');
  down();
  move(-150);
  act(() => gallery.focus());
  fireEvent.keyDown(gallery, { key: 'ArrowRight' });
  expect(preview()).toBeNull();
  expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
    'Step 2'
  );
});

it('disables native image dragging and ignores right-click or single-image dragging', () => {
  const { viewport, down, move, preview, rerender } = setup();
  for (const image of screen.getAllByAltText('Image')) {
    expect(image).toHaveAttribute('draggable', 'false');
    expect(fireEvent.dragStart(image)).toBe(false);
  }
  down({ button: 2 });
  move(-150);
  expect(preview()).toBeNull();
  expect(viewport.setPointerCapture).not.toHaveBeenCalled();
  rerender(<Slideshow images={images.slice(0, 1)} />);
  down();
  move(-150);
  expect(viewport).toHaveAttribute('data-swipeable', 'false');
  expect(preview()).toBeNull();
});

it('supports controlled selection accepted by the owner', () => {
  const Controlled = () => {
    const [active, setActive] = useState(0);

    return (
      <Slideshow images={images} active={active} onStepChange={setActive} />
    );
  };
  const { down, move, up, finish } = setup({}, <Controlled />);
  down();
  move(-150);
  up();
  finish();
  expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
    'Step 2'
  );
});
