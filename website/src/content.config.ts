import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Blog posts live in src/content/blog/*.md. Facts in them must come from docs/website/chat-knowledge.md.
 * `draft: true` shows a Draft badge and keeps the post out of search engines until Josh approves it.
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    tag: z.string().default('From the workshop'),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
