import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders'; // Not available with legacy API

const projects = defineCollection({
    schema: ({ image }) => z.object({
      coordinates: z.array(z.number()),
      title: z.string(),
      description: z.string(),
      cover: image(),
    }),
    loader: glob({ pattern: "**/*.md", base: "./src/data/projects" }),
});

export const collections = { projects };
