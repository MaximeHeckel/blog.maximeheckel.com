import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import RGBLensIcon from '../RGBLensIcon';

const animation = vi.hoisted(() => ({
  reduced: false,
  completions: [] as Array<() => void>,
}));

vi.mock('motion/react', async () => {
  const React = await import('react');
  const element = (tag: 'svg' | 'g' | 'circle' | 'path') => {
    const MockMotion = ({
      initial: _initial,
      animate: _animate,
      transition: _transition,
      onAnimationComplete,
      ...props
    }: React.SVGProps<SVGSVGElement> & {
      initial?: unknown;
      animate?: unknown;
      transition?: unknown;
      onAnimationComplete?: () => void;
    }) => {
      React.useEffect(() => {
        if (onAnimationComplete)
          animation.completions.push(onAnimationComplete);
      }, [onAnimationComplete]);
      return React.createElement(tag, props);
    };
    return MockMotion;
  };
  return {
    useReducedMotion: () => animation.reduced,
    motion: {
      svg: element('svg'),
      g: element('g'),
      circle: element('circle'),
      path: element('path'),
    },
  };
});

const completeCycle = () => act(() => animation.completions.at(-1)!());
const icon = () => screen.getByRole('img');
const hasGlow = () => icon().querySelector('filter') !== null;

beforeEach(() => {
  animation.reduced = false;
  animation.completions = [];
});
afterEach(cleanup);

describe('RGBLensIcon', () => {
  it.each([undefined, false] as const)(
    'renders a plain SVG for animate=%s',
    (animate) => {
      render(<RGBLensIcon animate={animate} size={48} />);
      expect(icon().getAttribute('width')).toBe('48');
      expect(icon().querySelectorAll('path')).toHaveLength(8);
      expect(hasGlow()).toBe(false);
      fireEvent.mouseEnter(icon());
      expect(animation.completions).toHaveLength(0);
    }
  );

  it('finishes the current hover cycle after the pointer leaves', () => {
    render(<RGBLensIcon animate="hover" />);
    expect(hasGlow()).toBe(false);
    fireEvent.mouseEnter(icon().parentElement!);
    expect(hasGlow()).toBe(true);
    fireEvent.mouseLeave(icon().parentElement!);
    expect(hasGlow()).toBe(true);
    completeCycle();
    expect(hasGlow()).toBe(false);
  });

  it('keeps the current cycle on re-entry and repeats while hovered', () => {
    render(<RGBLensIcon animate="hover" />);
    fireEvent.mouseEnter(icon().parentElement!);
    const runningIcon = icon();
    fireEvent.mouseLeave(icon().parentElement!);
    fireEvent.mouseEnter(icon().parentElement!);
    expect(icon()).toBe(runningIcon);
    completeCycle();
    expect(hasGlow()).toBe(true);
    expect(icon()).not.toBe(runningIcon);
    fireEvent.mouseLeave(icon().parentElement!);
    completeCycle();
    expect(hasGlow()).toBe(false);
  });

  it('repeats automatically without hover', () => {
    render(<RGBLensIcon animate={true} />);
    const firstCycle = icon();
    completeCycle();
    expect(hasGlow()).toBe(true);
    expect(icon()).not.toBe(firstCycle);
    completeCycle();
    expect(hasGlow()).toBe(true);
  });

  it('finishes the current loop before switching to plain SVG', () => {
    const { rerender } = render(<RGBLensIcon animate={true} />);
    const currentCycle = icon();
    rerender(<RGBLensIcon animate={false} />);
    expect(icon()).toBe(currentCycle);
    expect(hasGlow()).toBe(true);
    completeCycle();
    expect(hasGlow()).toBe(false);
    expect(icon().parentElement?.tagName).toBe('DIV');
  });

  it('cancels a pending stop when enabled again without restarting the cycle', () => {
    const { rerender } = render(<RGBLensIcon animate={true} />);
    const currentCycle = icon();
    rerender(<RGBLensIcon animate={false} />);
    rerender(<RGBLensIcon animate={true} />);
    expect(icon()).toBe(currentCycle);
    completeCycle();
    expect(hasGlow()).toBe(true);
    expect(icon()).not.toBe(currentCycle);
  });

  it('starts looping when a static icon is enabled', () => {
    const { rerender } = render(<RGBLensIcon />);
    expect(hasGlow()).toBe(false);
    rerender(<RGBLensIcon animate={true} />);
    expect(hasGlow()).toBe(true);
    rerender(<RGBLensIcon />);
    expect(hasGlow()).toBe(true);
    completeCycle();
    expect(hasGlow()).toBe(false);
  });

  it('finishes hover animation when the prop becomes false, even while hovered', () => {
    const { rerender } = render(<RGBLensIcon animate="hover" />);
    fireEvent.mouseEnter(icon().parentElement!);
    rerender(<RGBLensIcon animate={false} />);
    expect(hasGlow()).toBe(true);
    completeCycle();
    expect(hasGlow()).toBe(false);
  });

  it.each(['hover', true] as const)(
    'respects reduced motion in %s mode',
    (animate) => {
      animation.reduced = true;
      render(<RGBLensIcon animate={animate} />);
      expect(hasGlow()).toBe(false);
      expect(animation.completions).toHaveLength(0);
    }
  );
});
