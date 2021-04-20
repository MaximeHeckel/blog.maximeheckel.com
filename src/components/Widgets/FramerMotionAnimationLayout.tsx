import { css } from '@emotion/core';
import styled from '@emotion/styled';
import { motion, AnimateSharedLayout } from 'framer-motion';
import { LinkButton } from 'gatsby-theme-maximeheckel/src/components/Button/LinkButton';
import React from 'react';
import { AnimationCard, AnimationCardContent } from './Components';

let PETS = [
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
    photo: '🦊',
  },
  {
    id: '10',
    photo: '🐶',
  },
  {
    id: '11',
    photo: '🐼',
  },
  {
    id: '12',
    photo: '🐰',
  },
];

const ClearIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 9L9 15"
      stroke="var(--maximeheckel-colors-typeface-2)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 9L15 15"
      stroke="var(--maximeheckel-colors-typeface-2)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AddIcon = () => (
  <svg
    width="25"
    height="25"
    viewBox="0 0 25 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.5154 8.91113V16.9111"
      stroke="var(--maximeheckel-colors-typeface-2)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.51541 12.9111H16.5154"
      stroke="var(--maximeheckel-colors-typeface-2)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CardWrapper = styled(motion.div)`
  background: hsl(var(--palette-gray-10));
  box-shadow: var(--maximeheckel-shadow-2);
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 25px;
  max-width: 250px;
  margin: 0 auto;
  color: hsl(var(--palette-gray-90));

  ul {
    margin: 0px;
  }
`;

const Circle = styled(motion.li)`
  background: linear-gradient(104.01deg, #9bebeb 5.51%, #0fa6e9 98.93%);
  width: 48px;
  height: 48px;
  list-style: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto;
  border: 2px solid var(--maximeheckel-colors-brand);
`;

const FramerMotionAnimationLayout = () => {
  const [items, setItems] = React.useState<
    Array<{ id: string; photo: string }>
  >([]);

  const [layout, setLayout] = React.useState(false);

  return (
    <AnimationCard>
      <AnimationCardContent>
        <div
          css={css`
            height: 300px;
            width: 100%;
          `}
        >
          {layout ? (
            <AnimateSharedLayout>
              <CardWrapper layout initial={{ borderRadius: 25 }}>
                <motion.p
                  layout
                  css={css`
                    margin-bottom: 0px;
                  `}
                >
                  You have {items.length} {items.length === 1 ? 'pet' : 'pets'}
                </motion.p>
                <ul
                  css={css`
                    display: grid;
                    grid-gap: 8px;
                    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
                  `}
                >
                  {items.map((item) => (
                    <Circle
                      key={item.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {item.photo}
                    </Circle>
                  ))}
                </ul>
              </CardWrapper>
            </AnimateSharedLayout>
          ) : (
            <CardWrapper layout initial={{ borderRadius: 25 }}>
              <motion.p
                layout
                css={css`
                  margin-bottom: 0px;
                `}
              >
                You have {items.length} {items.length === 1 ? 'pet' : 'pets'}
              </motion.p>
              <ul
                css={css`
                  display: grid;
                  grid-gap: 8px;
                  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
                `}
              >
                {items.map((item) => (
                  <Circle
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {item.photo}
                  </Circle>
                ))}
              </ul>
            </CardWrapper>
          )}
        </div>
        <div>
          <input
            id="layout"
            type="checkbox"
            css={css`
              margin-right: 8px;
            `}
            checked={layout}
            onChange={() => setLayout((prev) => !prev)}
          />
          <label htmlFor="layout">Enable animating shared layouts</label>
        </div>
        <div
          css={css`
            display: flex;
            justify-content: center;
            align-items: center;
          `}
        >
          <LinkButton
            title="Add new pet!"
            disabled={PETS.length === 0}
            onClick={() =>
              setItems((prev) => {
                const newElement = PETS.shift()!;
                const newState = [...prev, newElement];

                return newState;
              })
            }
          >
            <AddIcon />
          </LinkButton>
          <LinkButton
            title="Clear pets list"
            onClick={() => {
              PETS = [...items, ...PETS];
              setItems([]);
            }}
          >
            <ClearIcon />
          </LinkButton>
        </div>
      </AnimationCardContent>
    </AnimationCard>
  );
};

export default FramerMotionAnimationLayout;
