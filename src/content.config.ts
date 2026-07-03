import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Galleries — one JSON file per collection/shoot.
 * `image()` optimizes at build time AND fails the build if a file is missing.
 * `alt` is required, so accessibility is enforced before anything ships.
 */
const galleries = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/galleries" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      category: z.enum(["portraits", "travel"]),
      description: z.string().optional(),
      date: z.coerce.date(),
      featured: z.boolean().default(false),
      order: z.number().default(0),
      cover: image(),
      coverAlt: z.string().min(1),
      photos: z
        .array(
          z.object({
            src: image(),
            alt: z.string().min(1),
            caption: z.string().optional(),
          }),
        )
        .min(1),
    }),
});

/** Testimonials — attribution drives conversion, so name + detail are required. */
const testimonials = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/testimonials" }),
  schema: ({ image }) =>
    z.object({
      quote: z.string(),
      name: z.string(),
      detail: z.string(), // shoot type, role, or company
      avatar: image().optional(),
      result: z.string().optional(),
      featured: z.boolean().default(true),
      order: z.number().default(0),
    }),
});

/** Packages — "starting at" pricing with clear inclusions and one anchor tier. */
const packages = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/packages" }),
  schema: z.object({
    name: z.string(),
    startingPrice: z.string(), // e.g. "$450" — string keeps "Starting at" flexible
    tagline: z.string().optional(),
    inclusions: z.array(z.string()).min(1),
    popular: z.boolean().default(false),
    ctaLabel: z.string().default("Book this session"),
    order: z.number().default(0),
  }),
});

export const collections = { galleries, testimonials, packages };
