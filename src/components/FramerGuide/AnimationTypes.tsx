import { useTheme } from 'gatsby-theme-maximeheckel/src/context/ThemeContext';
import { CodeBlock } from 'gatsby-theme-maximeheckel/src/components/MDX/Code';
import { motion } from 'framer-motion';
import React from 'react';
import { useInView } from 'react-intersection-observer';
import {
  AnimationCard,
  AnimationCardContent,
  AnimationCardHeader,
  Form,
  HighlightedValue,
  TransitionGridWrapper,
  Wrapper,
} from './Components';
import { useDebounce } from './utils';

const AnimationTypes = () => {
  const [ref, inView] = useInView();
  const { dark } = useTheme();
  const [tweenAnimation, setTweenAnimation] = React.useState('easeInOut');
  const [mass, setMass] = React.useState(3);
  const [damping, setDamping] = React.useState(1);
  const [velocity, setVelocity] = React.useState(50);
  const [stiffness, setStiffness] = React.useState(100);
  const [countSpring, setCountSpring] = React.useState(0);
  const [countInertia, setCountInertia] = React.useState(0);

  const debouncedMass = useDebounce(mass, 300);
  const debouncedStiffness = useDebounce(stiffness, 300);
  const debouncedDamping = useDebounce(damping, 300);
  const debouncedVelocity = useDebounce(velocity, 300);

  React.useEffect(() => {
    setCountSpring(countSpring + 1);
  }, [debouncedMass, debouncedStiffness, debouncedDamping]);

  React.useEffect(() => {
    setCountInertia(countInertia + 1);
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
        <div>
          <AnimationCard>
            <AnimationCardHeader
              css={{
                borderBottom: `1px solid ${dark ? '#151617' : '#dce6f3'}`,
              }}
            >
              Spring
            </AnimationCardHeader>
            <AnimationCardContent>
              <Form>
                <div style={{ display: 'grid' }}>
                  <label htmlFor="mass1">
                    Mass: <HighlightedValue>{mass}</HighlightedValue>
                  </label>
                  <input
                    id="mass1"
                    type="range"
                    min="1"
                    max="10"
                    value={mass}
                    onChange={e => setMass(parseInt(e.target.value, 10))}
                  />
                </div>
                <div style={{ display: 'grid' }}>
                  <label htmlFor="stiffness1">
                    Stiffness: <HighlightedValue>{stiffness}</HighlightedValue>
                  </label>
                  <input
                    id="stiffness1"
                    type="range"
                    min="1"
                    max="500"
                    value={stiffness}
                    onChange={e => setStiffness(parseInt(e.target.value, 10))}
                  />
                </div>
                <div style={{ display: 'grid' }}>
                  <label htmlFor="damping">
                    Damping: <HighlightedValue>{damping}</HighlightedValue>
                  </label>
                  <input
                    id="damping"
                    type="range"
                    min="0"
                    max="5"
                    step="0.10"
                    value={damping}
                    onChange={e => setDamping(parseInt(e.target.value, 10))}
                  />
                </div>
              </Form>
              <div />
              <motion.div
                key={countSpring}
                style={{
                  background:
                    'linear-gradient(315deg, #fde7f9 0%, #aacaef 74%)',
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
            <CodeBlock
              codeString={springCodeString}
              // @ts-ignore
              language="js"
              metastring=""
            />
          </AnimationCard>
        </div>
        <div>
          <AnimationCard>
            <AnimationCardHeader
              css={{
                borderBottom: `1px solid ${dark ? '#151617' : '#dce6f3'}`,
              }}
            >
              Tween
            </AnimationCardHeader>
            <AnimationCardContent>
              <Form>
                <div style={{ display: 'grid' }}>
                  <label htmlFor="tween-type">Ease</label>
                  <select
                    id="tween-type"
                    value={tweenAnimation}
                    onChange={event => {
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
                  background:
                    'linear-gradient(315deg, #fde7f9 0%, #aacaef 74%)',
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
                  // @ts-ignore
                  type: 'tween',
                  // @ts-ignore
                  ease: tweenAnimation,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  repeatDelay: 1,
                  // @ts-ignore
                  duration: 2,
                }}
              />
            </AnimationCardContent>
            <CodeBlock
              codeString={tweenCodeString}
              // @ts-ignore
              language="js"
              metastring=""
            />
          </AnimationCard>
        </div>
        <div>
          <AnimationCard>
            <AnimationCardHeader
              css={{
                borderBottom: `1px solid ${dark ? '#151617' : '#dce6f3'}`,
              }}
            >
              Inertia
            </AnimationCardHeader>
            <AnimationCardContent>
              <Form>
                <div style={{ display: 'grid' }}>
                  <label htmlFor="velocity">
                    Velocity: <HighlightedValue>{velocity}</HighlightedValue>
                  </label>
                  <input
                    id="velocity"
                    type="range"
                    min="1"
                    max="500"
                    value={velocity}
                    onChange={e => setVelocity(parseInt(e.target.value, 10))}
                  />
                </div>
              </Form>
              <div />
              <motion.div
                key={countInertia}
                style={{
                  background:
                    'linear-gradient(315deg, #fde7f9 0%, #aacaef 74%)',
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
            <CodeBlock
              codeString={inertiaCodeString}
              // @ts-ignore
              language="js"
              metastring=""
            />
          </AnimationCard>
        </div>
      </TransitionGridWrapper>
    </Wrapper>
  );
};

export default AnimationTypes;
