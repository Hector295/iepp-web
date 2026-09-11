import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://iepp.velifatech.com',
  output: 'static',
  outDir: './out',
  devToolbar: { enabled: false },
});
