import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * GUARDA DE BORDA — quem desenha uma borda diz a cor dela.
 *
 * O projeto não tem `border-color` base. No Tailwind v4, `border` sozinho sai
 * em `currentColor`, ou seja, na cor do texto: um traço quase preto. O
 * `EventChip` teve esse defeito em todos os chips, e a opacity dos chips
 * feitos o escondia (Leva 6, 14/11/2026).
 *
 * A trava olha o ARQUIVO, não a string, porque a cor costuma vir de outra
 * variante do mesmo `cn` (a base diz `border`, o tom diz `border-(--x)`). Um
 * arquivo que escreve uma largura de borda (`border`, `border-t`,
 * `border-l-5`, `border-2`…) precisa escrever também uma cor
 * (`border-(--x)`, `border-transparent`, `border-current`…) ou um
 * `borderColor` inline. `border-0` não desenha nada e passa.
 *
 * Uma cor que vem de fora do arquivo (um helper de tema, por exemplo) vai em
 * KNOWN, com o motivo.
 */

const ROOT = process.cwd();
const SRC = resolve(ROOT, "src");

/** Arquivos cuja cor de borda vem de fora, com o motivo. */
const KNOWN: Record<string, string> = {
  "src/components/Badges/Root/style.ts":
    "cor vem de getThemeClasses (@/lib/theme), que escreve border-(--…) por tom",
};

const VARIANT = String.raw`(?:[\w\[\]&>*:/.-]+:)?`;
const SIDE = String.raw`(?:-[xytrblse])?`;
const WIDTH = new RegExp(
  String.raw`^${VARIANT}border${SIDE}(?:-[1-9]\d*|-\[[1-9]\d*px\])?$`
);
const COLOR = new RegExp(
  String.raw`^${VARIANT}border${SIDE}-(?:\(|\[(?!\d+px\])|current|transparent|inherit|white|black|[a-z]+-\d)`
);
const STRING = /"([^"\n]*)"|'([^'\n]*)'|`([^`]*)`/g;

function* sourceFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* sourceFiles(path);
    else if (/\.tsx?$/.test(entry.name) && !/\.test\./.test(entry.name))
      yield path;
  }
}

function scan(source: string) {
  const widths: string[] = [];
  let hasColor = /\bborderColor\b/.test(source);
  for (const match of source.matchAll(STRING)) {
    const tokens = (match[1] ?? match[2] ?? match[3] ?? "").split(/\s+/);
    for (const token of tokens) {
      if (WIDTH.test(token)) widths.push(token);
      if (COLOR.test(token)) hasColor = true;
    }
  }
  return { widths, hasColor };
}

describe("guarda de borda", () => {
  it("o detector separa largura de cor", () => {
    expect(scan(`"border p-4"`)).toEqual({
      widths: ["border"],
      hasColor: false,
    });
    expect(scan(`"border-l-5 border-(--border)"`).hasColor).toBe(true);
    expect(scan(`"border-0"`).widths).toEqual([]);
    expect(scan(`"border-2 border-t-transparent"`).hasColor).toBe(true);
    expect(scan(`"border-[3px]"`).widths).toEqual(["border-[3px]"]);
    expect(scan(`"hover:border-(--x)"`).hasColor).toBe(true);
  });

  it("todo arquivo com borda escreve a cor dela", () => {
    const found: string[] = [];
    for (const file of sourceFiles(SRC)) {
      const rel = relative(ROOT, file);
      if (rel in KNOWN) continue;
      const { widths, hasColor } = scan(readFileSync(file, "utf8"));
      if (widths.length && !hasColor)
        found.push(`${rel}: ${[...new Set(widths)].join(", ")}`);
    }
    expect(found).toEqual([]);
  });

  it("KNOWN não guarda arquivo que já se resolveu", () => {
    const stale = Object.keys(KNOWN).filter((rel) => {
      const { widths, hasColor } = scan(
        readFileSync(resolve(ROOT, rel), "utf8")
      );
      return !widths.length || hasColor;
    });
    expect(stale).toEqual([]);
  });
});
