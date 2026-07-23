// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://idonov8.github.io',
  base: '/meet-case-studies',

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  }
});
