import { css } from '@emotion/react';
import styled from '@emotion/styled';
import Card from '@theme/components/Card';
import Checkbox from '@theme/components/Checkbox';
import Grid from '@theme/components/Grid';
import { motion } from 'framer-motion';
import React from 'react';
import { AnimationCardContent } from './Components';

const PETS = [
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
    photo: '🐷',
  },
  {
    id: '7',
    photo: '🐻',
  },
  {
    id: '8',
    photo: '🦁',
  },
  {
    id: '9',
    photo: '🦊',
  },
  {
    id: '10',
    photo: '🐧',
  },
  {
    id: '11',
    photo: '🐼',
  },
  {
    id: '12',
    photo: '🐮',
  },
];

const Circle = styled('div')`
  background: linear-gradient(104.01deg, #9bebeb 5.51%, #0fa6e9 98.93%);
  width: 48px;
  height: 48px;
  user-select: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto;
`;

const FramerMotionAnimationLayout = () => {
  const [selectedPetID, setSelectedPetID] = React.useState('1');
  const [withLayoutID, setWithLayoutID] = React.useState(false);

  return (
    <Card
      depth={1}
      css={css`
        margin-bottom: 2.25rem;
      `}
    >
      <AnimationCardContent>
        <Grid
          as="ul"
          columns="repeat(4, 48px)"
          css={css`
            height: 250px;
            width: 100%;
          `}
          columnGap="12px"
          justifyContent="center"
        >
          {PETS.map((pet) => (
            <li
              css={css`
                list-style: none;
                position: relative;
                cursor: pointer;
              `}
              key={pet.id}
              onClick={() => setSelectedPetID(pet.id)}
            >
              <Circle>{pet.photo}</Circle>
              {selectedPetID === pet.id && (
                <motion.div
                  layoutId={withLayoutID ? 'border' : undefined}
                  css={css`
                    position: absolute;
                    border-radius: 50%;
                    width: 48px;
                    height: 48px;
                    border: 4px solid var(--maximeheckel-colors-brand);
                  `}
                />
              )}
            </li>
          ))}
        </Grid>
        <div>
          <Checkbox
            aria-label="Use common layout ID"
            checked={withLayoutID}
            id="layout"
            label="Use common layout ID"
            onChange={() => setWithLayoutID((prev) => !prev)}
          />
        </div>
      </AnimationCardContent>
    </Card>
  );
};

export default FramerMotionAnimationLayout;
