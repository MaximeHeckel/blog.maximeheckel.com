import Sandpack from '@core/components/Code/Sandpack';

const SceneCSSDark = `html {
    background: black;
    color: white;
}

canvas {
    width: 100vw;
    height: 100vh;
}`;

const AppCode = `import { motion } from 'framer-motion';
import './scene.css';

const WavingHand = () => {
  console.log('hello world');

  return (
    <motion.div
      style={{
        marginBottom: '-20px',
        marginRight: '-45px',
        paddingBottom: '20px',
        paddingRight: '45px',
        display: 'inline-block',
      }}
      animate={{ rotate: 20 }}
      transition={{
        yoyo: Infinity,
        from: 0,
        duration: 0.2,
        ease: 'easeInOut',
        type: 'tween',
      }}
    >
      👋
    </motion.div>
  );
};

const Hi = () => (
  <h1>
    Hi <WavingHand /> !
  </h1>
);

export default Hi;`;

const CSSCompositionSandpack = () => {
  return (
    <Sandpack
      autorun
      template="react"
      dependencies={{
        'framer-motion': '6.2.4',
      }}
      files={{
        '/App.js': {
          code: AppCode,
        },
        '/scene.css': {
          code: SceneCSSDark,
        },
      }}
    />
  );
};

export default CSSCompositionSandpack;
