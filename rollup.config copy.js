import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'main.ts',
  output: {
    dir: '.',
    format: 'cjs',
    sourcemap: true,
    exports: 'default'
  },
  external: ['obsidian'],
  plugins: [typescript(), nodeResolve(), commonjs()]
};