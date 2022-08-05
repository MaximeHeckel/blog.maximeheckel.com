const AppCode = `import { motion } from 'framer-motion';
import React from 'react';
import './scene.css';

const Example = () => {
  const [isClicked, setIsClicked] = React.useState(false);

  React.useEffect(() => {
    if (isClicked) {
      setTimeout(() => setIsClicked(false), 3000);
    }
  }, [isClicked]);

  const duration = 0.6;
  const buttonVariants = {
    hover: {
      /**
       * Combining different animation in variants works the same way it works
       * for inline animation objects
       *
       * For the first example, to make the button scale, you simply have to
       * uncomment the following. Once done, hover the button and notice how
       * it now double in size!
       */
      // scale: 2,
      rotate: 360,
    },
    pressed: {
      scale: 0.95,
    },
    clicked: {
      scale: 1,
    },
    notClicked: {
      scale: 1,
    },
  };

  /**
   * Comment the buttonvariants object above and
   * uncomment the one below to try out the second
   * example:
   *
   * - the button will not scale back to its basic size once clicked
   * - once clicked, the hover animation will not happen. It will use
   * the "isClicked" custom prop passed to the button component below
   */

  /* 
  const buttonVariants = {
    hover: (isClicked) => ({
      scale: isClicked ? 2 : 3,
      rotate: isClicked ? 0 : 360,
    }),
    pressed: {
      scale: 0.95,
    },
    clicked: {
      scale: 2,
    },
    notClicked: {
      scale: 1,
    },
  };
  */

  return (
    <motion.button
      style={{
        background: 'linear-gradient(90deg,#ffa0ae 0%,#aacaef 75%)',
        color: 'black',
        border: 'none',
        height: '50px',
        width: '200px',
        borderRadius: '10px',
        cursor: isClicked ? 'default' : 'pointer',
        outline: 'none',
        boxShadow: '6px 4px 12px -6px rgba(0,24,40,0.25)',
      }}
      aria-label="Click Me!"
      title="Click Me!"
      onClick={() => {
        setIsClicked(true);
      }}
      /**
       * Here we pass the buttonVariants object as variants. It contains 4
       * different target objects
       * - hover: which is used for the whileHover prop
       * - pressed: which is used for the whileTap prop
       * - clicked and notClicked which are respecively used for animate prop
       * when the button is clicked and not clicked (based on the state of the
       * button)
       *
       * Reference to these animation objects are passed as strings to their
       * props
       *
       * e.g. whileHover="hover"
       */
      variants={buttonVariants}
      animate={isClicked ? 'clicked' : 'notClicked'}
      whileHover="hover"
      whileTap="pressed"
      /**
       * Uncomment the following to allow our buttonVariants objects to know
       * about the status of the button.
       *
       * This lets us redefine variants based on the status button
       */
      // custom={isClicked}
      transition={{
        duration,
      }}
    >
      {isClicked ? 'Clicked!' : 'Click Me!'}
    </motion.button>
  );
};

export default Example;`;

export default AppCode;
