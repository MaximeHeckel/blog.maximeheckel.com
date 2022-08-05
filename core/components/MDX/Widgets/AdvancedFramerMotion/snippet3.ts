const AppCode = `import { styled } from '@stitches/react';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import './scene.css';

const SwitchWrapper1 = styled(motion.div, {
  width: '50px',
  height: '30px',
  borderRadius: '20px',
  cursor: 'pointer',
  display: 'flex',
});

const SwitchHandle1 = styled(motion.div, {
  background: '#fff',
  width: '30px',
  height: '30px',
  borderRadius: '50%',
});

// Attempt at a Switch motion component without layout animation: It simply does not work
const Switch1 = () => {
  const [active, setActive] = React.useState(false);

  const switchVariants = {
    initial: {
      backgroundColor: '#111',
    },
    animate: (active) => ({
      backgroundColor: active ? '#f90566' : '#111',
      justifyContent: active ? 'flex-end' : 'flex-start',
    }),
  };

  return (
    <SwitchWrapper1
      initial="initial"
      animate="animate"
      onClick={() => setActive((prev) => !prev)}
      variants={switchVariants}
      custom={active}
    >
      <SwitchHandle1 />
    </SwitchWrapper1>
  );
};

const SwitchWrapper2 = styled('div', {
  width: '50px',
  height: '30px',
  borderRadius: '20px',
  cursor: 'pointer',
  display: 'flex',
  background: '#111',
  justifyContent: 'flex-start',

  '&[data-isactive="true"]': {
    background: '#f90566',
    justifyContent: 'flex-end',
  },
});

const SwitchHandle2 = styled(motion.div, {
  background: '#fff',
  width: '30px',
  height: '30px',
  borderRadius: '50%',
});

// Simpler version of the Switch motion component using layout animation
const Switch2 = () => {
  const [active, setActive] = React.useState(false);

  return (
    <SwitchWrapper2
      data-isactive={active}
      onClick={() => setActive((prev) => !prev)}
    >
      <SwitchHandle2 layout />
    </SwitchWrapper2>
  );
};

const Example = () => (
  <div style={{ maxWidth: '300px' }}>
    <p>
      Switch 1: Attempt at animating justify-content in a Framer Motion animation
      object.
    </p>
    <Switch1 />
    <br />
    <p>
      Switch 2: Animating justify-content using layout animation and the layout prop.
    </p>
    <Switch2 />
  </div>
);

export default Example;`;

export default AppCode;
