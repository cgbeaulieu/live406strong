// Image pipeline: turns the originals in images-src/ into web-ready files in public/images/.
// Re-run after adding or replacing a photo:  npm run images
import sharp from "sharp";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";

const SRC = "images-src";
const OUT = "public/images";

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const report = (out, info) =>
  console.log(`${out.padEnd(44)} ${String(info.width).padStart(4)}x${String(info.height).padEnd(4)} ${(info.size / 1024).toFixed(0).padStart(4)} KB`);

async function webp(input, name, widths, { quality = 76, prepare = (img) => img } = {}) {
  for (const w of widths) {
    const out = `${OUT}/${name}-${w}.webp`;
    const info = await prepare(sharp(input))
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality, alphaQuality: 90, effort: 6 })
      .toFile(out);
    report(out, info);
  }
}

// Sally cutout, cropped head-to-thigh and trimmed to her silhouette for the hero.
// The original cutout carries near-invisible background residue (alpha < ~40) that a CSS
// drop-shadow turns into a visible haze, so those pixels are zeroed before trimming.
const { data: sallyPx, info: sallyInfo } = await sharp(`${SRC}/sally.png`)
  .extract({ left: 0, top: 220, width: 2472, height: 2380 })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
for (let i = 3; i < sallyPx.length; i += 4) if (sallyPx[i] < 40) sallyPx[i] = 0;
const sallyTrimmed = await sharp(sallyPx, { raw: sallyInfo }).png().toBuffer()
  .then((png) => sharp(png).trim({ threshold: 1 }).png().toBuffer());
await webp(sallyTrimmed, "sally-hero", [280, 440, 720, 1000]);

// Real photos.
await webp(`${SRC}/black and white photo.jpg`, "sally-headshot", [300]);
await webp(`${SRC}/excursions.jpg`, "hike-group", [480, 716]);
await webp(`${SRC}/Lake.JPG`, "glacier-lake", [480, 716]);
await webp(`${SRC}/lake2.jpg`, "turquoise-lake", [640]);
await webp(`${SRC}/fit4montana.jpg`, "fit4montana", [460]);
await webp(`${SRC}/1048412_4479151477430_703202202_o.jpg`, "grill", [600, 1140]);

// Big-sky backdrop inside the Montana-shaped hero window.
await webp(`${SRC}/feature-hiking.jpg`, "big-sky", [560, 800, 1200], { quality: 72 });

// Logo, trimmed of transparent padding.
await webp(`${SRC}/406stronglogo.png`, "logo", [240, 480], { quality: 90, prepare: (img) => img.trim() });

// Montana silhouette traced from the logo (see src/montana-path.txt), 743x431 units.
const montana = (await readFile("src/montana-path.txt", "utf8")).trim();
const [mw, mh] = [743, 431];

await writeFile(`${OUT}/montana.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${mw} ${mh}" preserveAspectRatio="none"><path d="${montana}"/></svg>\n`);

// Favicon + touch icons: teal Montana with the gold heart over Whitefish, like the logo.
const heart = (x, y, s) =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M0-3C-1.6-6.4-7-6-7-1.6-7 2 0 6.5 0 6.5S7 2 7-1.6C7-6 1.6-6.4 0-3Z" fill="#f7bf33"/>`;
const iconSvg = (size, pad, bg) => {
  const scale = (size - pad * 2) / mw;
  const y = (size - mh * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    (bg ? `<rect width="${size}" height="${size}" rx="${size * 0.22}" fill="${bg}"/>` : "") +
    `<g transform="translate(${pad} ${y}) scale(${scale})"><path d="${montana}" fill="#015778"/>${heart(mw * 0.168, mh * 0.2, 7.5)}</g></svg>`;
};
await writeFile(`${OUT}/favicon.svg`, iconSvg(64, 3, null));
report(`${OUT}/apple-touch-icon.png`, await sharp(Buffer.from(iconSvg(180, 22, "#f6f1e8"))).png().toFile(`${OUT}/apple-touch-icon.png`));
report(`${OUT}/icon-512.png`, await sharp(Buffer.from(iconSvg(512, 64, "#f6f1e8"))).png().toFile(`${OUT}/icon-512.png`));

// Social share card (1200x630): Montana window with mountains, Sally, headline.
{
  const W = 1200, H = 630;
  const winW = 588, winH = Math.round(winW * mh / mw), winX = 572, winY = 236;
  const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${winW}" height="${winH}" viewBox="0 0 ${mw} ${mh}" preserveAspectRatio="none"><path d="${montana}"/></svg>`);
  const windowImg = await sharp(`${SRC}/feature-hiking.jpg`).resize(winW, winH, { fit: "cover" })
    .composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  const sally = await sharp(sallyTrimmed).resize({ height: 560 }).png().toBuffer();
  const { width: sallyW, height: sallyH } = await sharp(sally).metadata();
  const text = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <text x="72" y="150" font-family="Georgia, serif" font-size="28" fill="#015778" letter-spacing="4">406 STRONG</text>
    <text x="72" y="250" font-family="Georgia, serif" font-size="76" fill="#0e2a33">Strong for</text>
    <text x="72" y="338" font-family="Georgia, serif" font-size="76" font-style="italic" fill="#015778">every season.</text>
    <text x="72" y="424" font-family="Arial, sans-serif" font-size="27" fill="#3d545c">Personal training with Sally Beaulieu</text>
    <text x="72" y="462" font-family="Arial, sans-serif" font-size="27" fill="#3d545c">Whitefish, Montana · In studio &amp; virtual</text>
  </svg>`);
  const info = await sharp({ create: { width: W, height: H, channels: 4, background: "#f6f1e8" } })
    .composite([
      { input: windowImg, left: winX, top: winY },
      { input: sally, left: winX + winW - sallyW - 70, top: H - sallyH },
      { input: text, left: 0, top: 0 },
    ])
    .jpeg({ quality: 84 })
    .toFile(`${OUT}/og-image.jpg`);
  report(`${OUT}/og-image.jpg`, info);
}

// Topographic contour texture: concentric wobbly rings around a few "peaks".
{
  const W = 1200, H = 900;
  let seed = 406;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const peaks = [[880, 300, 15], [1120, 760, 10], [380, 820, 8], [150, 140, 6]];
  let paths = "";
  for (const [cx, cy, rings] of peaks) {
    const ph = [rand() * 6.28, rand() * 6.28, rand() * 6.28];
    for (let k = 1; k <= rings; k++) {
      const r0 = k * 34;
      const pts = [];
      for (let i = 0; i < 72; i++) {
        const t = (i / 72) * Math.PI * 2;
        const wobble = 1 + 0.16 * Math.sin(3 * t + ph[0] + k * 0.12) + 0.09 * Math.sin(5 * t + ph[1] - k * 0.08) + 0.05 * Math.sin(2 * t + ph[2]);
        pts.push([cx + Math.cos(t) * r0 * wobble * 1.25, cy + Math.sin(t) * r0 * wobble]);
      }
      paths += `<path d="M${pts.map(([x, y]) => `${Math.round(x)} ${Math.round(y)}`).join("L")}Z"/>`;
    }
  }
  await writeFile(`${OUT}/topo.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" fill="none" stroke="#015778" stroke-width="1.2" stroke-linejoin="round">${paths}</svg>\n`);
  console.log(`${OUT}/topo.svg`);
}

console.log("done");
