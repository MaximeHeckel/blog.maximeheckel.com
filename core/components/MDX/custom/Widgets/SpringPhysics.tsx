import { curveBasisOpen } from '@visx/curve';
import { scaleLinear } from '@visx/scale';
import { LinePath } from '@visx/shape';
import { motion } from 'framer-motion';
import React from 'react';
import { AnimationCard, AnimationCardContent, Form } from './Components';

const loop = (stiffness: number, mass: number, damping: number) => {
  /* Spring Length, set to 1 for simplicity */
  const springLength = 1;

  /* Object position and velocity. */
  let x = 2;
  let v = 0;

  /* Spring stiffness, in kg / s^2 */
  const k = -stiffness;

  /* Damping constant, in kg / s */
  const d = -damping;

  /* Framerate: we want 60 fps hence the framerate here is at 1/60 */
  const frameRate = 1 / 60;

  const positions = [];
  let i = 0;

  /* We loop 600 times, i.e. for 600 frames which is equivalent to 10s*/
  while (i < 600) {
    const Fspring = k * (x - springLength);
    const Fdamping = d * v;

    const a = (Fspring + Fdamping) / mass;
    v += a * frameRate;
    x += v * frameRate;

    i++;

    positions.push({
      y: x, // x is the position
      x: i, // i is the frame
    });
  }

  return positions;
};

const getX = (d: { x: number; y: number }) => d.x;
const getY = (d: { x: number; y: number }) => d.y;

const height = 200;
const width = 400;

const SpringPhysics = (props: { withDamping?: boolean }) => {
  const { withDamping = false } = props;
  const [mass, setMass] = React.useState(1);
  const [stiffness, setStiffness] = React.useState(20);
  const [damping, setDamping] = React.useState(0.3);

  const initialData = loop(stiffness, mass, damping);
  const [data, setData] = React.useState(initialData);

  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (withDamping) {
      setData(loop(stiffness, mass, damping));
    } else {
      setData(loop(stiffness, mass, 0));
    }

    setCount(count + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mass, stiffness, damping]);

  const xScale = React.useMemo(
    () =>
      scaleLinear({
        range: [width, 0],
        domain: [data[data.length - 1].x, data[0].x],
        nice: true,
      }),
    [data]
  );

  const yScale = React.useMemo(
    () =>
      scaleLinear({
        range: [height, 0],
        domain: [
          // eslint-disable-next-line prefer-spread
          Math.min.apply(
            Math,
            data.map((d) => d.y)
          ),
          // eslint-disable-next-line prefer-spread
          Math.max.apply(
            Math,
            data.map((d) => d.y)
          ),
        ],
        nice: true,
      }),
    [data]
  );

  return (
    <AnimationCard>
      <AnimationCardContent
        css={{
          height: 700,
        }}
      >
        <Form
          style={{
            margin: '20px 0',
            height: '175px',
            maxWidth: '400px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
          }}
        >
          <div style={{ display: 'grid' }}>
            <label htmlFor="mass">Mass {mass}</label>
            <input
              id="mass"
              type="range"
              min="1"
              max="10"
              value={mass}
              onChange={(e) => setMass(parseInt(e.target.value, 10))}
            />
          </div>
          <div style={{ display: 'grid' }}>
            <label htmlFor="stiffness">Stiffness {stiffness}</label>
            <input
              id="stiffness"
              type="range"
              min="1"
              max="500"
              value={stiffness}
              onChange={(e) => setStiffness(parseInt(e.target.value, 10))}
            />
          </div>
          {withDamping ? (
            <div style={{ display: 'grid' }}>
              <label htmlFor="damping">Damping {damping}</label>
              <input
                id="damping"
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={damping}
                onChange={(e) => setDamping(parseInt(e.target.value, 10))}
              />
            </div>
          ) : null}
        </Form>

        <div>
          <svg width={width} height={height}>
            <LinePath
              data={data}
              x={(d) => xScale(getX(d)) ?? 0}
              y={(d) => yScale(getY(d)) ?? 0}
              curve={curveBasisOpen}
              strokeWidth={2}
              strokeOpacity={0.8}
              strokeLinecap="round"
              fill="none"
              stroke="#ff008c"
            />
          </svg>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '200px',
            marginTop: '30px',
          }}
        >
          <motion.div
            key={count}
            style={{
              background:
                'linear-gradient(180deg, #ff008c 0%, rgb(211, 9, 225) 100%)',
              height: '100px',
              width: '100px',
              borderRadius: '10px',
            }}
            animate={{
              rotate: 180,
              y: -20,
              borderRadius: '50%',
            }}
            transition={{
              type: 'spring',
              stiffness,
              mass,
              damping: withDamping ? damping : 0,
            }}
          />
        </div>
      </AnimationCardContent>
    </AnimationCard>
  );
};

export default SpringPhysics;
