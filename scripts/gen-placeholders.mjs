/**
 * Generates clearly-marked placeholder images so the site builds before Alex
 * adds real photos. Every output says "REPLACE" so nothing ships by accident.
 *
 *   node scripts/gen-placeholders.mjs
 *
 * Safe to delete once real photography is in place.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "src", "assets", "placeholders");

// Warm, on-brand placeholder tones.
const tones = ["#b79b82", "#9c6b4a", "#7d5236", "#6f6357", "#8a7a68", "#a68a6d"];

/** @param {string} name @param {number} w @param {number} h @param {string} tone @param {string} label */
async function make(name, w, h, tone, label) {
  const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${w}" height="${h}" fill="${tone}"/>
      <rect x="12" y="12" width="${w - 24}" height="${h - 24}" fill="none"
            stroke="rgba(255,255,255,0.5)" stroke-width="3" stroke-dasharray="14 10"/>
      <text x="50%" y="47%" fill="rgba(255,255,255,0.92)" font-family="Georgia, serif"
            font-size="${Math.round(w / 16)}" text-anchor="middle">REPLACE</text>
      <text x="50%" y="56%" fill="rgba(255,255,255,0.85)" font-family="monospace"
            font-size="${Math.round(w / 34)}" text-anchor="middle">${label}</text>
    </svg>`;
  const file = join(outDir, name);
  await sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toFile(file);
  console.log("  wrote", name);
}

await mkdir(outDir, { recursive: true });

const jobs = [];
// Hero + covers (landscape)
jobs.push(make("hero.jpg", 2400, 1500, tones[1], "hero.jpg"));
jobs.push(make("cover-portraits.jpg", 1800, 2200, tones[0], "cover-portraits.jpg"));
jobs.push(make("cover-travel.jpg", 2400, 1600, tones[2], "cover-travel.jpg"));
// Portrait set (tall)
for (let i = 1; i <= 6; i++) {
  jobs.push(make(`portrait-${i}.jpg`, 1600, 2000, tones[i % tones.length], `portrait-${i}.jpg`));
}
// Travel set (wide)
for (let i = 1; i <= 6; i++) {
  jobs.push(make(`travel-${i}.jpg`, 2400, 1600, tones[(i + 2) % tones.length], `travel-${i}.jpg`));
}
// Testimonial avatars (square)
for (let i = 1; i <= 3; i++) {
  jobs.push(make(`avatar-${i}.jpg`, 400, 400, tones[(i + 1) % tones.length], `avatar-${i}`));
}
// About headshot
jobs.push(make("headshot.jpg", 1400, 1750, tones[4], "headshot.jpg"));

await Promise.all(jobs);
console.log("Placeholders ready in src/assets/placeholders/");
