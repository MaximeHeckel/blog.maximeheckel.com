import { useTheme } from '@maximeheckel/design-system';
import Sandpack from '@theme/components/Code/Sandpack';

const ComponentsCode = `import { styled } from '@stitches/react';

export const List = styled('ul', {
    display: 'flex',
    gap: '12px',
    padding: 0,
})

export const Item = styled('li', {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    color: '#98A0B3',
    userSelect: 'none',
});

export const ArrowIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    {...props}
  >
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);
`;

const AppCode = `import { motion } from 'framer-motion';
import React from 'react';
import { List, Item, ArrowIcon } from './Components';
import './scene.css';

const ITEMS = [1, 2, 3];

const SelectableList = () => {
  const [selected, setSelected] = React.useState(1);

  return (
    <List>
      {ITEMS.map(item => (
        <Item 
          onClick={() => setSelected(item)}  
          onKeyDown={(event: { key: string }) => event.key === 'Enter' ? setSelected(item) : null} 
          tabIndex={0}
        >
          
          <div>Item {item}</div>
          {item === selected ? 
            <motion.div layoutId="arrow">
               <ArrowIcon
                style={{
                  height: '24px',
                  color: '#5686F5',
                  transform: 'rotate(-90deg)',
                }}
               />
            </motion.div> : null
          }
        </Item>
      ))}
    </List>
  )
}

export default SelectableList
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

const SandpackArrowList = () => {
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

export default SandpackArrowList;
