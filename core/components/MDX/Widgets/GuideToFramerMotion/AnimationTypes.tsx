import {
  Card,
  Label,
  Range,
  useDebouncedValue,
} from '@maximeheckel/design-system';
import { HighlightedCodeText } from '@theme/components/Code/CodeBlock';
import { motion } from 'framer-motion';
import React from 'react';
import { useInView } from 'react-intersection-observer';
import {
  AnimationCardContent,
  Form,
  HighlightedValue,
  TransitionGridWrapper,
  Wrapper,
} from '../Components';

const AnimationTypes = () => {
  const [ref, inView] = useInView();
  const [tweenAnimation, setTweenAnimation] = React.useState('easeInOut');
  const [mass, setMass] = React.useState(3);
  const [damping, setDamping] = React.useState(1);
  const [velocity, setVelocity] = React.useState(50);
  const [stiffness, setStiffness] = React.useState(100);
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
        <Card glass depth={1}>
          <Card.Header>Spring</Card.Header>
          <AnimationCardContent>
            <Form>
              <Range
                id="mass1"
                aria-label="Mass"
                label={
                  <span>
                    Mass: <HighlightedValue>{mass}</HighlightedValue>
                  </span>
                }
                min={1}
                max={10}
                value={mass}
                onChange={(value) => setMass(value)}
              />
              <Range
                id="stiffness1"
                aria-label="Stiffness"
                label={
                  <span>
                    Stiffness: <HighlightedValue>{stiffness}</HighlightedValue>
                  </span>
                }
                min={1}
                max={500}
                value={stiffness}
                onChange={(value) => setStiffness(value)}
              />
              <Range
                id="damping"
                aria-label="Damping"
                label={
                  <span>
                    Damping: <HighlightedValue>{damping}</HighlightedValue>
                  </span>
                }
                min={0}
                max={5}
                step="0.10"
                value={damping}
                onChange={(value) => setDamping(value)}
              />
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

        <Card glass depth={1}>
          <Card.Header>Tween</Card.Header>
          <AnimationCardContent>
            <Form>
              <div style={{ display: 'grid' }}>
                <Label htmlFor="tween-type">Ease</Label>
                <select
                  id="tween-type"
                  value={tweenAnimation}
                  onChange={(event) => {
                    setTweenAnimation(event.target.value);
                  }}
                >
                  <option value="linear">linear</option>
                  <option value="easeIn">easeIn</option>
                  <option value="easeOut">easeOut</option>
                  <option value="easeInOut">easeInOut</option>
                  <option value="circIn">circIn</option>
                  <option value="circOut">circOut</option>
                  <option value="circInOut">circInOut</option>
                  <option value="backIn">backIn</option>
                  <option value="backOut">backOut</option>
                  <option value="backInOut">backInOut</option>
                  <option value="anticipate">anticipate</option>
                </select>
              </div>
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
                ease: tweenAnimation,
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
        <Card glass depth={1}>
          <Card.Header>Inertia</Card.Header>
          <AnimationCardContent>
            <Form>
              <div style={{ display: 'grid' }}>
                <Range
                  id="velocity"
                  aria-label="Velocity"
                  label={
                    <span>
                      Velocity: <HighlightedValue>{velocity}</HighlightedValue>
                    </span>
                  }
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
