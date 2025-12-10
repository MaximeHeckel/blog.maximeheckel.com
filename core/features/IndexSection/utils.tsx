import { extend, useThree } from '@react-three/fiber';
import { BlendFunction, Effect } from 'postprocessing';
import React, { RefObject } from 'react';

export const resolveRef = (ref: RefObject<any>) =>
  typeof ref === 'object' && ref != null && 'current' in ref
    ? ref.current
    : ref;

let i = 0;
const components = new WeakMap();

export const wrapEffect = (
  effect: new (...args: any[]) => Effect,
  defaults?: { blendFunction?: BlendFunction; opacity?: number; args?: any[] }
) =>
  /* @__PURE__ */ function Effect({
    blendFunction = defaults?.blendFunction,
    opacity = defaults?.opacity,
    ...props
  }) {
    const { ref, ...params } = props;
    let Component = components.get(effect);
    if (!Component) {
      const key = `@react-three/postprocessing/${effect.name}-${i++}`;
      extend({ [key]: effect });
      components.set(effect, (Component = key));
    }

    const camera = useThree((state) => state.camera);
    const args = React.useMemo(
      () => [
        ...(defaults?.args ?? []),
        ...(params.args ?? [{ ...defaults, ...params }]),
      ],
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [JSON.stringify(params)]
    );

    return (
      <Component
        camera={camera}
        blendMode-blendFunction={blendFunction}
        blendMode-opacity-value={opacity}
        ref={ref}
        {...props}
        args={args}
      />
    );
  };
