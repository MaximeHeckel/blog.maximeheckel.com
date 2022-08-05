const AppCode = `import { styled } from '@stitches/react';
import { motion } from 'framer-motion';
import './scene.css';

const ListItem = styled(motion.li, {
  width: '100%',
  minWidth: '300px',
  background: 'hsla(222, 89%, 65%, 10%)',
  boxShadow: '0 0px 10px -6px rgba(0, 24, 40, 0.3)',
  borderRadius: '8px',
  padding: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
  marginBottom: '0px',
  color: 'hsl(223, 15%, 65%)',
  fontSize: 18,
});

const Button = styled('button', {
  background: 'transparent',
  cursor: 'pointer',
  border: 'none',
  shadow: 'none',
  color: 'hsl(223, 15%, 65%)',
  display: 'flex',
});

const InfoBox = styled('div', {
  width: '50%',
});

const ARTICLES = [
  {
    category: 'swift',
    title: 'Intro to SwiftUI',
    description: 'An article with some SwitftUI basics',
    id: 1,
  },
];

const Item = (props) => {
  const { article } = props;

  const readButtonVariants = {
    hover: {
      opacity: 1,
    },
    // Uncomment the variant below and comment the variant above and notice the button will not show up on hover
    /*  hoverme: {
        opacity: 1,
      },
    */
    initial: {
      opacity: 0,
    },
    magic: {
      rotate: 360,
      opacity: 1,
    },
  };

  return (
    <ListItem layout initial="initial" whileHover="hover">
      <InfoBox>{article.title}</InfoBox>
      <motion.div
        // Uncomment me and notice the button now rotates and is always visible
        // animate="magic"
        variants={readButtonVariants}
        transition={{ duration: 0.25 }}
      >
        <Button
          aria-label="read article"
          title="Read article"
          onClick={(e) => e.preventDefault()}
        >
          &#8594;
        </Button>
      </motion.div>
    </ListItem>
  );
};

const Example = () => <Item article={ARTICLES[0]} />;

export default Example;`;

export default AppCode;
