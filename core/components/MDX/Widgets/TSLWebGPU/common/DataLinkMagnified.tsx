import { Box, Text } from '@maximeheckel/design-system';
import { useAnimate } from 'motion/react';
import { useRef, useEffect, useCallback } from 'react';

import { seededRandom } from './util';

export const DataLinkMagnified = (props: {
  enabled?: boolean;
  repeat?: number;
}) => {
  const { enabled = true, repeat = Infinity } = props;
  const [scope, animate] = useAnimate();
  const animationsRef = useRef<any[]>([]);

  const randomNumArray = Array.from({ length: 9 }, (_, i) =>
    seededRandom(i + 1).toFixed(1)
  );

  const startAnimation = useCallback(async () => {
    stopAnimation();

    const animations: any[] = [];

    // Animate the rotating data items
    const dataItems = scope.current?.querySelectorAll('[data-rotate]');
    if (dataItems) {
      dataItems.forEach((item: any) => {
        const baseAngle = parseFloat(
          item.getAttribute('data-base-angle') || '0'
        );

        const rotateAnimation = animate(
          item,
          { rotate: [baseAngle, baseAngle + 90] },
          {
            duration: 5,
            repeat,
            ease: 'linear',
          }
        );

        animations.push(rotateAnimation);
      });
    }

    // Animate the data link paths
    const paths = scope.current?.querySelectorAll('path[data-animate]');
    if (paths) {
      paths.forEach((path: any) => {
        const isInverse = path.getAttribute('data-inverse') === 'true';

        const pathAnimation = animate(
          path,
          { strokeDashoffset: isInverse ? -20 : 20 },
          {
            duration: 1.0,
            repeat: repeat + 4,
            repeatType: 'loop',
            ease: 'linear',
          }
        );

        animations.push(pathAnimation);
      });
    }

    animationsRef.current = animations;
  }, [animate, scope, repeat]);

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
    <Box ref={scope} css={{ position: 'relative' }}>
      <Box
        data-wrapper
        css={{
          position: 'absolute',
          right: 0,
          width: 'min(30dvw, 150px)',
          height: 'min(30dvw, 150px)',
          maskImage:
            'linear-gradient(to right, transparent, black 30%, black 70%, transparent)',
        }}
      >
        {[...randomNumArray, ...randomNumArray, ...randomNumArray].map(
          (item, index) => {
            const totalItems = randomNumArray.length * 3;
            const radius = 300;

            const angleStep = (Math.PI * 2) / totalItems;
            const baseAngle = index * angleStep;
            const baseAngleDegrees = (baseAngle * 180) / Math.PI;

            const centerX = 0;
            const centerY = 40;

            return (
              <div
                key={`${item}-${index}`}
                data-rotate
                data-base-angle={baseAngleDegrees}
                style={{
                  position: 'absolute',
                  left: `${centerX}px`,
                  top: `${centerY}px`,
                  width: '30px',
                  height: '30px',
                  background: 'var(--accent)',
                  borderRadius: 'var(--border-radius-1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transformOrigin: `0 ${radius}px`,
                  rotate: `${baseAngleDegrees}deg`,
                }}
              >
                <Text css={{ fontSize: 10 }} variant="primary" family="mono">
                  {item}
                </Text>
              </div>
            );
          }
        )}
      </Box>
      <svg
        key={enabled ? 'enabled' : 'disabled'}
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
        <circle cx="136" cy="40" r="39.5" fill="black" stroke="white" />
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
        <g mask="url(#mask0_2252_7518)">
          <path
            data-animate
            data-inverse="false"
            d="M167.354 82.037L164.854 79.3411C145.039 57.9791 115.614 48.3364 86.9996 53.8277V53.8277"
            stroke="url(#paint1_linear_2252_7518)"
            strokeWidth="24"
            strokeDasharray="1.75 2.25"
            strokeDashoffset="0"
          />
        </g>
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
    </Box>
  );
};
