// Static site build: src/pages/*.html + src/partials/*.html -> dist/
//
// Page files start with a front-matter block:
//   ---
//   title: Page title
//   description: Meta description
//   nav: about            (which nav link gets aria-current="page")
//   ---
// Inside pages and partials:
//   {{> header}}   includes src/partials/header.html
//   {{title}}      any front-matter key or site.config.json key
//   {{root}}       prefix for links/assets ("" normally, basePath on 404.html)
import { readFile, writeFile, readdir, mkdir, cp, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

const config = JSON.parse(await readFile("site.config.json", "utf8"));
const DIST = "dist";

const partials = {};
for (const file of await readdir("src/partials")) {
  partials[path.basename(file, ".html")] = await readFile(`src/partials/${file}`, "utf8");
}

function parsePage(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  const meta = {};
  if (match) {
    for (const line of match[1].split(/\r?\n/)) {
      const i = line.indexOf(":");
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return { meta, body: match ? source.slice(match[0].length) : source };
}

function render(template, vars, depth = 0) {
  if (depth > 5) throw new Error("Partial nesting too deep");
  return template
    .replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, name) => {
      if (!(name in partials)) throw new Error(`Unknown partial: ${name}`);
      return render(partials[name], vars, depth + 1);
    })
    .replace(/\{\{\s*([\w]+)\s*\}\}/g, (_, key) => {
      if (!(key in vars)) throw new Error(`Unknown variable: {{${key}}}`);
      return vars[key];
    });
}

async function build() {
  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });
  await cp("public", DIST, { recursive: true });

  const pages = (await readdir("src/pages")).filter((f) => f.endsWith(".html"));
  const sitemapUrls = [];

  for (const file of pages) {
    const { meta, body } = parsePage(await readFile(`src/pages/${file}`, "utf8"));
    const slug = path.basename(file, ".html");
    const isNotFound = slug === "404";
    const pageUrl = `${config.siteUrl}/${slug === "index" ? "" : file}`;

    const vars = {
      ...config,
      year: String(new Date().getFullYear()),
      formAction: config.formspreeId ? `https://formspree.io/f/${config.formspreeId}` : "",
      root: isNotFound ? config.basePath : "",
      pageUrl,
      nav: "",
      robots: isNotFound ? "noindex" : "index, follow",
      ...meta,
    };

    let html = render(partials.layout, { ...vars, content: render(body, vars) });
    if (vars.nav) {
      html = html.replaceAll(`data-nav="${vars.nav}"`, `data-nav="${vars.nav}" aria-current="page"`);
    }
    await writeFile(`${DIST}/${file}`, html);
    if (!isNotFound) sitemapUrls.push(pageUrl);
  }

  await writeFile(
    `${DIST}/sitemap.xml`,
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      sitemapUrls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n") +
      `\n</urlset>\n`
  );
  await writeFile(`${DIST}/robots.txt`, `User-agent: *\nAllow: /\n\nSitemap: ${config.siteUrl}/sitemap.xml\n`);
  await writeFile(`${DIST}/.nojekyll`, "");

  execFileSync(
    process.execPath,
    ["node_modules/@tailwindcss/cli/dist/index.mjs", "-i", "src/styles.css", "-o", `${DIST}/styles.css`, "--minify"],
    { stdio: ["ignore", "ignore", "inherit"] }
  );

  console.log(`Built ${pages.length} pages into ${DIST}/`);
}

await build();
