//import esbuild from 'esbuild'
const esbuild = require('esbuild')

esbuild
  .build({
    entryPoints: ['src/gen_game.ts'], // Replace with your actual script name
    outfile: 'dist/gen_game.js', // Output bundle file
    bundle: true,
    platform: 'browser',
    target: 'esnext',
    format: 'esm',
    define: {
      global: 'globalThis',
    },
    external: ['fs', 'path'],
    plugins: [],
  })
  .catch((e) => {
    console.log('error', e)
    process.exit(1)
  })
