// @ts-check
import { defineConfig } from 'astro/config';
import deno from '@deno/astro-adapter';

// https://astro.build/config
export default defineConfig({
    image: {
        layout: 'full-width',
        responsiveStyles: true,
    },
    output: 'static',
    adapter: deno(),
});
