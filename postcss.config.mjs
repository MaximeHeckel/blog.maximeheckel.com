import { shouldInlinePanda } from './config/inline-panda.mjs';

export default {
  plugins: shouldInlinePanda() ? {} : { '@pandacss/dev/postcss': {} },
};
