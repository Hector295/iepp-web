import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://iepp.pe',
  output: 'static',
  outDir: './out',
  devToolbar: { enabled: false },
});
