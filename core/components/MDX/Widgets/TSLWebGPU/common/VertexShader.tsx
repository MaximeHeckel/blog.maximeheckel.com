import { Flex, Text } from '@maximeheckel/design-system';
import { useAnimate } from 'motion/react';
import { useRef, useEffect, useCallback } from 'react';

const vertices = [
  { id: 'vertex-1', cx: 100, cy: 5, targetX: 100, targetY: 5 },
  { id: 'vertex-2', cx: 24, cy: 8, targetX: 24, targetY: 8 },
  { id: 'vertex-3', cx: 5, cy: 58, targetX: 5, targetY: 58 },
  { id: 'vertex-4', cx: 127, cy: 66, targetX: 127, targetY: 66 },
];

const edges = ['edge-1', 'edge-2', 'edge-3', 'edge-4', 'edge-5'];

export const VertexShader = ({ enabled = true }: { enabled?: boolean }) => {
  const [scope, animate] = useAnimate();
  const animationsRef = useRef<any[]>([]);

  const startAnimation = useCallback(async () => {
    const animations: any[] = [];

    // Reset vertices to initial state
    vertices.forEach((vertex) => {
      const circle = scope.current?.querySelector(
        `circle[data-vertex="${vertex.id}"]`
      );
      if (circle) {
        // Remove any existing style and reset to initial position
        circle.removeAttribute('style');
        circle.setAttribute('cx', '40');
        circle.setAttribute('cy', '40');
      }
    });

    // Reset edges to initial state
    edges.forEach((edgeId) => {
      const path = scope.current?.querySelector(`path[data-edge="${edgeId}"]`);
      if (path) {
        // Remove any existing style and reset to initial opacity
        path.removeAttribute('style');
        path.setAttribute('opacity', '0');
      }
    });

    // Animate vertices
    vertices.forEach((vertex) => {
      const circle = scope.current?.querySelector(
        `circle[data-vertex="${vertex.id}"]`
      );
      if (circle) {
        const vertexAnimation = animate(
          circle,
          {
            cx: [40, vertex.targetX],
            cy: [40, vertex.targetY],
          },
          {
            delay: 1.5,
            duration: 0.75,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'mirror',
            repeatDelay: 1.5,
          }
        );
        animations.push(vertexAnimation);
      }
    });

    // Animate edges
    edges.forEach((edgeId) => {
      const path = scope.current?.querySelector(`path[data-edge="${edgeId}"]`);
      if (path) {
        const edgeAnimation = animate(
          path,
          { opacity: [0, 1] },
          {
            delay: 1.5,
            duration: 0.75,
            repeat: Infinity,
            repeatType: 'reverse',
            repeatDelay: 1.5,
            ease: 'easeInOut',
          }
        );
        animations.push(edgeAnimation);
      }
    });

    animationsRef.current = animations;
  }, [scope, animate]);

  const stopAnimation = useCallback(() => {
    if (animationsRef.current.length === 0) {
      return;
    }

    animationsRef.current.forEach((animation) => {
      if (animation) {
        animation.cancel();
      }
    });
    animationsRef.current = [];

    // Set final state when stopping animation
    // Move vertices to their target positions
    vertices.forEach((vertex) => {
      const circle = scope.current?.querySelector(
        `circle[data-vertex="${vertex.id}"]`
      );
      if (circle) {
        circle.style.transform = `translate(${vertex.targetX - 40}px, ${vertex.targetY - 40}px)`;
      }
    });

    // Set edges to visible
    edges.forEach((edgeId) => {
      const path = scope.current?.querySelector(`path[data-edge="${edgeId}"]`);
      if (path) {
        path.style.opacity = '1';
      }
    });
  }, [scope]);

  useEffect(() => {
    if (enabled) {
      startAnimation();
      return;
    }
    stopAnimation();

    return () => {
      stopAnimation();
    };
  }, [enabled, startAnimation, stopAnimation]);

  return (
    <Flex
      justifyContent="center"
      direction="column"
      gap="2"
      css={{
        flexShrink: 0,
      }}
    >
      <svg
        ref={scope}
        width="min(35dvw, 264px)"
        height="auto"
        viewBox="0 0 132 71"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          data-edge="edge-1"
          d="M100.504 4.49805L5.00248 57.9981"
          stroke="#5786F5"
          strokeWidth="2.1"
          strokeLinecap="round"
          opacity="0"
        />
        <path
          data-edge="edge-2"
          d="M127.001 65.998L4.99997 57.9985"
          stroke="#5786F5"
          strokeWidth="2.1"
          strokeLinecap="round"
          opacity="0"
        />
        <path
          data-edge="edge-3"
          d="M127.004 66L100.5 4.49805"
          stroke="#5786F5"
          strokeWidth="2.1"
          opacity="0"
        />
        <path
          data-edge="edge-4"
          d="M24.1002 7.9003L100.392 4.41875"
          stroke="#5786F5"
          strokeWidth="2.1"
          strokeLinecap="round"
          opacity="0"
        />
        <path
          data-edge="edge-5"
          d="M24.0022 7.99977L5.00489 58.0005"
          stroke="#5786F5"
          strokeWidth="2.1"
          strokeLinecap="round"
          opacity="0"
        />
        <circle data-vertex="vertex-1" cx="40" cy="40" r="5" fill="white" />
        <circle data-vertex="vertex-2" cx="40" cy="40" r="5" fill="white" />
        <circle data-vertex="vertex-3" cx="40" cy="40" r="5" fill="white" />
        <circle data-vertex="vertex-4" cx="40" cy="40" r="5" fill="white" />
      </svg>
      <Text
        aria-hidden
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
