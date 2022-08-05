const AppCode = `import { motion } from 'framer-motion';
import './scene.css';

const Example = () => {
  const replies = [
    {
      id: '1',
      photo: '🐶',
    },
    {
      id: '2',
      photo: '🐱',
    },
    {
      id: '3',
      photo: '🐰',
    },
    {
      id: '4',
      photo: '🐭',
    },
    {
      id: '5',
      photo: '🐹',
    },
    {
      id: '6',
      photo: '🦊',
    },
    {
      id: '7',
      photo: '🐻',
    },
    {
      id: '8',
      photo: '🐼',
    },
    {
      id: '9',
      photo: '🐨',
    },
  ];

  const list = {
    visible: {
      opacity: 1,
      transition: {
        // delayChildren: 1.5,
        staggerChildren: 0.1,
      },
    },
    hidden: {
      opacity: 0,
    },
  };

  const item = {
    visible: { opacity: 1, x: 0 },
    hidden: { opacity: 0, x: -10 },
  };

  return (
    <>
      <h4>Already {replies.length} furry friends liked this post!</h4>
      <motion.ul
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          marginLeft: '0px',
          marginBottom: '8px',
          marginTop: '15px',
          paddingLeft: '0px',
        }}
        initial="hidden"
        animate="visible"
        variants={list}
      >
        {replies.map((reply) => (
          <motion.li
            style={{
              listStyle: 'none',
              marginRight: '-10px',
            }}
            key={reply.id}
            data-testid={reply.id}
            variants={item}
            whileHover={{
              // scale: 1.2,
              marginRight: '5px',
              transition: { ease: 'easeOut' },
            }}
          >
            <div
              style={{
                background: 'linear-gradient(90deg,#ffa0ae 0%,#aacaef 75%)',
                height: '50px',
                width: '50px',
                borderRadius: '50%',
                border: '3px solid #4C79DF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '38px',
              }}
            >
              <span role="img" style={{ paddingRight: 0 }}>
                {reply.photo}
              </span>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </>
  );
};

export default Example;`;

export default AppCode;
