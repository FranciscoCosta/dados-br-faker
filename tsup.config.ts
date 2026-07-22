import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  minify: false,
  // Sourcemaps are omitted from the published package to keep it lean; tests and
  // debugging run against src/, not dist/.
  sourcemap: false,
  treeshake: true,
  splitting: false,
  target: 'es2021',
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.js' };
  },
});
