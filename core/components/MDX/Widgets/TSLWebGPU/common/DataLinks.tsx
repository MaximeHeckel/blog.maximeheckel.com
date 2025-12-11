import { Flex } from '@maximeheckel/design-system';
import { AnimationPlaybackControls, useAnimate } from 'motion/react';
import { useRef, useEffect, useCallback } from 'react';

export const DataLink0 = (props: { enabled?: boolean }) => {
  const { enabled = true } = props;
  const [scope, animate] = useAnimate();
  const animationsRef = useRef<AnimationPlaybackControls[]>([]);

  const startAnimation = useCallback(async () => {
    stopAnimation();

    const animations: AnimationPlaybackControls[] | undefined = [];

    // Animate the data link paths
    const paths = scope.current?.querySelectorAll('path[data-animate]');
    if (paths) {
      paths.forEach((path: HTMLElement) => {
        const isInverse = path.getAttribute('data-inverse') === 'true';

        const pathAnimation = animate(
          path,
          { strokeDashoffset: isInverse ? -20 : 20 },
          {
            duration: 2.0,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
          }
        );

        animations.push(pathAnimation);
      });
    }

    animationsRef.current = animations;
  }, [animate, scope]);

  const stopAnimation = () => {
    animationsRef.current.forEach((animation) => {
      if (animation) {
        animation.cancel();
      }
    });
    animationsRef.current = [];
  };

  useEffect(() => {
    if (enabled) {
      startAnimation();
      return;
    }

    stopAnimation();

    return () => {
      stopAnimation();
    };
  }, [enabled, startAnimation]);

  return (
    <svg
      ref={scope}
      width="min(60dvw, 352px)"
      height="auto"
      viewBox="0 0 176 114"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        data-animate
        data-inverse="true"
        d="M-6.79493e-06 60L67.5645 60L94 60C120.51 60 142 81.4903 142 108V114"
        stroke="url(#paint0_linear_2252_7518)"
        strokeWidth="6"
        strokeDasharray="0.75 1.25"
        strokeDashoffset="0"
      />
      <mask
        id="mask0_2252_7518"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="98"
        y="2"
        width="75"
        height="75"
      >
        <circle cx="135.5" cy="39.5" r="37" fill="black" stroke="white" />
      </mask>

      <defs>
        <linearGradient
          id="paint0_linear_2252_7518"
          x1="71"
          y1="114"
          x2="71"
          y2="60"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" />
          <stop offset="1" stopColor="#FF6813" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_2252_7518"
          x1="110.595"
          y1="97.984"
          x2="89.3293"
          y2="52.7315"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" />
          <stop offset="1" stopColor="#FF6813" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const DataLink01 = (props: { enabled?: boolean }) => {
  const { enabled = true } = props;
  const [scope, animate] = useAnimate();
  const animationsRef = useRef<AnimationPlaybackControls[]>([]);

  const startAnimation = useCallback(async () => {
    stopAnimation();

    const animations: AnimationPlaybackControls[] | undefined = [];

    // Animate the data link paths
    const paths = scope.current?.querySelectorAll('path[data-animate]');
    if (paths) {
      paths.forEach((path: HTMLElement) => {
        const isInverse = path.getAttribute('data-inverse') === 'true';

        const pathAnimation = animate(
          path,
          { strokeDashoffset: isInverse ? -20 : 20 },
          {
            duration: 2.0,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
          }
        );

        animations.push(pathAnimation);
      });
    }

    animationsRef.current = animations;
  }, [animate, scope]);

  const stopAnimation = () => {
    animationsRef.current.forEach((animation) => {
      if (animation) {
        animation.cancel();
      }
    });
    animationsRef.current = [];
  };

  useEffect(() => {
    if (enabled) {
      startAnimation();
      return;
    }

    stopAnimation();

    return () => {
      stopAnimation();
    };
  }, [enabled, startAnimation]);

  return (
    <svg
      ref={scope}
      width="min(40dvw, 208px)"
      height="auto"
      viewBox="0 0 104 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        data-animate
        data-inverse="true"
        d="M123.05 40.2941L66.3864 40.3642L44.2554 40.3916C22.0014 40.4191 3.93863 22.401 3.9111 0.14699V0.14699"
        stroke="url(#paint0_linear_2269_7926)"
        strokeWidth="6"
        strokeDasharray="0.75 1.25"
        strokeDashoffset="0"
      />
      <defs>
        <linearGradient
          id="paint0_linear_2269_7926"
          x1="63.458"
          y1="0.0748389"
          x2="63.5248"
          y2="54.0748"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" />
          <stop offset="1" stopColor="#FF6813" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const DataLink1 = ({ enabled = true }: { enabled?: boolean }) => {
  const [scope, animate] = useAnimate();
  const animationRef = useRef<AnimationPlaybackControls | undefined>(undefined);

  const startAnimation = useCallback(async () => {
    stopAnimation();

    const path = scope.current?.querySelector('path[data-animate]');
    if (path) {
      animationRef.current = animate(
        path,
        { strokeDashoffset: 20 },
        {
          duration: 2.0,
          repeat: Infinity,
          repeatType: 'loop',
          ease: 'linear',
        }
      );
    }
  }, [scope, animate]);

  const stopAnimation = () => {
    if (animationRef.current) {
      animationRef.current.cancel();
    }
  };

  useEffect(() => {
    if (enabled) {
      startAnimation();
      return;
    }

    stopAnimation();

    return () => {
      stopAnimation();
    };
  }, [enabled, startAnimation]);

  return (
    <svg
      ref={scope}
      width="min(80dvw, 542px)"
      height="auto"
      viewBox="0 0 271 132"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        data-animate
        d="M3 131.5V116.463C3 89.9529 24.4903 68.4626 51 68.4626H152C178.51 68.4626 200 46.9723 200 20.4626V0"
        stroke="url(#paint0_linear_2224_7442)"
        strokeWidth="6"
        strokeDasharray="0.75 1.25"
        strokeDashoffset="0"
      />
      <defs>
        <linearGradient
          id="paint0_linear_2224_7442"
          x1="101.5"
          y1="148"
          x2="101.5"
          y2="-5.95451e-05"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" />
          <stop offset="0.745192" stopColor="#FF6813" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const DataLink11 = ({ enabled = true }: { enabled?: boolean }) => {
  const [scope, animate] = useAnimate();
  const animationRef = useRef<AnimationPlaybackControls | undefined>(undefined);

  const startAnimation = useCallback(async () => {
    stopAnimation();

    const path = scope.current?.querySelector('path[data-animate]');
    if (path) {
      animationRef.current = animate(
        path,
        { strokeDashoffset: 20 },
        {
          duration: 2.0,
          repeat: Infinity,
          repeatType: 'loop',
          ease: 'linear',
        }
      );
    }
  }, [scope, animate]);

  const stopAnimation = () => {
    if (animationRef.current) {
      animationRef.current.cancel();
    }
  };

  useEffect(() => {
    if (enabled) {
      startAnimation();
      return;
    }

    stopAnimation();

    return () => {
      stopAnimation();
    };
  }, [enabled, startAnimation]);

  return (
    <svg
      ref={scope}
      width="min(20dvw, 134px)"
      height="auto"
      viewBox="0 0 67 78"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        data-animate
        d="M3 77.8848V71.0488C3 54.2042 16.6553 40.5489 33.5 40.5489V40.5489C50.3447 40.5489 64 26.8935 64 10.0488V-0.000293493"
        stroke="url(#paint0_linear_2269_7698)"
        strokeWidth="6"
        strokeDasharray="0.75 1.25"
        strokeDashoffset="0"
      />
      <defs>
        <linearGradient
          id="paint0_linear_2269_7698"
          x1="33.5"
          y1="87.6574"
          x2="33.5"
          y2="-0.000325184"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" />
          <stop offset="0.745192" stopColor="#FF6813" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const DataLink2 = ({ enabled = true }: { enabled?: boolean }) => {
  const [scope, animate] = useAnimate();
  const animationRef = useRef<AnimationPlaybackControls | undefined>(undefined);

  const startAnimation = useCallback(async () => {
    stopAnimation();

    const path = scope.current?.querySelector('path[data-animate]');
    if (path) {
      animationRef.current = animate(
        path,
        { strokeDashoffset: -20 },
        {
          duration: 2.0,
          repeat: Infinity,
          repeatType: 'loop',
          ease: 'linear',
        }
      );
    }
  }, [scope, animate]);

  const stopAnimation = () => {
    if (animationRef.current) {
      animationRef.current.cancel();
    }
  };

  useEffect(() => {
    if (enabled) {
      startAnimation();
      return;
    }

    stopAnimation();

    return () => {
      stopAnimation();
    };
  }, [enabled, startAnimation]);

  return (
    <Flex
      css={{
        flexShrink: 1,
        minWidth: 0,
        width: '10dvw',
        maxWidth: '202px',
        height: '14px',
        overflow: 'hidden',
      }}
    >
      <svg
        ref={scope}
        width="202"
        height="14"
        viewBox="0 0 101 7"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          flexShrink: 0,
        }}
      >
        <path
          data-animate
          d="M-0.00104523 3.5L101.004 3.5"
          stroke="url(#paint0_linear_2094_13145)"
          strokeWidth="6"
          strokeDasharray="0.75 1.25"
          strokeDashoffset="0"
        />
        <defs>
          <linearGradient
            id="paint0_linear_2094_13145"
            x1="101"
            y1="3.99982"
            x2="-2.98024e-06"
            y2="3.9998"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" />
            <stop offset="1" stopColor="#FF6813" />
          </linearGradient>
        </defs>
      </svg>
    </Flex>
  );
};
