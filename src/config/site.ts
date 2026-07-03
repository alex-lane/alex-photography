/**
 * Central site configuration + marketing copy.
 * This is the one file to edit for brand, positioning, contact, and CTAs.
 * Everything here is placeholder copy — rewrite it in your own voice.
 */
export const site = {
  brand: "Alex Lane Photography", // TODO: your brand name
  // The one-line pitch in the hero: what you shoot + where.
  positioning: "Portrait & travel photography for people who want to remember it properly.",
  tagline: "Natural, unhurried portraits — and the light of far-off places.",
  serviceArea: "Based in [Your City] · available worldwide", // TODO
  // Sets expectations near the form; a real promise you can keep.
  responseTime: "I reply to every inquiry within 24 hours.",
  email: "hello@example.com", // TODO: your inbox
  // Repeated call-to-action label across the site.
  primaryCta: "Book a session",

  social: {
    instagram: "https://instagram.com/yourhandle", // TODO
    // Add more as needed; empty strings are hidden.
  },

  hero: {
    kicker: "Portrait & Travel Photographer",
    headline: "Photographs worth\nlooking back on.",
    sub: "Unhurried portrait sessions and honest travel work — made to be printed, framed, and kept.",
  },

  about: {
    headline: "Hi, I'm Alex.",
    body: [
      "I've spent the last [X] years learning that the best portraits happen when people forget the camera is there. My work is relaxed, natural, and built around you — not a set of stiff poses.",
      "When I'm not photographing people, I'm chasing light somewhere far from home. That travel work keeps my eye sharp and my sessions unpredictable in the best way.",
    ],
  },
} as const;

export type Site = typeof site;
