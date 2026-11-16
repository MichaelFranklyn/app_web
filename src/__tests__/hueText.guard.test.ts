import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * GUARDA DE CONTRASTE — texto colorido usa o tom de TEXTO, nunca a matiz viva.
 *
 * Cada matiz tem dois tons. O vivo (`--cyan`, `--orange`, `--amber`…) serve
 * para fundo, borda, ícone, ponto e barra, onde 3:1 basta. O tom de texto
 * (`--cyan-text`, `--orange-text`, os papéis `--color-status-*`…) passa de
 * 4,5:1 até sobre o próprio fundo tingido.
 *
 * As outras guardas não pegavam `text-(--orange)` escrito à mão. Por isso o
 * laranja (4,08 no branco) e o ciano (3,41 no tingido) chegaram às telas
 * (auditoria de 13/11/2026).
 *
 * Duas travas:
 *  1. nenhum `text-(--matiz)` cru no código (ícone que quer a cor viva usa
 *     `stroke-(--matiz)`, que é traço e não texto);
 *  2. cada tom de texto passa de 4,5:1 sobre o próprio tingido nos quatro
 *     fundos da casca (bg, bg2, bg3, bg4), calculado do `globals.css`.
 */

const ROOT = process.cwd();
const SRC = resolve(ROOT, "src");
const CSS = readFileSync(resolve(SRC, "styles/globals.css"), "utf8");

/** Matizes vivas e tons de fundo/foco que não podem ser cor de texto. */
const LIVE =
  "amber|amber2|amber3|orange|green|red|blue|purple|cyan|pink|warning|mod-[a-z]+|color-action|color-focus";

const RAW_TEXT = new RegExp(String.raw`text-(?:\(|\[var\()--(${LIVE})\)`, "g");

function* sourceFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* sourceFiles(path);
    else if (/\.(tsx?|css)$/.test(entry.name) && !/\.test\./.test(entry.name))
      yield path;
  }
}

type Rgb = [number, number, number];

const token = (name: string): string => {
  const m = CSS.match(new RegExp(String.raw`--${name}:\s*([^;]+);`));
  if (!m) throw new Error(`token --${name} não existe no globals.css`);
  return m[1].trim();
};

const hex = (value: string): Rgb => {
  const h = value.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb;
};

const rgba = (value: string): { rgb: Rgb; alpha: number } => {
  const [r, g, b, a] = value
    .replace(/rgba?\(|\)/g, "")
    .split(",")
    .map(Number);
  return { rgb: [r, g, b], alpha: a ?? 1 };
};

const luminance = (c: Rgb) => {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
};

const ratio = (a: Rgb, b: Rgb) => {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

/** O tingido como a tela pinta: a tinta translúcida sobre o fundo. */
const over = (tint: string, bg: Rgb): Rgb => {
  const { rgb, alpha } = rgba(tint);
  return rgb.map((v, i) => v * alpha + bg[i] * (1 - alpha)) as Rgb;
};

const SURFACES = ["bg", "bg2", "bg3", "bg4"];

/** Tom de texto → os tingidos sobre os quais ele aparece. */
const TEXT_ON_TINT: Record<string, string[]> = {
  "cyan-text": ["cyan-bg"],
  "purple-text": ["purple-bg"],
  "pink-text": ["pink-bg"],
  "orange-text": ["orange-bg"],
  "warning-text": ["warning-bg"],
  "green-text": ["green-bg"],
  "red-text": ["red-bg"],
  "blue-text": ["blue-bg"],
  "amber-text-on-tint": ["amber-bg", "amber-bg2"],
};

describe("texto colorido usa o tom de texto", () => {
  it("nenhum text-(--matiz) cru", () => {
    const found: string[] = [];
    for (const path of sourceFiles(SRC)) {
      const file = relative(ROOT, path);
      if (file === "src/styles/globals.css") continue;
      readFileSync(path, "utf8")
        .split("\n")
        .forEach((line, i) => {
          for (const m of line.matchAll(RAW_TEXT))
            found.push(`${file}:${i + 1}  ${m[0]}`);
        });
    }
    expect(
      found,
      "Texto usa o tom de texto (--cyan-text, --orange-text, --color-status-*,\n" +
        "--color-action-text…). Ícone com a cor viva: stroke-(--matiz)."
    ).toEqual([]);
  });

  for (const [text, tints] of Object.entries(TEXT_ON_TINT)) {
    it(`--${text} passa de 4,5:1 no tingido e nos fundos`, () => {
      const fg = hex(token(text));
      const failures: string[] = [];
      for (const surface of SURFACES) {
        const bg = hex(token(surface));
        const plain = ratio(fg, bg);
        if (plain < 4.5) failures.push(`--${surface}: ${plain.toFixed(2)}`);
        for (const tint of tints) {
          const r = ratio(fg, over(token(tint), bg));
          if (r < 4.5)
            failures.push(`--${tint} sobre --${surface}: ${r.toFixed(2)}`);
        }
      }
      expect(failures).toEqual([]);
    });
  }
});
