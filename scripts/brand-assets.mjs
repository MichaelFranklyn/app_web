/**
 * Gera os arquivos raster da marca Itinus a partir dos SVGs de `public/brand/`.
 *
 * Os SVGs são a fonte da verdade (texto já convertido em curvas, sem depender
 * de fonte instalada). Este script só rasteriza para os caminhos que o app, o
 * manifest, o service worker, os PDFs e os emails já referenciam — por isso os
 * nomes antigos (`horizontal_logo.png`, `icon-192.png`…) continuam: emails já
 * enviados e o backend (`LOGO_PATH`) apontam para eles.
 *
 * Uso: `npm run brand:assets` (rodar de novo sempre que um SVG mudar).
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const PUBLIC = path.resolve(import.meta.dirname, "../public");
const BRAND = path.join(PUBLIC, "brand");
const read = (name) => fs.readFileSync(path.join(BRAND, name));

async function png(svgName, out, { width, height }) {
  await sharp(read(svgName), { density: 600 })
    .resize({ width, height, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(PUBLIC, out));
  console.log("ok", out);
}

/** ICO com PNGs embutidos (aceito por todos os navegadores atuais). */
async function ico(svgName, out, sizes) {
  const images = await Promise.all(
    sizes.map((s) => sharp(read(svgName), { density: 600 }).resize(s, s).png().toBuffer()),
  );
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach((img, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], e);
    header.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], e + 1);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(img.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += img.length;
  });
  fs.writeFileSync(path.join(PUBLIC, out), Buffer.concat([header, ...images]));
  console.log("ok", out);
}

// Marca horizontal (sidebar, login, PDFs, emails). Altura fixa; largura segue a proporção.
await png("itinus-horizontal.svg", "horizontal_logo.png", { height: 256 });
fs.copyFileSync(path.join(BRAND, "itinus-horizontal.svg"), path.join(PUBLIC, "horizontal_logo.svg"));
console.log("ok horizontal_logo.svg");

// Ícones do app: cantos arredondados no "any"; maskable e Apple sangram até a borda
// (o sistema recorta o formato).
await png("itinus-app-icon.svg", "icon-192.png", { width: 192, height: 192 });
await png("itinus-app-icon.svg", "icon-512.png", { width: 512, height: 512 });
await png("itinus-app-icon-maskable.svg", "icon-maskable-512.png", { width: 512, height: 512 });
await png("itinus-app-icon-maskable.svg", "apple-touch-icon.png", { width: 180, height: 180 });
await ico("itinus-app-icon.svg", "favicon.ico", [16, 32, 48]);
