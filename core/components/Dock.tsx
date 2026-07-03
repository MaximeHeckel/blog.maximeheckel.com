import { Box, Flex, GlassMaterial, Text } from '@maximeheckel/design-system';
import debounce from 'lodash.debounce';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useRouter } from 'next/router';
import React, {
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react';

import { useIsMobile } from '@core/hooks/useIsMobile';
import { useViewTransitionNavigation } from '@core/hooks/useViewTransitionNavigation';

import { CommandMenuContext } from './CommandMenu/CommandMenuContext';
import Logo from './Logo';

enum NAV {
  INDEX = 'Index',
  ARTICLES = 'Articles',
  CMD = 'Cmd',
  ASK = 'Ask',
}

interface LiquidGlassLens {
  width: number;
  height: number;
  borderRadius: number;
  scale: number;
  depth: number;
  curvature: number;
  chroma: number;
  edgeSize: number;
  refraction: number;
  splay: number;
}

const LIQUID_GLASS_LENS: LiquidGlassLens = {
  width: 250,
  height: 120,
  borderRadius: 150,
  scale: 0.1,
  depth: 10,
  curvature: 0.35,
  chroma: 0.5,
  edgeSize: 15,
  refraction: 4.2,
  splay: 0.35,
};

const generateLiquidGlassMap = (lens: LiquidGlassLens) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = lens.width;
  canvas.height = lens.height;

  if (!context) {
    return '';
  }

  const imageData = context.createImageData(lens.width, lens.height);
  const data = imageData.data;
  const centerX = lens.width / 2;
  const centerY = lens.height / 2;
  const radius = Math.min(lens.borderRadius, lens.width / 2, lens.height / 2);
  const innerWidth = lens.width / 2 - radius;
  const innerHeight = lens.height / 2 - radius;

  for (let y = 0; y < lens.height; y += 1) {
    for (let x = 0; x < lens.width; x += 1) {
      const index = (y * lens.width + x) * 4;
      const px = Math.abs(x - centerX);
      const py = Math.abs(y - centerY);
      const cornerX = Math.max(px - innerWidth, 0);
      const cornerY = Math.max(py - innerHeight, 0);
      const distanceOutsideCorner = Math.hypot(cornerX, cornerY) - radius;
      const isInsideLens = distanceOutsideCorner <= 0;

      if (!isInsideLens) {
        data[index] = 128;
        data[index + 1] = 128;
        data[index + 2] = 128;
        data[index + 3] = 255;
        continue;
      }

      const distanceToEdge = Math.abs(distanceOutsideCorner);
      const edgeProgress = Math.max(
        0,
        1 - Math.min(1, distanceToEdge / lens.edgeSize)
      );
      const cornerAmount = Math.min(1, Math.hypot(cornerX, cornerY) / radius);
      const horizontalSideAmount = py > innerHeight && px <= innerWidth ? 1 : 0;
      const verticalSideAmount = px > innerWidth && py <= innerHeight ? 1 : 0;
      const sideAmount = Math.max(horizontalSideAmount, verticalSideAmount);

      const normalX =
        cornerX > 0
          ? (cornerX / Math.max(1, Math.hypot(cornerX, cornerY))) *
            Math.sign(x - centerX)
          : verticalSideAmount * Math.sign(x - centerX);
      const normalY =
        cornerY > 0
          ? (cornerY / Math.max(1, Math.hypot(cornerX, cornerY))) *
            Math.sign(y - centerY)
          : horizontalSideAmount * Math.sign(y - centerY);
      const edgeBend =
        Math.pow(edgeProgress, 1 / lens.curvature) *
        (0.74 + cornerAmount * 0.64 + sideAmount * 0.24) *
        lens.depth *
        lens.scale;

      data[index] = Math.round(128 + normalX * edgeBend * 127 * lens.splay);
      data[index + 1] = Math.round(128 + normalY * edgeBend * 127);
      data[index + 2] = 128;
      data[index + 3] = 255;
    }
  }

  context.putImageData(imageData, 0, 0);

  return canvas.toDataURL('image/png');
};

const LiquidGlass = () => {
  const generatedId = useId();
  const filterBaseId = useMemo(
    () => generatedId.replace(/[^a-zA-Z0-9_-]/g, ''),
    [generatedId]
  );
  const [displacementMap, setDisplacementMap] = useState('');

  useEffect(() => {
    setDisplacementMap(generateLiquidGlassMap(LIQUID_GLASS_LENS));
  }, []);

  const filterId = `${filterBaseId}-liquid-glass-${displacementMap.length}`;

  return (
    <>
      <Box
        as="svg"
        aria-hidden="true"
        focusable="false"
        height={LIQUID_GLASS_LENS.height}
        viewBox={`0 0 ${LIQUID_GLASS_LENS.width} ${LIQUID_GLASS_LENS.height}`}
        width={LIQUID_GLASS_LENS.width}
        css={{
          position: 'absolute',
          width: 0,
          height: 0,
        }}
      >
        <Box
          as="filter"
          id={filterId}
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          primitiveUnits="userSpaceOnUse"
          x={0}
          y={0}
          width={LIQUID_GLASS_LENS.width}
          height={LIQUID_GLASS_LENS.height}
        >
          <Box
            as="feImage"
            href={displacementMap}
            result="displacementMap"
            width={LIQUID_GLASS_LENS.width}
            height={LIQUID_GLASS_LENS.height}
            preserveAspectRatio="none"
          />
          <Box
            as="feDisplacementMap"
            in="SourceGraphic"
            in2="displacementMap"
            result="redShift"
            scale={
              LIQUID_GLASS_LENS.depth *
              LIQUID_GLASS_LENS.refraction *
              (1 + LIQUID_GLASS_LENS.chroma * 0.28)
            }
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <Box
            as="feDisplacementMap"
            in="SourceGraphic"
            in2="displacementMap"
            result="greenShift"
            scale={LIQUID_GLASS_LENS.depth * LIQUID_GLASS_LENS.refraction}
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <Box
            as="feDisplacementMap"
            in="SourceGraphic"
            in2="displacementMap"
            result="blueShift"
            scale={
              LIQUID_GLASS_LENS.depth *
              LIQUID_GLASS_LENS.refraction *
              (1 - LIQUID_GLASS_LENS.chroma * 0.28)
            }
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <Box
            as="feColorMatrix"
            in="redShift"
            result="red"
            type="matrix"
            values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"
          />
          <Box
            as="feColorMatrix"
            in="greenShift"
            result="green"
            type="matrix"
            values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0"
          />
          <Box
            as="feColorMatrix"
            in="blueShift"
            result="blue"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0"
          />
          <Box
            as="feBlend"
            in="red"
            in2="green"
            mode="screen"
            result="redGreen"
          />
          <Box
            as="feBlend"
            in="redGreen"
            in2="blue"
            mode="screen"
            result="dispersed"
          />
          {/* <Box as="feGaussianBlur" in="dispersed" stdDeviation={0.3} /> */}
        </Box>
      </Box>
      <Box
        as={motion.div}
        aria-hidden="true"
        drag
        dragMomentum={false}
        css={{
          top: 200,
          position: 'relative',
          marginTop: 'var(--space-2)',
          width: LIQUID_GLASS_LENS.width,
          height: LIQUID_GLASS_LENS.height,
          borderRadius: LIQUID_GLASS_LENS.borderRadius,
          overflow: 'hidden',
          isolation: 'isolate',
          cursor: 'grab',
          boxShadow: `
            inset 0 0 0 1px oklch(from var(--gray-1100) l c h / 16%),
            inset 0 1px 1px oklch(from var(--gray-1100) l c h / 35%),
            inset 0 -14px 24px oklch(from var(--gray-100) l c h / 10%),
            0 12px 30px oklch(from var(--gray-1000) l c h / 18%)
          `,

          '&:active': {
            cursor: 'grabbing',
          },

          //specular highlight
          '&::before': {
            content: '',
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            pointerEvents: 'none',
            background: `
              radial-gradient(circle at 28% 20%, oklch(from var(--gray-1100) l c h / 36%), transparent 18%),
              linear-gradient(135deg, oklch(from var(--gray-1100) l c h / 20%), transparent 34%),
              linear-gradient(180deg, oklch(from var(--blue-400) l c h / 12%), oklch(from var(--gray-100) l c h / 5%))
            `,
            opacity: 0.18,
          },

          //rim light / border
          '&::after': {
            content: '',
            position: 'absolute',
            inset: 0,
            zIndex: 3,
            borderRadius: LIQUID_GLASS_LENS.borderRadius - 1,
            pointerEvents: 'none',
            boxShadow: `
              inset 0 2px 2px oklch(from var(--gray-1100) l c h / 38%),
              inset 0 -2px 2px oklch(from var(--blue-400) l c h / 18%)
            `,
          },
        }}
      >
        <Box
          css={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            backdropFilter: displacementMap
              ? `url(#${filterId}) blur(1px) saturate(1.18) brightness(1.08)`
              : 'blur(3px) saturate(1.18) brightness(1.08)',
            WebkitBackdropFilter: displacementMap
              ? `url(#${filterId}) blur(1px) saturate(1.18) brightness(1.08)`
              : 'blur(3px) saturate(1.18) brightness(1.08)',
            backgroundColor: 'oklch(from var(--gray-1100) l c h / 6%)',
            transform: 'translateZ(0)',
          }}
        />
      </Box>
      {/* {displacementMap ? (
        <Box
          alt=""
          aria-hidden="true"
          as="img"
          src={displacementMap}
          css={{
            marginTop: 'var(--space-2)',
            width: LIQUID_GLASS_LENS.width,
            height: LIQUID_GLASS_LENS.height,
            borderRadius: LIQUID_GLASS_LENS.borderRadius,
            imageRendering: 'pixelated',
          }}
        />
      ) : null} */}
    </>
  );
};

const Dock = () => {
  const [focused, setFocused] = useState<NAV | null>(null);
  const [isKeyboardNav, setIsKeyboardNav] = useState(false);
  const router = useRouter();
  const isHomePage = router.pathname === '/';
  const commandMenuContext = useContext(CommandMenuContext);

  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const { navigateWithViewTransition } = useViewTransitionNavigation();

  const navItems = Object.values(NAV);
  const navActions = {
    [NAV.INDEX]: (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (isHomePage) {
        document.getElementById('index')?.scrollIntoView({
          behavior: shouldReduceMotion || isMobile ? 'auto' : 'smooth',
          block: 'center',
        });
      } else {
        navigateWithViewTransition('/');
      }
    },
    [NAV.ARTICLES]: (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (isHomePage) {
        document.getElementById('articles')?.scrollIntoView({
          behavior: shouldReduceMotion || isMobile ? 'auto' : 'smooth',
          block: 'start',
        });
      } else {
        navigateWithViewTransition('/#articles');
      }
    },
    [NAV.CMD]: () => {
      commandMenuContext?.openCommandMenu?.();
    },
    [NAV.ASK]: () => {
      commandMenuContext?.openAIMode?.();
    },
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    setIsKeyboardNav(true);
    const currentIndex = focused ? navItems.indexOf(focused) : 0;

    switch (event.code) {
      case 'ArrowRight':
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % navItems.length;
        setFocused(navItems[nextIndex]);
        (
          document.querySelector(
            `[data-nav-item="${navItems[nextIndex]}"]`
          ) as HTMLElement
        )?.focus();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        const prevIndex =
          currentIndex - 1 < 0 ? navItems.length - 1 : currentIndex - 1;
        setFocused(navItems[prevIndex]);
        (
          document.querySelector(
            `[data-nav-item="${navItems[prevIndex]}"]`
          ) as HTMLElement
        )?.focus();
        break;
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetFocused = useCallback(
    debounce((value: NAV | null) => {
      setFocused(value);
    }, 100),
    []
  );

  return (
    <>
      <Flex
        css={{
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <Box
          as="nav"
          css={{
            position: 'relative',
            '--thickness': '1.5px',
            borderRadius: 'var(--border-radius-2)',
            // Force own compositing layer to prevent backdrop-filter flickering
            // when GPU-heavy elements (WebGL canvases) are on the page
            transform: 'translateZ(0)',
            isolation: 'isolate',
          }}
        >
          <GlassMaterial />
          <Flex
            as="ul"
            css={{
              width: 'fit-content',
              margin: 0,
              padding: 8,
              gap: 0,
            }}
            onMouseLeave={() => {
              debouncedSetFocused(null);
              setIsKeyboardNav(false);
            }}
            onMouseMove={() => {
              if (isKeyboardNav) {
                setIsKeyboardNav(false);
              }
            }}
          >
            <Flex
              as="li"
              css={{
                paddingLeft: 4,
                // optical alignment
                marginBottom: 1,
              }}
            >
              <Logo alt="Logo" size={24} />
              <Box
                css={{
                  width: 1,
                  height: 24,
                  backgroundColor: 'oklch(from var(--blue-500) l c h / 25%)',
                  marginLeft: 12,
                  marginRight: 4,
                }}
              />
            </Flex>
            {navItems.map((item) => (
              <Box
                as="li"
                key={item}
                css={{
                  listStyle: 'none',
                }}
              >
                <Box
                  as="button"
                  css={{
                    background: 'transparent',
                    display: 'block',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    padding: '0 12px',
                    textDecoration: 'none',
                    outline: 'none',
                    WebkitTapHighlightColor: 'transparent',
                    '&:active': {
                      background: 'transparent',
                    },
                  }}
                  data-testid={`${item.toLowerCase()}-link`}
                  tabIndex={0}
                  data-nav-item={item}
                  onKeyDown={handleKeyDown}
                  onClick={navActions[item]}
                  onMouseEnter={() =>
                    !isKeyboardNav && debouncedSetFocused(item)
                  }
                  onFocus={() => debouncedSetFocused(item)}
                >
                  <Text size="2" variant="primary" weight="4">
                    {item}
                  </Text>
                  <AnimatePresence>
                    {focused === item ? (
                      <motion.div
                        layoutId={shouldReduceMotion ? undefined : 'highlight'}
                        transition={{
                          layout: {
                            type: 'spring',
                            stiffness: 250,
                            damping: 27,
                            mass: 1,
                          },
                        }}
                        exit={{ '--opacity': 0 }}
                        animate={{ '--opacity': 0.2 }}
                        initial={{
                          '--opacity': 0,
                        }}
                        style={{
                          position: 'absolute',
                          top: -1,
                          left: 0,
                          width: '100%',
                          height: '26px',
                          zIndex: 0,
                        }}
                      >
                        <Box
                          css={{
                            backdropFilter: 'blur(2px)',
                            borderRadius: 8,
                            width: '100%',
                            height: '100%',

                            '@media (pointer: coarse)': {
                              display: 'none',
                            },
                          }}
                          style={{
                            background: 'var(--blue-400)',
                            opacity: 'var(--opacity)',
                          }}
                        />
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </Box>
              </Box>
            ))}
          </Flex>
        </Box>
        <LiquidGlass />
      </Flex>
    </>
  );
};

export { Dock };
