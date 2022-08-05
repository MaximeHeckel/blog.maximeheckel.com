const AppCode = `import { styled } from '@stitches/react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
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

const Title = motion.div;

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
  const { article, showCategory, expanded, onClick } = props;

  const readButtonVariants = {
    hover: {
      opacity: 1,
    },
    initial: {
      opacity: 0,
    },
  };

  return (
    <ListItem layout initial="initial" whileHover="hover" onClick={onClick}>
      <InfoBox>
        {/*
          Try to add the "layout" prop to this motion component
          and notice how it now gracefully moves as the list
          item expands
        */}
        <Title
        //layout
        >
          {article.title}
        </Title>
        <AnimatePresence>
          {expanded && (
            <motion.div
              style={{ fontSize: '12px' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {article.description}
            </motion.div>
          )}
        </AnimatePresence>
      </InfoBox>
      <AnimatePresence>
        {showCategory && (
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Pill variant={categoryToVariant[article.category]}>
              {article.category}
            </Pill>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        layout
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

const Component = () => {
  const [showCategory, setShowCategory] = React.useState(false);
  const [sortBy, setSortBy] = React.useState('title');
  const [expanded, setExpanded] = React.useState(null);

  const onSortChange = (event) => setSortBy(event.target.value);

  const articlesToRender = ARTICLES.sort((a, b) => {
    const itemA = a[sortBy].toLowerCase();
    const itemB = b[sortBy].toLowerCase();

    if (itemA < itemB) {
      return -1;
    }
    if (itemA > itemB) {
      return 1;
    }
    return 0;
  });

  return (
    <>
      <FilterWrapper>
        <div>
          <input
            type="checkbox"
            id="showCategory2"
            checked={showCategory}
            onChange={() => setShowCategory((prev) => !prev)}
          />
          <label htmlFor="showCategory2">Show Category</label>
        </div>
        <div>
          Sort by:{' '}
          <input
            type="radio"
            id="title"
            name="sort"
            value="title"
            checked={sortBy === 'title'}
            onChange={onSortChange}
          />
          <label htmlFor="title">Title</label>
          <input
            type="radio"
            id="category"
            name="sort"
            value="category"
            checked={sortBy === 'category'}
            onChange={onSortChange}
          />
          <label htmlFor="category">Category</label>
        </div>
      </FilterWrapper>
      {/*
        Since each layout animation in this list affect each other's layout
        we have to wrap them in a \`LayoutGroup\`
        Try to remove it! You should see that:
        - without it concurrent layout animations when clicking on list 
        items end up being "choppy" 
        - with it concurrent layout animations when clicking on list items 
        are more graceful
      */}
      <LayoutGroup>
        <List layout>
          {articlesToRender.map((article) => (
            <Item
              key={article.id}
              expanded={expanded === article.id}
              onClick={() => setExpanded(article.id)}
              article={article}
              showCategory={showCategory}
            />
          ))}
        </List>
      </LayoutGroup>
    </>
  );
};

export default Component;`;

export default AppCode;
