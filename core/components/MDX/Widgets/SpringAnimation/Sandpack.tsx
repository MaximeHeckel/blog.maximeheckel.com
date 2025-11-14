import Sandpack from '@core/components/Code/Sandpack';

const SceneCSSDark = `
html {
    background: black;
}

#root {
    width: unset;
    height: unset;
}`;

const AppCode = `import { motion } from 'framer-motion';
import './scene.css';

const Example = () => {
  return (
    <motion.button
      style={{
        background:
          'linear-gradient(180deg, #ff008c 0%, rgb(211, 9, 225) 100%)',
        color: 'white',
        height: '50px',
        width: '200px',
        borderRadius: '10px',
        border: 'none',
        boxShadow: 'none',
        outline: 'none',
        cursor: 'pointer',
      }}
      whileTap={{
        scale: 1.3,
        borderRadius: '6px',
      }}
      transition={{ type: 'spring', stiffness: 100, damping: 10, mass: 1 }}
    >
      Click me!
    </motion.button>
  );
};

export default Example;`;

const CSSCompositionSandpack = () => {
  return (
    <Sandpack
      autorun
      template="react"
      dependencies={{
        '@stitches/react': '^1.2.7',
        'framer-motion': '6.2.4',
      }}
      files={{
        '/App.js': {
          code: AppCode,
        },
        '/scene.css': {
          code: SceneCSSDark,
          hidden: true,
        },
      }}
    />
  );
};

export default CSSCompositionSandpack;
