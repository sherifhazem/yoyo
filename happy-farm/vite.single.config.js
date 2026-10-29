// One self-contained bundle (no code splitting) so the game can be inlined into a single HTML page.
import { defineConfig } from 'vite';
export default defineConfig({
  base: './',
  publicDir: false,
  build: { target: 'es2022', outDir: 'dist-single', cssCodeSplit: false, rollupOptions: { output: { inlineDynamicImports: true } } },
});
