import { useTheme } from '@maximeheckel/design-system';
import Sandpack from '@theme/components/Code/Sandpack';
import snippet1 from './snippet1';
import snippet2 from './snippet2';
import snippet3 from './snippet3';
import snippet4 from './snippet4';
import snippet5 from './snippet5';

const SceneCSSDark = `
html {
    background: #20222B;
    color: white;
}

canvas {
    width: 100vw;
    height: 100vh;
}`;

const SceneCSSLight = `
html {
    background: #F7F7FB;
    color: black;
}

canvas {
    width: 100vw;
    height: 100vh;
}`;

const SNIPPETS = {
  snippet1,
  snippet2,
  snippet3,
  snippet4,
  snippet5,
};

const GuideToFramerMotionSandpack = (props: any) => {
  const { snippet } = props;
  const { dark } = useTheme();

  return (
    <Sandpack
      autorun
      template="react"
      dependencies={{
        'framer-motion': '6.2.4',
      }}
      files={{
        '/App.js': {
          // @ts-ignore
          code: SNIPPETS[snippet],
        },
        '/scene.css': {
          code: dark ? SceneCSSDark : SceneCSSLight,
          hidden: true,
        },
      }}
    />
  );
};

export default GuideToFramerMotionSandpack;
