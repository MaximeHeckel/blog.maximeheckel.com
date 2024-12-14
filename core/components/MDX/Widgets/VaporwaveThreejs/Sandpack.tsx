import { css } from '@maximeheckel/design-system';
import { useInView } from 'motion/react';
import { useRef } from 'react';

import Sandpack from '@core/components/Code/Sandpack';
import useGPUTier from '@core/hooks/useGPUTier';

import { script1 } from './script1';
import { script2 } from './script2';
import { script3 } from './script3';
import { script4 } from './script4';
import { script5 } from './script5';
import { script6 } from './script6';
import { script7 } from './script7';

const htmlSandpack = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Linear</title>
</head>
<body>
    <div id="app">
      <canvas class="webgl"></canvas>
    </div>
</body>
</html>
`;

const cssSandpack = `body {
    margin: 0;
}

.webgl {
    position: fixed;
    top: 0;
    left: 0;
    outline: none;
}
`;

const placeholder = css({
  height: '520px',

  '@media(max-width: 750px)': {
    height: '1040px',
  },
});

const SCRIPTS = {
  script1,
  script2,
  script3,
  script4,
  script5,
  script6,
  script7,
};

const VaporwaveThreejsSandpack = (props: any) => {
  const { script } = props;

  const ref = useRef(null);
  const inView = useInView(ref);
  const { tier, loading: tierLoading } = useGPUTier();

  const autorun = tier > 1;

  return (
    <div ref={ref}>
      {inView && !tierLoading ? (
        <Sandpack
          autorun={autorun}
          template="vanilla"
          dependencies={{
            three: '0.134.0',
          }}
          files={{
            '/index.js': {
              // @ts-ignore
              code: SCRIPTS[script],
            },
            '/index.html': {
              code: htmlSandpack,
              hidden: true,
            },
            '/styles.css': {
              code: cssSandpack,
              hidden: true,
            },
          }}
        />
      ) : (
        <div className={placeholder()} />
      )}
    </div>
  );
};

export default VaporwaveThreejsSandpack;
