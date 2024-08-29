import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'dist/OpenKeyNav.js',  // Input is the transpiled file from Babel
  output: {
    file: 'dist/openkeynav.umd.js',
    format: 'umd',
    name: 'OpenKeyNav',  // This will be the global variable name in the browser
    globals: {
      // Specify any external dependencies here, if needed
    },
  },
  plugins: [
    resolve(),    // Resolve modules from node_modules
    commonjs(),   // Convert CommonJS modules to ES6 so they can be included in a Rollup bundle
    babel({
      exclude: 'node_modules/**', // Only transpile our source code
    }),
  ],
  external: [],  // If there are external libraries, list them here
};
