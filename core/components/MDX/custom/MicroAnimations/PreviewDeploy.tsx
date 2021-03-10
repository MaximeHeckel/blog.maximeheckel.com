import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Box = styled(motion.div)`
  width: 140px;
  height: 140px;
  border-radius: 20px;
  background: linear-gradient(
    321.29deg,
    #d4e1ea 10.96%,
    #e9f1f4 114.26%,
    #d4e1ea 114.27%
  );
  box-shadow: 10px 12px 25px rgba(0, 0, 0, 0.1),
    inset 0px -4px 4px rgba(0, 0, 0, 0.1),
    inset 0px 6px 6px rgba(255, 255, 255, 0.5);
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const MiniButton = styled(motion.div)`
  width: 70px;
  height: 20px;

  border-radius: 20px;
  box-shadow: 3px 5px 8px 1px rgba(0, 0, 0, 0.2), inset 0px -1px 1px 0px #0c77e3,
    inset 0px 1px 4px 0px #5abff8;
`;

const MiniProfile = styled(motion.div)`
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #c4c4c4;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.2),
    inset 0px -1px 1px 0px rgba(0, 0, 0, 0.25),
    inset 0px 1px 4px 0px rgba(255, 255, 255, 0.25);
`;

const NavBar = styled(motion.div)`
  width: 78px;
  height: 15px;
  box-shadow: inset 0px -1px 1px 0px rgba(0, 0, 0, 0.1),
    inset 0px 1px 4px 0px rgba(255, 255, 255, 0.25);
`;

const Label = styled(motion.div)`
  width: 30px;
  height: 8px;
  border-radius: 20px;
  background: #aee7c8;
  box-shadow: inset 0px -1px 1px 0px rgba(54, 122, 85, 0.25),
    inset 0px 1px 4px 0px rgba(224, 255, 238, 0.5);
`;

const PreviewDeploy = () => {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '350px',
      }}
    >
      {inView ? (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            ease: 'easeInOut',
            duration: 1,
          }}
        >
          <Box
            initial={{
              x: '-100px',
              y: '110px',
            }}
          >
            <NavBar
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                width: '100%',
                background: '#95D3F5',
                borderRadius: '15px',
                scale: 1.25,
              }}
            >
              <MiniProfile style={{ marginRight: '8px', scale: 0.75 }} />
            </NavBar>
            <MiniButton
              style={{
                background: '#336ef5',
                x: '15px',
              }}
            />
            <div />
          </Box>
          <Box
            initial={{
              x: '-100px',
              y: '-30px',
            }}
            animate={{
              x: '100px',
              y: '60px',
            }}
            transition={{
              ease: 'easeInOut',
              duration: 1.5,
              delay: 7,
            }}
          >
            <NavBar
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                width: '100%',
                background: '#95D3F5',
                borderRadius: '15px',
                scale: 1.25,
              }}
            >
              <MiniProfile style={{ marginRight: '8px', scale: 0.75 }} />
            </NavBar>
            <MiniButton
              style={{
                background: '#336ef5',
                x: '15px',
              }}
            />
            <Label
              initial={{
                opacity: 0,
                x: '-20px',
                y: '-150px',
              }}
              animate={{
                opacity: 1,
                x: '0px',
                y: '-88px',
              }}
              transition={{
                type: 'spring',
                delay: 5,
                stiffness: 100,
                damping: 7,
              }}
            />
          </Box>

          <Box
            initial={{
              x: '-100px',
              y: '-170px',
            }}
            animate={{
              x: '100px',
              y: '-250px',
            }}
            transition={{
              ease: 'easeInOut',
              duration: 1.5,
              delay: 3,
            }}
          >
            <NavBar
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                width: '100%',
                background: '#95D3F5',
                borderRadius: '15px',
                scale: 1.25,
              }}
            >
              <MiniProfile style={{ marginRight: '8px', scale: 0.75 }} />
            </NavBar>
            <MiniButton
              style={{
                background: '#336ef5',
                x: '15px',
              }}
            />
            <MiniButton
              style={{
                x: '15px',
                background: '#f9576d',
                boxShadow:
                  '3px 5px 8px 1px  rgba(0, 0, 0, 0.2),inset 0px -1px 1px 0px #f9576d, inset 0px 1px 4px 0px #FFA1AE',
              }}
              initial={{
                opacity: 0,
                y: '-150px',
              }}
              animate={{
                opacity: 1,
                y: '0px',
              }}
              transition={{
                type: 'spring',
                delay: 1,
                stiffness: 100,
                damping: 7,
              }}
            />
          </Box>
        </motion.div>
      ) : null}
    </div>
  );
};

const StackLayer = styled(motion.div)`
  position: absolute;
  width: 140px;
  height: 100px;
  border-radius: 17px;
  box-shadow: 10px 12px 25px rgba(0, 0, 0, 0.1),
    inset 0px -4px 4px rgba(0, 0, 0, 0.1),
    inset 0px 6px 6px rgba(255, 255, 255, 0.5);
  padding: 20px;
  border-radius: 25px;
`;

const Wrapper = styled('div')`
  width: 100%;
  height: 300px;
  justify-content: center;
  display: flex;
  align-items: center;
  overflow: hidden;
`;

const IsometricWrapper = styled(motion.div)`
  position: relative;
  transform: matrix(0.71, 0.41, -1.22, 0.62, 0, 0) !important;
`;

const DockerBuild = () => {
  const [ref, inView] = useInView();

  return (
    <Wrapper ref={ref}>
      {inView ? (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            ease: 'easeInOut',
            duration: 1,
          }}
        >
          <IsometricWrapper>
            <StackLayer
              initial={{
                y: '-200px',
                opacity: 0,
              }}
              animate={{
                y: '0px',
                opacity: 1,
              }}
              transition={{
                ease: 'easeOut',
                duration: 0.5,
                delay: 1,
              }}
              style={{
                marginTop: '0px',
                background: `linear-gradient(
            321.29deg,
            #d4e1ea 10.96%,
            #e9f1f4 114.26%,
            #d4e1ea 114.27%
          )`,
              }}
            />
            <StackLayer
              initial={{
                y: '-200px',
                opacity: 0,
              }}
              animate={{
                y: '0px',
                opacity: 1,
              }}
              transition={{
                ease: 'easeOut',
                duration: 0.5,
                delay: 2,
              }}
              style={{
                marginTop: '-30px',
                marginLeft: '-50px',
                background: ` linear-gradient(315deg, #6a93cb 0%, #a4bfef 74%)`,
              }}
            />
            <StackLayer
              initial={{
                y: '-200px',
                opacity: 0,
              }}
              animate={{
                y: '0px',
                opacity: 1,
              }}
              transition={{
                ease: 'easeOut',
                duration: 0.5,
                delay: 3,
              }}
              style={{
                marginTop: '-60px',
                marginLeft: '-100px',
                background: `linear-gradient(315deg, #b1bfd8 0%, #6782b4 74%)`,
              }}
            />
            <StackLayer
              initial={{
                y: '-200px',
                opacity: 0,
              }}
              animate={{
                y: '0px',
                opacity: 1,
              }}
              transition={{
                ease: 'easeOut',
                duration: 0.5,
                delay: 4,
              }}
              style={{
                marginTop: '-90px',
                marginLeft: '-150px',
                background: `linear-gradient(90deg,#ffa0ae 0%,#aacaef 75%)`,
              }}
            />
          </IsometricWrapper>
        </motion.div>
      ) : null}
    </Wrapper>
  );
};

export { DockerBuild, PreviewDeploy };
