import { Flex, Text } from '@maximeheckel/design-system';
import { AnimationPlaybackControls, useAnimate } from 'motion/react';
import { useRef, useEffect, useCallback } from 'react';

export const ParticleVertexShader = ({
  enabled = true,
}: {
  enabled?: boolean;
}) => {
  const [scope, animate] = useAnimate();
  const animationRef = useRef<AnimationPlaybackControls[] | undefined>(
    undefined
  );

  const startAnimation = useCallback(async () => {
    const animations: AnimationPlaybackControls[] | undefined = [];
    const dots = scope.current?.querySelectorAll('circle[data-animate]');
    if (dots) {
      dots.forEach((dot: HTMLElement, index: number) => {
        const initialY = parseFloat(dot.getAttribute('cy') || '0');
        const phaseOffset = (index * Math.PI) / 8; // Progressive phase offset

        // Use the same logic as createDotAnimation
        const amplitude = 8;
        const steps = 15;
        const animationValues = [];

        for (let i = 0; i <= steps; i++) {
          const t = (i / steps) * 2 * Math.PI + phaseOffset;
          animationValues.push(initialY + amplitude * Math.sin(t));
        }

        const animation = animate(
          dot,
          {
            cy: animationValues,
          },
          {
            duration: 1.5,
            repeat: Infinity,
          }
        );
        animations.push(animation);
      });
    }

    // Store animations to cancel later
    animationRef.current = animations;
  }, [scope, animate]);

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.forEach((animation: AnimationPlaybackControls) => {
        animation.cancel();
      });
      animationRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      startAnimation();
      return;
    }
    stopAnimation();
  }, [enabled, startAnimation, stopAnimation]);

  return (
    <Flex direction="column" gap="2">
      <svg
        ref={scope}
        width="350"
        height="150"
        viewBox="0 0 100 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          maskImage:
            'radial-gradient(ellipse 90% 75% at 50% 50%, black 0%, transparent 90%)',
        }}
      >
        <defs>
          <radialGradient id="circleGradient" cx="50%" cy="50%" r="50%">
            <stop offset="30%" stopColor="#5786F5" stopOpacity="1" />
            <stop offset="100%" stopColor="#5786F5" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle data-animate cx="2" cy="15" r="2" fill="url(#circleGradient)" />
        <circle data-animate cx="5" cy="32" r="2" fill="url(#circleGradient)" />
        <circle data-animate cx="8" cy="12" r="2" fill="url(#circleGradient)" />
        <circle
          data-animate
          cx="11"
          cy="38"
          r="2"
          fill="url(#circleGradient)"
        />
        <circle
          data-animate
          cx="14"
          cy="22"
          r="2"
          fill="url(#circleGradient)"
        />
        <circle data-animate cx="17" cy="8" r="2" fill="url(#circleGradient)" />
        <circle
          data-animate
          cx="20"
          cy="35"
          r="2"
          fill="url(#circleGradient)"
        />
        <circle
          data-animate
          cx="23"
          cy="18"
          r="2"
          fill="url(#circleGradient)"
        />
        <circle
          data-animate
          cx="26"
          cy="42"
          r="2"
          fill="url(#circleGradient)"
        />
        <circle
          data-animate
          cx="29"
          cy="28"
          r="2"
          fill="url(#circleGradient)"
        />
        <circle
          data-animate
          cx="32"
          cy="11"
          r="2"
          fill="url(#circleGradient)"
        />
        <circle
          data-animate
          cx="35"
          cy="39"
          r="2"
          fill="url(#circleGradient)"
        />
        <circle
          data-animate
          cx="38"
          cy="19"
          r="2"
          fill="url(#circleGradient)"
        />
        <circle
          data-animate
          cx="41"
          cy="33"
          r="2"
          fill="url(#circleGradient)"
        />
        <circle data-animate cx="44" cy="9" r="2" fill="url(#circleGradient)" />
        <circle
          data-animate
          cx="47"
          cy="41"
          r="2"
          fill="url(#circleGradient)"
        />
        <circle
          data-animate
          cx="50"
          cy="24"
          r="2"
          fill="url(#circleGradient)"
        />
        <circle
          data-animate
          cx="53"
          cy="16"
          r="2"
          fill="url(#circleGradient)"
        />
        <circle
          data-animate
          cx="56"
          cy="37"
          r="2"
          fill="url(#circleGradient)"
        />
        <circle
          data-animate
          cx="59"
          cy="13"
          r="2"
          fill="url(#circleGradient)"
        />
        <circle
          data-animate
          cx="62"
          cy="30"
          r="2"
          fill="url(#circleGradient)"
        />
        <circle
          data-animate
          cx="65"
          cy="21"
          r="2"
          fill="url(#circleGradient)"
        />
        <circle
          data-animate
          cx="68"
          cy="44"
          r="2"
          fill="url(#circleGradient)"
        />
        <circle
          data-animate
          cx="71"
          cy="27"
          r="2"
          fill="url(#circleGradient)"
        />
        <circle
          data-animate
          cx="74"
          cy="10"
          r="2"
          fill="url(#circleGradient)"
        />
        <circle
          data-animate
          cx="77"
          cy="36"
          r="2"
          fill="url(#circleGradient)"
        />
        <circle
          data-animate
          cx="80"
          cy="17"
          r="2"
          fill="url(#circleGradient)"
        />
        <circle
          data-animate
          cx="83"
          cy="40"
          r="2"
          fill="url(#circleGradient)"
        />
        <circle
          data-animate
          cx="86"
          cy="25"
          r="2"
          fill="url(#circleGradient)"
        />
        <circle
          data-animate
          cx="89"
          cy="14"
          r="2"
          fill="url(#circleGradient)"
        />
        <circle
          data-animate
          cx="92"
          cy="31"
          r="2"
          fill="url(#circleGradient)"
        />
        <circle
          data-animate
          cx="95"
          cy="20"
          r="2"
          fill="url(#circleGradient)"
        />
        <circle
          data-animate
          cx="98"
          cy="38"
          r="2"
          fill="url(#circleGradient)"
        />
      </svg>
      <Text
        css={{ textTransform: 'uppercase' }}
        variant="primary"
        family="mono"
        size="2"
      >
        Vertex Shader
      </Text>
    </Flex>
  );
};
