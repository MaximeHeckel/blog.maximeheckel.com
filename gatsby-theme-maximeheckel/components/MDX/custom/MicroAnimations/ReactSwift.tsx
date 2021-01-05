import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Box = styled(motion.div)`
  position: relative;
  width: 130px;
  height: 130px;
  border-radius: 20px;
  background: linear-gradient(
    321.29deg,
    #d4e1ea 10.96%,
    #e9f1f4 114.26%,
    #d4e1ea 114.27%
  );

  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const MiniButton = styled(motion.div)`
  height: 20px;

  border-radius: 20px;
`;

const NavBar = styled(motion.div)`
  border-radius: 15px;
  width: 78px;
  height: 15px;
  box-shadow: inset 0px -1px 1px 0px rgba(0, 0, 0, 0.1),
    inset 0px 1px 4px 0px rgba(255, 255, 255, 0.25);
`;

const Mobile = styled(motion.div)`
  position: relative;
  height: 130px;
  width: 80px;
  border-radius: 20px;
  background: linear-gradient(
    321.29deg,
    #d4e1ea 10.96%,
    #e9f1f4 114.26%,
    #d4e1ea 114.27%
  );
  padding: 5px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
`;

const PopUp = styled(motion.div)`
  position: absolute;
  left: 5px;
  top: 10px;
  background: #e7f1ff;
  border-radius: 20px;
`;

const SunRising = styled(motion.div)`
  height: 45px;
  width: 45px;
  border-radius: 50%;
  background: linear-gradient(
    0deg,
    #e16262 13.54%,
    #e19062 36.98%,
    #ffef5c 100%
  );
  margin: 0 auto;
`;

const Window = styled('div')`
  max-width: 700px;
  width: 100%;
  overflow: hidden;
  height: 300px;
`;

const SlidingWindow = () => {
  const [ref, inView] = useInView();
  const duration = 4;
  const loop = Infinity;

  return (
    <Window ref={ref}>
      {inView ? (
        <>
          <div style={{ position: 'relative', height: '150px' }}>
            <Box
              style={{
                position: 'absolute',
                background:
                  'linear-gradient(191.2deg, #DCD2F8 9.15%, #FFE4E9 37.51%, #FFFFFF 79.38%)',
              }}
              initial={{
                x: '900px',
              }}
              animate={{
                x: '-200px',
              }}
              transition={{
                duration,
                ease: 'linear',
                loop,
                delay: 0.7,
              }}
            >
              <NavBar
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',

                  background: '#fff',

                  scale: 1.25,
                }}
                initial={{
                  width: 0,
                }}
                animate={{
                  width: '100%',
                }}
                transition={{
                  ease: 'linear',
                  delay: 1.4,
                  duration: 2.0,
                  repeatDelay: 2,
                  loop,
                }}
              />
            </Box>
            <Mobile
              style={{
                position: 'absolute',
                background:
                  'linear-gradient(314.76deg, #AA68D2 11.01%, #F1608A 110.85%)',
              }}
              initial={{
                x: '900px',
              }}
              animate={{
                x: '-200px',
              }}
              transition={{
                duration,
                ease: 'linear',
                loop,
                delay: 1.7,
              }}
            />
            <Box
              style={{
                position: 'absolute',
                background: '#C1ECF8',
              }}
              initial={{
                x: '900px',
              }}
              animate={{
                x: '-200px',
              }}
              transition={{
                duration,
                ease: 'linear',
                loop,
                delay: 2.7,
              }}
            >
              <div />
              <MiniButton
                style={{
                  background: '#336ef5',

                  margin: '0 auto',
                }}
                initial={{
                  width: '30px',
                  height: '10px',
                }}
                animate={{
                  width: '70px',
                  height: '20px',
                }}
                transition={{
                  duration: 0.8,
                  yoyo: Infinity,
                  ease: 'easeOut',
                }}
              />
              <div />
            </Box>
            <Mobile
              style={{
                position: 'absolute',
                background:
                  'linear-gradient(338.59deg, #E4AEF1 20.81%, #F4AAB8 54.65%, #F0B255 93.06%)',
              }}
              initial={{
                x: '900px',
                rotate: 0,
              }}
              animate={{
                x: '-200px',
                rotate: 90,
              }}
              transition={{
                duration,
                ease: 'linear',
                loop,
                delay: 3.8,
              }}
            />
          </div>
          <div style={{ position: 'relative', height: '150px' }}>
            <Mobile
              style={{ position: 'absolute' }}
              initial={{
                x: '900px',
              }}
              animate={{
                x: '-200px',
              }}
              transition={{
                duration,
                ease: 'linear',
                loop,
                delay: 1.3,
              }}
            >
              <div />
              <MiniButton
                style={{
                  background: 'white',
                  margin: '0 auto',
                  width: '50px',
                  height: '15px',
                }}
                initial={{
                  y: '-100px',
                }}
                animate={{
                  y: '0px',
                }}
                transition={{
                  duration: 1.2,
                  yoyo: Infinity,
                  ease: 'easeOut',
                }}
              />
              <MiniButton
                style={{
                  background: 'white',
                  margin: '0 auto',
                  width: '50px',
                  height: '15px',
                }}
                initial={{
                  y: '-100px',
                }}
                animate={{
                  y: '0px',
                }}
                transition={{
                  duration: 1.2,
                  yoyo: Infinity,
                  ease: 'easeOut',
                }}
              />
              <MiniButton
                style={{
                  background: 'white',
                  margin: '0 auto',
                  width: '50px',
                  height: '15px',
                }}
                initial={{
                  y: '-100px',
                }}
                animate={{
                  y: '0px',
                }}
                transition={{
                  duration: 1.2,
                  yoyo: Infinity,
                  ease: 'easeOut',
                }}
              />
              <MiniButton
                style={{
                  background: 'white',
                  margin: '0 auto',
                  width: '50px',
                  height: '15px',
                }}
                initial={{
                  y: '-100px',
                }}
                animate={{
                  y: '0px',
                }}
                transition={{
                  duration: 1.2,
                  yoyo: Infinity,
                  ease: 'easeOut',
                }}
              />
              <div />
            </Mobile>
            <Box
              style={{
                position: 'absolute',
                background:
                  'linear-gradient(159.91deg, #AEE1F1 18.66%, #FFFFFF 52.52%, #F4AAB8 108.53%)',
              }}
              initial={{
                x: '900px',
              }}
              animate={{
                x: '-200px',
              }}
              transition={{
                duration,
                ease: 'linear',
                loop,
                delay: 2.1,
              }}
            />
            <Mobile
              style={{
                position: 'absolute',
                background:
                  'linear-gradient(320.99deg, #0B77E4 24.28%, #66D3FF 114.2%)',
              }}
              initial={{
                x: '900px',
              }}
              animate={{
                x: '-200px',
              }}
              transition={{
                duration,
                ease: 'linear',
                loop,
                delay: 3.3,
              }}
            >
              <SunRising
                initial={{
                  y: '200px',
                }}
                animate={{
                  y: '10px',
                }}
                transition={{
                  delay: 2.8,
                  ease: 'linear',
                  duration,
                  loop,
                }}
              />
            </Mobile>
            <Box
              style={{
                position: 'absolute',
                background: '#FFDED9',
              }}
              initial={{
                x: '900px',
              }}
              animate={{
                x: '-200px',
              }}
              transition={{
                duration,
                ease: 'linear',
                loop,
                delay: 4.2,
              }}
            >
              <PopUp
                initial={{
                  width: '0px',
                  height: '0px',
                }}
                animate={{
                  width: '115px',
                  height: '110px',
                }}
                transition={{
                  delay: 5,
                  ease: 'linear',
                  duration: 2,
                  loop,
                  repeatDelay: 2.2,
                }}
              ></PopUp>
            </Box>
          </div>
        </>
      ) : null}
    </Window>
  );
};

export { SlidingWindow };
