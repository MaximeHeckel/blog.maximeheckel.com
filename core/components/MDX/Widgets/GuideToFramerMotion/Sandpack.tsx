import Sandpack from '@core/components/Code/Sandpack';

import snippet1 from './snippet1';
import snippet2 from './snippet2';
import snippet3 from './snippet3';
import snippet4 from './snippet4';
import snippet5 from './snippet5';

const SceneCSSDark = `
html {
    background: black;
    color: white;
}

#root {
    width: unset;
    height: unset;
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
          code: SceneCSSDark,
          hidden: true,
        },
      }}
    />
  );
};

export default GuideToFramerMotionSandpack;
