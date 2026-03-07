// @ts-check
import { defineConfig } from 'astro/config';
import denoAdapter from '@deno/astro-adapter';
import denoPlugin from '@deno/vite-plugin';

// https://astro.build/config
export default defineConfig({
    image: {
        layout: 'full-width',
        responsiveStyles: true,
    },
    output: 'static',
    adapter: denoAdapter(),
    vite: {
        plugins: [denoPlugin()],
    },
});
