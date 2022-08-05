import Sandpack from '@theme/components/Code/Sandpack';
import snippet1 from './snippet1';
import snippet2 from './snippet2';
import snippet3 from './snippet3';
import snippet4 from './snippet4';

const SceneCSSDark = `
html {
    background: #20222B;
    color: white;
}

canvas {
    width: 100vw;
    height: 100vh;
}`;

const PillCode = `import { styled } from '@stitches/react';

const Pill = styled('span', {
  display: 'inline-flex !important',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '5px 8px !important',
  minWidth: '40px',
  fontSize: '12px',
  fontWeight: '500',
  cursor: 'default',
  userSelect: 'none',
  borderRadius: '8px',

  background: 'var(--pill-background)',
  color: 'var(--pill-color)',

  variants: {
    variant: {
      info: {
        '--pill-background': 'hsla(222, 89%, 65%, 10%)',
        '--pill-color': 'hsla(222, 89%, 65%, 100%)',
      },
      success: {
        '--pill-background': 'hsla(16, 100%, 55%, 15%)',
        '--pill-color': 'hsla(16, 100%, 55%, 100%)',
      },
      warning: {
        '--pill-background': 'hsla(42, 100%, 55%, 15%)',
        '--pill-color': 'hsla(42, 100%, 55%)',
      },
      danger: {
        '--pill-background': 'hsla(0, 95%, 60%, 15%)',
        '--pill-color': 'hsla(0, 95%, 70%, 100%)',
      },
    },
  },
});

export default Pill;
`;

const SNIPPETS = {
  snippet1,
  snippet2,
  snippet3,
  snippet4,
};

const GuideToFramerMotionSandpack = (props: any) => {
  const { snippet } = props;

  return (
    <Sandpack
      autorun
      template="react"
      dependencies={{
        'framer-motion': '6.2.4',
        '@stitches/react': '^1.2.7',
      }}
      files={{
        '/App.js': {
          // @ts-ignore
          code: SNIPPETS[snippet],
        },
        '/Pill.js': {
          code: PillCode,
          hidden: true,
        },
        '/scene.css': {
          code: SceneCSSDark,
          hidden: true,
        },
      }}
    />
  );
};

export default GuideToFramerMotionSandpack;
