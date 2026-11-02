import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const posts = defineCollection({
  loader: glob({ base: "./src/content/posts", pattern: "**/*.mdx" }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    source: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
