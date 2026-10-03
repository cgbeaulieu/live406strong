// One-time image pipeline: resizes source photos and writes WebP into public/images.
// Re-run after adding or replacing a photo in images-src/:  npm run images
import sharp from "sharp";
import { mkdir, copyFile } from "node:fs/promises";

const SRC = "images-src";
const OUT = "public/images";

// [source file, output name, widths]
const photos = [
  ["hero-sessions.jpg", "hero-sessions", [960, 1600]],
  ["hero-welcome.jpg", "hero-welcome", [960, 1600]],
  ["hero-consultation.jpg", "hero-consultation", [960, 1600]],
  ["hero-recipes.jpg", "hero-recipes", [960, 1600]],
  ["feature-hiking.jpg", "feature-hiking", [640, 1200]],
  ["feature-lake.jpg", "feature-lake", [640, 1200]],
  ["feature-radio.jpg", "feature-radio", [640, 1200]],
  ["pillar-fitness.jpg", "pillar-fitness", [400]],
  ["pillar-encourage.jpg", "pillar-encourage", [400]],
  ["pillar-coaching.jpg", "pillar-coaching", [400]],
  ["sally.png", "sally", [600, 1000]],
];

// Small logos/icons are already tiny; copy as-is.
const copies = ["406icon.png", "ACSM.gif", "trx-logo.gif", "STOTT-pilates-logo.gif"];

await mkdir(OUT, { recursive: true });

for (const [file, name, widths] of photos) {
  for (const w of widths) {
    const out = `${OUT}/${name}-${w}.webp`;
    const info = await sharp(`${SRC}/${file}`)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 78, alphaQuality: 90 })
      .toFile(out);
    console.log(`${out}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
  }
}

for (const file of copies) {
  await copyFile(`${SRC}/${file}`, `${OUT}/${file}`);
}

// Social share image (1200x630) from the welcome hero.
await sharp(`${SRC}/hero-sessions.jpg`)
  .resize(1200, 630, { fit: "cover" })
  .jpeg({ quality: 80 })
  .toFile(`${OUT}/og-image.jpg`);
console.log("done");
