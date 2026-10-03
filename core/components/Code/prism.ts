import { Prism } from 'prism-react-renderer';

// @ts-ignore
(typeof global !== 'undefined' ? global : window).Prism = Prism;

// Register additional grammars on the renderer's Prism instance.
require('prismjs/components/prism-swift');
require('prismjs/components/prism-glsl');
require('prismjs/components/prism-wgsl');
require('prismjs/components/prism-diff');

export { Prism };
