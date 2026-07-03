# Alex Lane Photography

A fast, editorial photography portfolio and booking site. Built to show the work
and turn visitors into paying clients.

- **Astro 5** (static) · **TypeScript** · **Tailwind CSS v4**
- **Cloudflare Pages** hosting + a single **Pages Function** for the contact form
- **Cloudflare KV** durable lead log · **Turnstile** spam protection · **Resend** email
- Local, build-optimized images (AVIF/WebP + blur-up) — no external image service

---

## Quick start

```bash
pnpm install
pnpm dev            # UI dev server at http://localhost:4321
```

`pnpm dev` runs the site but **not** the contact function (that needs the
Cloudflare runtime). To test the form end to end:

```bash
cp .dev.vars.example .dev.vars   # fill in real values, or keep the test keys
pnpm build
pnpm pages:dev                   # full site + /api/contact at http://localhost:8788
```

> Two dev loops by design: `astro dev` for fast UI work, `wrangler pages dev` when
> you need the form/function. The `.dev.vars` defaults use Cloudflare Turnstile
> **test keys** (always pass) so local submits work offline.

---

## Adding your photos and content

Everything is plain files — no CMS to log into.

1. **Drop images** into `src/assets/placeholders/` (or a folder of your own under
   `src/`). Replace every `REPLACE`-labelled placeholder.
2. **Galleries** — edit `src/content/galleries/portraits.json` and `travel.json`.
   Each photo needs `src` (relative path) and `alt` (required — the build fails
   without it). Regenerate throwaway placeholders anytime with
   `node scripts/gen-placeholders.mjs`.
3. **Testimonials** — one JSON file each in `src/content/testimonials/`.
4. **Packages / pricing** — `src/content/packages/`.
5. **Copy, brand, contact, positioning** — all in `src/config/site.ts`.

Images are optimized at build time. At a few hundred photos this is fine; if
builds get slow, pre-generate derivatives and commit them so the deploy does no
image work.

---

## Deploy to Cloudflare Pages

1. Push this repo to GitHub and connect it in **Cloudflare Pages → Create → Connect to Git**.
   - Build command: `pnpm build`
   - Output directory: `dist`
   - `NODE_VERSION` = `20` (or newer)
2. **Create the KV namespace** and bind it:
   ```bash
   wrangler kv namespace create INQUIRIES
   ```
   Paste the id into `wrangler.toml`, and add the binding in
   **Pages → Settings → Functions → KV bindings** (variable name `INQUIRIES`).
3. **Secrets** (Pages → Settings → Environment variables, for **Production and Preview**):
   - `TURNSTILE_SECRET_KEY`
   - `RESEND_API_KEY`
   - `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`
4. **Build variables** (public):
   - `PUBLIC_TURNSTILE_SITE_KEY`
   - `PUBLIC_CF_BEACON_TOKEN` (Web Analytics; optional)
5. **Custom domain** — add it in Pages, then update `site` in `astro.config.mjs`
   and the sitemap URL in `public/robots.txt`.
6. **Resend** — verify your sending domain (SPF/DKIM/DMARC DNS) before real sends.
7. **Turnstile** — create a widget for your domain and use its real site/secret keys.
8. **Rate limiting** — add a WAF rate-limit rule on `/api/contact` (e.g. 5 req/min/IP).

---

## Before you launch

- [ ] Replace every placeholder photo (they all say `REPLACE`).
- [ ] Add real testimonials and finalize package pricing.
- [ ] Fill in `src/config/site.ts` (brand, email, service area, Instagram, bio).
- [ ] Set the production domain in `astro.config.mjs` and `robots.txt`.
- [ ] Wire Turnstile, Resend, KV, and analytics secrets in Pages.
- [ ] **Set up a Google Business Profile** — the biggest free lever for local booking search.
- [ ] Submit a test inquiry on the live site and confirm the email + KV entry.

---

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | UI dev server (no function) |
| `pnpm build` | Static build to `dist/` |
| `pnpm preview` | Preview the static build |
| `pnpm pages:dev` | Full site + function via Wrangler |
| `pnpm check` | Astro + TypeScript check |
