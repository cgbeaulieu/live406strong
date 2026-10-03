// Local preview: builds the site, serves dist/ on http://localhost:4000, rebuilds on changes.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { watch } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const PORT = Number(process.env.PORT) || 4000;
const DIST = path.resolve("dist");
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".xml": "application/xml",
  ".txt": "text/plain",
};

const build = () => {
  try {
    execFileSync(process.execPath, ["scripts/build.mjs"], { stdio: "inherit" });
  } catch {
    console.error("Build failed — fix the error above and save again.");
  }
};

build();

let timer;
for (const dir of ["src", "public"]) {
  watch(dir, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(build, 150);
  });
}

const { basePath } = JSON.parse(await readFile("site.config.json", "utf8"));

createServer(async (req, res) => {
  let urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
  // Mirror the hosted layout, where the site lives under basePath (used by 404.html).
  if (urlPath.startsWith(basePath)) urlPath = "/" + urlPath.slice(basePath.length);
  let file = path.join(DIST, urlPath);
  if (!file.startsWith(DIST)) return res.writeHead(403).end();
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
  } catch {
    // GitHub Pages and Cloudflare serve /about from about.html
    file = `${file}.html`;
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" }).end(body);
  } catch {
    res.writeHead(404, { "Content-Type": TYPES[".html"] }).end(await readFile(path.join(DIST, "404.html")));
  }
}).listen(PORT, () => console.log(`Preview: http://localhost:${PORT}`));
