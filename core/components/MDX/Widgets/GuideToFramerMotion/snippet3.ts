const AppCode = `import { motion, useMotionValue, useTransform } from 'framer-motion';
import './scene.css';

const Example = () => {
  const blockVariants = {
    initial: {
      rotate: 0,
    },
    target: {
      rotate: 360,
    },
  };

  const rotate = useMotionValue(0);
  /**
   * Here we tie together the value of "scale" to the value
   * of "rotate"
   * The scale will increase along the rotation, from 0
   * until the rotation reaches 270 degrees ([0, 270])
   * where the scale property will be equal to 1 ([0, 1]).
   * The scale will stop increasing while the rotation
   * finishes its transition
   *
   * You can try to modify the values below, and see how it
   * impacts the resulting transition.
   */
  const scale = useTransform(rotate, [0, 270], [0, 1]);

  return (
    <motion.div
      style={{
        background: 'linear-gradient(90deg,#ffa0ae 0%,#aacaef 75%)',
        height: '100px',
        width: '100px',
        borderRadius: '10px',
        rotate,
        scale,
      }}
      variants={blockVariants}
      initial="initial"
      animate="target"
      transition={{
        ease: 'easeInOut',
        duration: 4,
      }}
    />
  );
};

export default Example;`;

export default AppCode;
