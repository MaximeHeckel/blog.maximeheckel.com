import { execFileSync } from 'node:child_process';

import { inlinePandaPath, shouldInlinePanda } from '../config/inline-panda.mjs';

if (shouldInlinePanda()) {
  execFileSync('panda', ['cssgen', '--minify', '--outfile', inlinePandaPath], {
    stdio: 'inherit',
  });
}
