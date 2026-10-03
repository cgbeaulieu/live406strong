# 406 Strong

Website for **406 Strong**, Sally Beaulieu's personal training studio in Whitefish, Montana.

**Live site:** https://cgbeaulieu.github.io/live406strong/

It's a plain static site: HTML pages, [Tailwind CSS](https://tailwindcss.com/), and a small amount of vanilla JavaScript. There is no server or database. Pushing to `main` rebuilds and publishes it automatically via GitHub Actions.

## Editing

| To change… | Edit |
| --- | --- |
| Home / About / Contact page text | `src/pages/index.html`, `about.html`, `contact.html` |
| Header, footer, or the yellow "Ready to feel strong?" band | `src/partials/header.html`, `footer.html`, `cta.html` |
| Page `<head>` (fonts, SEO tags) | `src/partials/layout.html` |
| Colors and fonts | `src/styles.css` (the `@theme` block) |
| Menu, slideshow, and contact form behavior | `public/site.js` |
| Site URL, email address, Formspree form ID | `site.config.json` |

Each page starts with a small header block for its browser title and search description:

```html
---
title: About Sally Beaulieu | 406 Strong | Whitefish, MT
description: Shown in Google results and link previews.
nav: about
---
```

`{{> header}}` pulls in a partial and `{{email}}` inserts a value from `site.config.json`.

## Running it locally

Requires [Node.js](https://nodejs.org/) 20 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:4000. The page rebuilds whenever you save a file (refresh the browser to see changes).

`npm run build` writes the finished site to `dist/`.

## Photos

Original, full-size photos live in `images-src/`. The site uses resized WebP copies in `public/images/`. To add or replace a photo, drop the original in `images-src/`, add it to the list in `scripts/optimize-images.mjs`, and run:

```bash
npm run images
```

## Contact form

The form sends submissions through [Formspree](https://formspree.io) (free tier: 50 submissions/month), because GitHub Pages can't send email itself.

1. Create a free Formspree account using the inbox that should receive messages.
2. Create a new form and copy its ID (the part after `/f/` in the endpoint, e.g. `xyzabcd`).
3. Put it in `site.config.json` as `"formspreeId": "xyzabcd"` and push.

Until a form ID is set, pressing **Send** opens the visitor's own email app with the message pre-filled and addressed to Sally.

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
