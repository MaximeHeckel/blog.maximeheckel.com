const AppCode = `import { motion } from 'framer-motion';
import './scene.css';

const Example = () => {
  const blockVariants = {
    initial: {
      y: -50,
    },
    target: {
      y: 100,
    },
  };

  return (
    <motion.div
      style={{
        background: 'linear-gradient(90deg,#ffa0ae 0%,#aacaef 75%)',
        height: '100px',
        width: '100px',
        borderRadius: '50%',
      }}
      variants={blockVariants}
      initial="initial"
      animate="target"
      transition={{
        ease: 'easeInOut',
        duration: 0.7,
        delay: 1,
        repeat: 3,
        // repeat: Infinity,
        repeatType: 'mirror',
        repeatDelay: 0,
      }}
    />
  );
};

export default Example;`;

export default AppCode;
