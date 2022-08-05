const AppCode = `import { styled } from '@stitches/react';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import Pill from './Pill';
import './scene.css';

const List = styled(motion.ul, {
  padding: '16px',
  width: '350px',
  background: ' hsl(223, 15%, 10%)',
  borderRadius: '8px',
  display: 'grid',
  gap: '16px',
});


const ListItem = styled(motion.li, {
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

const FilterWrapper = styled('div', {
  marginBottom: '16px',
  input: {
    marginRight: '4px',
  },
  label: {
    marginRight: '4px',
  },
});

const ARTICLES = [
  {
    category: 'swift',
    title: 'Intro to SwiftUI',
    description: 'An article with some SwitftUI basics',
    id: 1,
  },
  {
    category: 'js',
    title: 'Awesome React stuff',
    description: 'My best React tips!',
    id: 2,
  },
  {
    category: 'js',
    title: 'Styled components magic',
    description: 'Get to know ways to use styled components',
    id: 3,
  },
  {
    category: 'ts',
    title: 'A guide to Typescript',
    description: 'Type your React components!',
    id: 4,
  },
];

const categoryToVariant = {
  js: 'warning',
  ts: 'info',
  swift: 'danger',
};

const Item = (props) => {
  const { article, showCategory } = props;

  const readButtonVariants = {
    hover: {
      opacity: 1,
    },
    initial: {
      opacity: 0,
    },
  };

  return (
    <ListItem initial="initial" whileHover="hover">
      <InfoBox>{article.title}</InfoBox>
      {/* Try to remove/comment the AnimatePresence component below! */}
      <AnimatePresence>
        {showCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            // initial={{ opacity: 0, scale: 1}}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // exit={{ opacity: 0, scale: 0, }}
          >
            <Pill variant={categoryToVariant[article.category]}>
              {article.category}
            </Pill>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div variants={readButtonVariants} transition={{ duration: 0.25 }}>
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

const Component = () => {
  const [showCategory, setShowCategory] = React.useState(false);

  return (
    <>
      <FilterWrapper>
        <div>
          <input
            type="checkbox"
            id="showCategory"
            checked={showCategory}
            onChange={() => setShowCategory((prev) => !prev)}
          />
          <label htmlFor="showCategory">Show Category</label>
        </div>
      </FilterWrapper>
      <List>
        {ARTICLES.map((article) => (
          <Item
            key={article.id}
            article={article}
            showCategory={showCategory}
          />
        ))}
      </List>
    </>
  );
};

export default Component;`;

export default AppCode;
