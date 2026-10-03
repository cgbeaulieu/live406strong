# 406 Strong

Website for **406 Strong**, Sally Beaulieu's personal training studio in Whitefish, Montana.

**Live site:** https://cgbeaulieu.github.io/live406strong/

A single-page static site: HTML, [Tailwind CSS](https://tailwindcss.com/), and a little vanilla JavaScript. There is no server or database. Pushing to `main` rebuilds and publishes it automatically via GitHub Actions.

## Design

- **Concept: "Strong for every season."** Montana's seasons, and staying strong through every season of life, which is Sally's own philosophy.
- **The Montana window.** The hero frames mountains inside the Montana silhouette (traced from the logo into `src/montana-path.txt`), with Sally stepping out of it and the logo's gold heart marking Whitefish.
- **Palette.** Glacier ink `#0e2a33`, brand teal `#015778`, trailhead sand `#f6f1e8`, and logo gold `#f7bf33`. Every text color pair passes WCAG AA.
- **Type.** Fraunces (display) and Figtree (body), from Google Fonts.
- **Texture.** Generated topographic contour lines (`public/images/topo.svg`), a nod to trail maps.
- **Real people only.** Photos of Sally, her hiking group, and Montana lakes come from the original site, and the testimonials are real client words.

Sections, in order: hero → credentials → "Sound familiar?" → Ways to train → How it starts → Meet Sally → Client stories → Beyond the studio → FAQ → Contact.

## Editing

| To change… | Edit |
| --- | --- |
| Any page text, photos, FAQ answers, testimonials | `src/pages/index.html` (each section is labeled with a comment) |
| Header, mobile menu, footer | `src/partials/header.html`, `footer.html` |
| Page `<head>` (fonts, SEO, link-preview tags) | `src/partials/layout.html` |
| Colors, fonts, buttons, form fields | `src/styles.css` (the `@theme` block holds the palette) |
| Menu, scroll effects, mobile call-to-action bar, contact form | `public/site.js` |
| Site URL, email address, Formspree form ID | `site.config.json` |
| The "page not found" page | `src/pages/404.html` |

Each page starts with a small header block:

```html
---
title: Shown in the browser tab and Google results
description: Shown under the title in Google results and link previews.
---
```

`{{> header}}` pulls in a partial and `{{email}}` inserts a value from `site.config.json`.

## Running it locally

Requires [Node.js](https://nodejs.org/) 20 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:4000. The site rebuilds whenever you save a file (refresh the browser to see changes).

`npm run build` writes the finished site to `dist/`.

## Photos

Original, full-size photos live in `images-src/`. The site uses resized WebP copies in `public/images/`. The same pipeline generates the favicon, the link-preview card (`og-image.jpg`), and the topographic texture. To add or replace a photo, drop the original in `images-src/`, add it to `scripts/optimize-images.mjs`, and run:

```bash
npm run images
```

## Contact form

The form sends submissions through [Formspree](https://formspree.io) (free tier: 50 submissions/month), because GitHub Pages can't send email itself.

1. Create a free Formspree account using the inbox that should receive messages.
2. Create a new form and copy its ID (the part after `/f/` in the endpoint, e.g. `xyzabcd`).
3. Put it in `site.config.json` as `"formspreeId": "xyzabcd"` and push.

Until a form ID is set, pressing **Send to Sally** opens the visitor's own email app with their note pre-filled and addressed to Sally.

## Custom domain

To serve the site at `406strong.com` instead of the github.io address:

1. In the repo's **Settings → Pages**, enter the custom domain.
2. At the domain's DNS provider, point it at GitHub Pages ([instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)).
3. Update `siteUrl` in `site.config.json` to `https://406strong.com` and `basePath` to `/`.

The same `dist/` output can also be deployed to Cloudflare Pages or Netlify unchanged (build command `npm run build`, output directory `dist`).

## History

This site began life as a Ruby on Rails app. That version is preserved under the `rails-archive` git tag:

```bash
git checkout rails-archive
```
