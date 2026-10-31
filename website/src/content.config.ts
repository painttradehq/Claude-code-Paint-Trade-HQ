import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Blog posts live in src/content/blog/*.md. Facts in them must come from docs/website/chat-knowledge.md.
 * Screens inside a post are plain HTML <figure class="shot shot--browser|shot--phone"> blocks (markdown allows raw HTML);
 * the post template styles them. Screens show Harbourline Painting, the demo business: real screens, made-up people and jobs.
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
    /** Sort key among posts with the same date (lower first). */
    order: z.number().default(99),
  }),
});

export const collections = { blog };
