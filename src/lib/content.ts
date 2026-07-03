import { getCollection, type CollectionEntry } from "astro:content";
import type { ImageMetadata } from "astro";

export type Category = "portraits" | "travel";

export async function getGalleries(): Promise<CollectionEntry<"galleries">[]> {
  const galleries = await getCollection("galleries");
  return galleries.sort((a, b) => a.data.order - b.data.order);
}

export async function getGalleryByCategory(
  category: Category,
): Promise<CollectionEntry<"galleries"> | undefined> {
  const galleries = await getCollection("galleries");
  return galleries.find((g) => g.data.category === category);
}

export interface FeaturedPhoto {
  src: ImageMetadata;
  alt: string;
  category: Category;
  href: string;
}

/**
 * A curated set for the home "featured work" band. Portraits lead because
 * that is the commercial spine; travel fills in behind it.
 */
export async function getFeaturedPhotos(limit = 6): Promise<FeaturedPhoto[]> {
  const galleries = (await getGalleries()).filter((g) => g.data.featured);
  const photos: FeaturedPhoto[] = [];
  for (const g of galleries) {
    for (const p of g.data.photos) {
      photos.push({
        src: p.src,
        alt: p.alt,
        category: g.data.category,
        href: `/galleries/${g.data.category}`,
      });
    }
  }
  photos.sort((a, b) => Number(b.category === "portraits") - Number(a.category === "portraits"));
  return photos.slice(0, limit);
}

export async function getTestimonials(): Promise<CollectionEntry<"testimonials">[]> {
  const items = await getCollection("testimonials", ({ data }) => data.featured);
  return items.sort((a, b) => a.data.order - b.data.order);
}

export async function getPackages(): Promise<CollectionEntry<"packages">[]> {
  const items = await getCollection("packages");
  return items.sort((a, b) => a.data.order - b.data.order);
}
