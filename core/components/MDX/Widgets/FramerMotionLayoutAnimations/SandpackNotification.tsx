import { useTheme } from '@maximeheckel/design-system';
import Sandpack from '@theme/components/Code/Sandpack';

const AppCode = `import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { Wrapper, Toast } from './Components';
import './scene.css';

const ITEMS = ['Welcome 👋', 'An error occurred 💥', 'You did it 🎉!', 'Success ✅', 'Warning ⚠️'];

const Notifications = () => {
  const [notifications, setNotifications] = React.useState(ITEMS)

  return (
    <Wrapper> 
      <AnimatePresence>
        {notifications.map((item) => 
            <motion.div
              key={item}
              onClick={() => setNotifications((prev) => prev.filter(notification => notification !== item))}
              layout
              initial={{
                y: 150,
                x: 0,
                opacity: 0,
              }} 
              animate={{
                y: 0,
                x: 0,
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
            >
              <Toast>{item}</Toast>
            </motion.div> 
        )}   
      </AnimatePresence>
    </Wrapper>
  );
}

export default Notifications
`;

const ComponentsCode = `import { styled } from '@stitches/react';

export const Wrapper = styled('div', {
    position: 'fixed',
    bottom: '50px',
    left: '50%',
    right: '0',
    transform: 'translateX(-50%)',
})

export const Toast = styled('div', {
    background: '#1A1D23',
    borderRadius: '8px',
    border: '1px solid #2B303B',
    width: '200px',
    color: '#C4C9D4',
    padding: '8px 16px',
    marginBottom: '12px',
    userSelect: 'none',
    cursor: 'pointer',
})
`;

const SceneCSSDark = `
html {
    background: #20222B;
}

canvas {
    width: 100vw;
    height: 100vh;
}`;

const SceneCSSLight = `
html {
    background: #F7F7FB;
}

canvas {
    width: 100vw;
    height: 100vh;
}`;

const SandpackNotification = () => {
  const { dark } = useTheme();

  return (
    <Sandpack
      template="react"
      dependencies={{
        'framer-motion': '6.2.4',
        '@stitches/react': '1.2.5',
      }}
      files={{
        '/App.js': {
          code: AppCode,
        },
        '/Components.js': {
          code: ComponentsCode,
        },
        '/scene.css': {
          code: dark ? SceneCSSDark : SceneCSSLight,
          hidden: true,
        },
      }}
    />
  );
};

export default SandpackNotification;
