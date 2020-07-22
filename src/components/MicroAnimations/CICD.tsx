import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const Box = styled(motion.div)<{ background?: string }>`
  width: 140px;
  height: 140px;
  border-radius: 8px;
  border: none;
  background: ${props => props.background};
  box-shadow: rgba(0, 0, 0, 0.2) 0px 20px 40px;
  margin: 60px auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const LinesOfCode = styled(motion.div)<{ color?: string; length: number }>`
  height: 8px;
  width: ${props => props.length * 10}px;
  border-radius: 50px;
  background: ${props => props.color || 'white'};
`;

const Row = styled('div')`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const CheckMark = styled(motion.div)`
  display: inline-block;
  transform: rotate(45deg);
  height: 10px;
  width: 6px;
  border-bottom: 2px solid #1ea052;
  border-right: 2px solid #1ea052;
`;

// Code validation = type checking + linting + prettier
const CodeValidation = () => {
  const lines = [
    { color: '#336ef5', size: 7 },
    { size: 3 },
    { color: '#336ef5', size: 6 },
    { color: '#767679', size: 8 },
    { size: 4 },
    { color: '#767679', size: 6 },
  ];

  const duration = 0.7;

  return (
    <div>
      <Box
        style={{
          backgroundColor: '#000000',
          backgroundImage: 'linear-gradient(315deg, #000000 0%, #414141 100%)',
        }}
      >
        {lines.map((line, i) => {
          return (
            <Row key={i}>
              <LinesOfCode
                custom={i}
                length={line.size}
                color={line.color}
                initial={{
                  opacity: 0.2,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  yoyo: Infinity,
                  ease: 'easeInOut',
                  duration,
                  delay: i * duration,
                  repeatDelay: lines.length * duration,
                }}
              />
              <CheckMark
                initial={{
                  scale: 0,
                  rotate: 45,
                }}
                animate={{
                  scale: 1,
                  rotate: 45,
                }}
                transition={{
                  flip: Infinity,
                  duration,
                  delay: i * duration,
                  repeatDelay: lines.length * duration,
                }}
              />
            </Row>
          );
        })}
      </Box>
    </div>
  );
};

const MiniButton = styled(motion.div)`
  width: 35px;
  height: 12px;
  border-radius: 3px;
  border: 2px solid #336ef5;
`;

const MiniProfile = styled(motion.div)`
  width: 15px;
  height: 15px;
  border-radius: 50%;
`;

const NavBar = styled(motion.div)`
  width: 78px;
  height: 15px;
`;

const UnitTest = () => {
  const duration = 0.7;

  const components = [
    <MiniProfile
      key="miniprofile"
      initial={{
        background: '#767679',
      }}
      animate={{
        background: '#2196f3',
      }}
      transition={{
        duration,
        flip: Infinity,
        delay: duration * 4 * 2,
        repeatDelay: 4 * duration * 2 + duration,
      }}
    />,
    <NavBar
      key="navbar"
      initial={{
        background: '#bdbdc3',
        borderRadius: '0px',
      }}
      animate={{
        background: '#292929',
        borderRadius: '10px',
      }}
      transition={{
        duration,
        flip: Infinity,
        delay: duration * 4 * 2,
        repeatDelay: 4 * duration * 2 + duration,
      }}
    />,
    <MiniButton
      key="minibutton"
      initial={{
        background: '#336ef5',
        borderColor: '#336ef5',
      }}
      animate={{
        background: '#bdbdc3',
        borderColor: '#bdbdc3',
      }}
      transition={{
        duration,
        flip: Infinity,
        delay: duration * 4 * 2,
        repeatDelay: 4 * duration * 2 + duration,
      }}
    />,
    <MiniButton
      key="minibutton"
      initial={{
        borderColor: '#336ef5',
      }}
      animate={{
        borderColor: '#f9576d',
      }}
      transition={{
        duration,
        flip: Infinity,
        delay: duration * 4 * 2,
        repeatDelay: 4 * duration * 2 + duration,
      }}
    />,
  ];

  return (
    <div>
      <Box
        style={{
          backgroundColor: '#ffffff',
          backgroundImage: 'linear-gradient(315deg, #ffffff 0%, #d7e1ec 74%)',
        }}
      >
        {components.map((component, i) => {
          return (
            <Row key={i}>
              {component}
              <CheckMark
                initial={{
                  scale: 0,
                  rotate: 45,
                }}
                animate={{
                  scale: 1,
                  rotate: 45,
                }}
                transition={{
                  flip: Infinity,
                  duration,
                  delay: i * duration,
                  repeatDelay: components.length * duration,
                }}
              />
            </Row>
          );
        })}
      </Box>
    </div>
  );
};

const IntegrationTest = () => {
  const duration = 0.7;

  return (
    <div>
      <Box
        style={{
          backgroundColor: '#b8c6db',
          backgroundImage: 'linear-gradient(315deg, #b8c6db 0%, #f5f7fa 74%)',
        }}
      >
        <MiniProfile
          initial={{
            background: '#767679',
            zIndex: 2,
            x: '0px',
            y: '0px',
          }}
          animate={{
            x: '85px',
            y: '11px',
          }}
          transition={{
            duration,
            flip: Infinity,
            delay: duration * 2 * 2,
            repeatDelay: 2 * duration * 2 + duration,
          }}
        />
        <NavBar
          initial={{
            width: '100%',
            background: '#2196f3',
            scale: 1,
            y: '0px',
          }}
          animate={{
            y: '-20px',
            scale: 1.25,
          }}
          transition={{
            duration,
            flip: Infinity,
            delay: duration * 2 * 2,
            repeatDelay: 2 * duration * 2 + duration,
          }}
        />
        <MiniButton
          initial={{
            background: '#336ef5',
            borderColor: '#336ef5',
            x: '0px',
            y: '0px',
          }}
          animate={{
            x: '30px',
            y: '-10px',
          }}
          transition={{
            duration,
            flip: Infinity,
            delay: duration * 2 * 2,
            repeatDelay: 2 * duration * 2 + duration,
          }}
        />
        <CheckMark
          initial={{
            scale: 0,
            rotate: 45,
            x: '45px',
          }}
          animate={{
            scale: 1,
            rotate: 45,
          }}
          transition={{
            flip: Infinity,
            duration,
            delay: duration * 2 * 2,
            repeatDelay: 2 * duration * 2 + duration,
          }}
        />
      </Box>
    </div>
  );
};

const MouseArrow = styled(motion.div)`
  width: 0px;
  height: 0px;
  border-left: 3px solid transparent;
  border-right: 3px solid transparent;
  border-bottom: 7px solid #2f2f2f;
  position: absolute;
  transform: rotate(-45deg);
`;

const E2ETest = () => {
  const duration = 0.7;

  return (
    <div>
      <Box
        style={{
          backgroundColor: '#ffffff',
          backgroundImage: 'linear-gradient(315deg, #ffffff 0%, #d7e1ec 74%)',
        }}
      >
        <NavBar
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            background: '#2196f3',
            scale: 1.25,
          }}
        >
          <MiniProfile
            style={{ background: '#767679', marginRight: '8px', scale: 0.75 }}
          />
        </NavBar>
        <MiniButton
          style={{
            x: '30px',
            background: '#336ef5',
            borderColor: '#336ef5',
          }}
        />
        <MouseArrow
          initial={{
            rotate: -45,
            x: '0px',
            y: '0px',
          }}
          animate={{
            x: ['0px', '45px', '90px', '0px'],
            y: ['5px', '55px', '5px', '5px'],
          }}
          transition={{
            flip: Infinity,
            duration: 5,
            repeatDelay: 5,
          }}
        />
        <CheckMark
          initial={{
            scale: 0,
            rotate: 45,
          }}
          animate={{
            scale: 1,
            rotate: 45,
          }}
          transition={{
            flip: Infinity,
            duration,
            delay: 5,
            repeatDelay: 5,
          }}
        />
      </Box>
    </div>
  );
};

const BranchPreview = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Box
        style={{
          backgroundColor: '#ffffff',
          backgroundImage: 'linear-gradient(315deg, #ffffff 0%, #d7e1ec 74%)',
        }}
      >
        <NavBar
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            background: '#2196f3',
            scale: 1.25,
          }}
        >
          <MiniProfile
            style={{ background: '#767679', marginRight: '8px', scale: 0.75 }}
          />
        </NavBar>
        <MiniButton
          style={{
            x: '30px',
            background: '#336ef5',
            borderColor: '#336ef5',
          }}
        />
        <div />
      </Box>

      <Box
        style={{
          zIndex: 2,
        }}
        initial={{
          backgroundColor: '#ffffff',
          backgroundImage: 'linear-gradient(315deg, #ffffff 0%, #d7e1ec 74%)',
          x: '-200px',
        }}
        animate={{
          backgroundColor: '#2884b8',
          backgroundImage: 'linear-gradient(315deg, #2884b8 0%, #d1bad2 74%)',
          x: '0px',
        }}
        transition={{
          loop: Infinity,
          duration: 2,
          delay: 2,
          repeatDelay: 4,
        }}
      >
        <NavBar
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            background: '#2196f3',
            scale: 1.25,
          }}
        >
          <MiniProfile
            style={{ background: '#767679', marginRight: '8px', scale: 0.75 }}
          />
        </NavBar>
        <MiniButton
          style={{
            x: '30px',
            background: '#336ef5',
            borderColor: '#336ef5',
          }}
        />
        <div />
      </Box>
    </div>
  );
};

const FeatureFlags = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Box
        style={{
          backgroundColor: '#000000',
          backgroundImage:
            'linear-gradient(315deg, rgb(0, 0, 0) 0%, rgb(36, 47, 88) 100%)',
        }}
      >
        <ToggleBackground>
          <ToggleDial
            initial={{
              x: '0px',
              backgroundColor: '#FFFFFF',
            }}
            animate={{
              x: '33px',
              backgroundColor: '#2fca49',
            }}
            transition={{
              yoyo: Infinity,
              duration: 0.7,
              delay: 1,
              repeatDelay: 2,
            }}
          />
        </ToggleBackground>
      </Box>
      <Box
        style={{
          backgroundColor: '#ffffff',
          backgroundImage: 'linear-gradient(315deg, #ffffff 0%, #d7e1ec 74%)',
        }}
      >
        <NavBar
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            background: '#2196f3',
            scale: 1.25,
          }}
        >
          <MiniProfile
            style={{ background: '#767679', marginRight: '8px', scale: 0.75 }}
          />
        </NavBar>
        <MiniButton
          style={{
            x: '30px',
            background: '#336ef5',
            borderColor: '#336ef5',
          }}
        />
        <MiniButton
          style={{
            x: '30px',
            background: '#f9576d',
            borderColor: '#f9576d',
          }}
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            yoyo: Infinity,
            duration: 0.7,
            delay: 2,
            repeatDelay: 2,
          }}
        />
      </Box>
    </div>
  );
};

const ToggleBackground = styled('div')`
  background: #e6e6e6;
  height: 35px;
  width: 70px;
  border-radius: 25px;
  margin: auto;
`;

const ToggleDial = styled(motion.div)`
  width: 31px;
  height: 31px;
  border-radius: 50%;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 20px 40px;
  margin-top: 2px;
  margin-left: 3px;
`;

export {
  BranchPreview,
  CodeValidation,
  E2ETest,
  FeatureFlags,
  IntegrationTest,
  UnitTest,
};
