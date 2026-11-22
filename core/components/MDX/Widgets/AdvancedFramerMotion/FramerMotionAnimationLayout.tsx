import { styled } from 'lib/stitches.config';
import { motion } from 'motion/react';
import React from 'react';

import Card from '@core/components/Card';
import Checkbox from '@core/components/Checkbox';
import Grid from '@core/components/Grid';

import { AnimationCardContent } from '../Components';

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

const Circle = styled('div', {
  background: 'linear-gradient(104.01deg, #9bebeb 5.51%, #0fa6e9 98.93%)',
  width: '48px',
  height: '48px',
  userSelect: 'none',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '32px',
  margin: '0 auto',
});

const FramerMotionAnimationLayout = () => {
  const [selectedPetID, setSelectedPetID] = React.useState('1');
  const [withLayoutID, setWithLayoutID] = React.useState(false);

  return (
    <Card depth={1}>
      <AnimationCardContent>
        <Grid
          as="ul"
          css={{
            height: '250px',
            width: '100%',
            padding: '0',
          }}
          gapX={3}
          justify="center"
          templateColumns="repeat(4, 48px)"
        >
          {PETS.map((pet) => (
            <li
              style={{
                listStyle: 'none',
                position: 'relative',
                cursor: 'pointer',
              }}
              key={pet.id}
              onClick={() => setSelectedPetID(pet.id)}
            >
              <Circle>{pet.photo}</Circle>
              {selectedPetID === pet.id && (
                <motion.div
                  layoutId={withLayoutID ? 'border' : undefined}
                  style={{
                    position: 'absolute',
                    top: '0',
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    border: '4px solid var(--accent)',
                  }}
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
