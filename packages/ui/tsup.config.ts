import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/server.ts'],
  outDir: 'dist',
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: false,
  treeshake: true,
  splitting: false,
  target: 'es2020',
  external: [
    'react',
    'react-dom',
    'next',
    'next/*',
    'react-multi-date-picker',
    'react-date-object',
    'react-date-object/*',
  ],
});
