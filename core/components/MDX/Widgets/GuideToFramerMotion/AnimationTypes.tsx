import { Card, Flex, useDebouncedValue } from '@maximeheckel/design-system';
import { Easing, motion, useInView } from 'motion/react';
import React, { useRef } from 'react';

import { HighlightedCodeText } from '@core/components/Code/CodeBlock';
import { Select } from '@core/components/Select';
import { Slider } from '@core/components/Slider';

import {
  AnimationCardContent,
  Form,
  TransitionGridWrapper,
  Wrapper,
} from '../Components';

const animationOptions = [
  { label: 'Linear', value: 'linear' },
  { label: 'EaseIn', value: 'easeIn' },
  { label: 'EaseOut', value: 'easeOut' },
  { label: 'EaseInOut', value: 'easeInOut' },
  { label: 'CircIn', value: 'circIn' },
  { label: 'CircOut', value: 'circOut' },
  { label: 'CircInOut', value: 'circInOut' },
  { label: 'BackIn', value: 'backIn' },
  { label: 'BackOut', value: 'backOut' },
  { label: 'BackInOut', value: 'backInOut' },
  { label: 'Anticipate', value: 'anticipate' },
];

const AnimationTypes = () => {
  const ref = useRef(null);
  const inView = useInView(ref);
  const [tweenAnimation, setTweenAnimation] = React.useState('easeInOut');
  const [mass, setMass] = React.useState(4);
  const [damping, setDamping] = React.useState(4);
  const [velocity, setVelocity] = React.useState(250);
  const [stiffness, setStiffness] = React.useState(230);
  const [countSpring, setCountSpring] = React.useState(0);
  const [countInertia, setCountInertia] = React.useState(0);

  const debouncedMass = useDebouncedValue(mass, 300);
  const debouncedStiffness = useDebouncedValue(stiffness, 300);
  const debouncedDamping = useDebouncedValue(damping, 300);
  const debouncedVelocity = useDebouncedValue(velocity, 300);

  React.useEffect(() => {
    setCountSpring(countSpring + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMass, debouncedStiffness, debouncedDamping]);

  React.useEffect(() => {
    setCountInertia(countInertia + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedVelocity]);

  const springCodeString = `<motion.div
    ...
    transition={{
      type: 'spring',
      stiffness: ${stiffness},
      mass: ${mass},
      damping: ${damping},
    }}
  />
  `;

  const tweenCodeString = `<motion.div
  ...
  transition={{
    type: 'tween',
    ease: '${tweenAnimation}',
    duration: 2,
    ...
  }}
  />
  `;

  const inertiaCodeString = `<motion.div
    ...
    transition={{
      type: 'inertia',
      velocity: ${velocity},
    }}
  />


  `;

  return (
    <Wrapper ref={ref}>
      <TransitionGridWrapper>
        <Card depth={1}>
          <Card.Header>Spring</Card.Header>
          <AnimationCardContent>
            <Form>
              <Flex direction="column" gap={5}>
                <Slider
                  id="mass1"
                  aria-label="Mass"
                  label="Mass"
                  min={1}
                  max={10}
                  value={mass}
                  onChange={(value) => setMass(value)}
                />
                <Slider
                  id="stiffness1"
                  aria-label="Stiffness"
                  label="Stiffness"
                  min={1}
                  max={500}
                  value={stiffness}
                  onChange={(value) => setStiffness(value)}
                />
                <Slider
                  id="damping"
                  aria-label="Damping"
                  label="Damping"
                  min={0}
                  max={5}
                  step={0.1}
                  value={damping}
                  onChange={(value) => setDamping(value)}
                />
              </Flex>
            </Form>
            <div />
            <motion.div
              key={countSpring}
              style={{
                background: 'linear-gradient(90deg,#ffa0ae 0%,#aacaef 75%)',
                height: '100px',
                width: '100px',
                borderRadius: '10px',
              }}
              initial={{
                y: -100,
              }}
              animate={
                inView
                  ? {
                      y: 0,
                    }
                  : {
                      y: -100,
                    }
              }
              transition={{
                type: 'spring',
                stiffness,
                mass,
                damping,
              }}
            />
          </AnimationCardContent>
          <HighlightedCodeText
            codeString={springCodeString}
            language="javascript"
          />
        </Card>

        <Card depth={1}>
          <Card.Header>Tween</Card.Header>
          <AnimationCardContent>
            <Form>
              <Select
                aria-label="Easing type"
                id="tween-type"
                items={animationOptions}
                value={tweenAnimation}
                onChange={(value) => setTweenAnimation(value as string)}
              />
            </Form>
            <div />
            <motion.div
              key={tweenAnimation}
              style={{
                background: 'linear-gradient(90deg,#ffa0ae 0%,#aacaef 75%)',
                height: '100px',
                width: '100px',
                borderRadius: '10px',
              }}
              initial={{
                y: -120,
              }}
              animate={
                inView
                  ? {
                      y: 20,
                    }
                  : {
                      y: -120,
                    }
              }
              transition={{
                ease: tweenAnimation as Easing,
                repeat: Infinity,
                repeatType: 'reverse',
                repeatDelay: 1,
                duration: 2,
              }}
            />
          </AnimationCardContent>
          <HighlightedCodeText
            codeString={tweenCodeString}
            language="javascript"
          />
        </Card>
        <Card depth={1}>
          <Card.Header>Inertia</Card.Header>
          <AnimationCardContent>
            <Form>
              <div style={{ display: 'grid' }}>
                <Slider
                  id="velocity"
                  aria-label="Velocity"
                  label="Velocity"
                  min={1}
                  max={500}
                  value={velocity}
                  onChange={(value) => setVelocity(value)}
                />
              </div>
            </Form>
            <div />
            <motion.div
              key={countInertia}
              style={{
                background: 'linear-gradient(90deg,#ffa0ae 0%,#aacaef 75%)',
                height: '100px',
                width: '100px',
                borderRadius: '10px',
              }}
              initial={{
                y: -120,
              }}
              animate={
                inView
                  ? {
                      y: 20,
                    }
                  : {
                      y: -120,
                    }
              }
              transition={{
                type: 'inertia',
                velocity,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          </AnimationCardContent>
          <HighlightedCodeText
            codeString={inertiaCodeString}
            language="javascript"
          />
        </Card>
      </TransitionGridWrapper>
    </Wrapper>
  );
};

export default AnimationTypes;
