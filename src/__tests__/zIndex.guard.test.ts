import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * GUARDA DE ARQUITETURA — camada vem da escala `--z-*`, não de um número.
 *
 * Até 24/11/2026 cada peça escolhia o seu z-index (1, 10, 40, 50, 55, 60, 80,
 * 90, 95, 100, 9997, 9998, 9999, 10000) e a ordem entre elas só existia nos
 * comentários — que já se contradiziam. O Drawer se dizia "abaixo dos modais
 * (z-50)" com 55/60: o modal aberto a partir do painel abria atrás dele. O
 * Dropdown (50) sumia atrás do painel de filtros (9998).
 *
 * A escala mora em `styles/globals.css` (`:root { --z-* }`) e se usa como
 * `z-(--z-modal)`. Precisa de uma camada nova? Crie-a lá, no lugar certo da
 * ordem — é o único ponto em que a ordem inteira está à vista.
 *
 * Fora do guarda: `z-0`/`z-auto` (não sobem nada) e o z NEGATIVO (`-z-10`), o
 * fundo decorativo que fica atrás do próprio bloco e não disputa com camada
 * nenhuma.
 */

const SRC = resolve(process.cwd(), "src");

/** `z-10`, `z-[60]`, `focus:z-50` — e `zIndex: 9999` no style. */
const RAW_Z = /(?<![\w-])z-(?:\[\d+\]|[1-9]\d*)(?![\w-])|zIndex:\s*\d+/;

const readSources = (): Map<string, string> => {
  const out = new Map<string, string>();
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (
        /\.tsx?$/.test(entry.name) &&
        !/\.(test|spec)\./.test(entry.name)
      )
        out.set(relative(process.cwd(), full), readFileSync(full, "utf8"));
    }
  };
  walk(SRC);
  return out;
};

const sources = readSources();

describe("guarda: z-index vem da escala --z-*", () => {
  it("varreu os componentes do app", () => {
    expect(sources.size).toBeGreaterThan(400);
  });

  it("a escala existe no globals.css", () => {
    const css = readFileSync(join(SRC, "styles/globals.css"), "utf8");
    expect(css).toMatch(/--z-modal:\s*\d+/);
  });

  it("nenhum arquivo escreve z-index cru", () => {
    const offenders: string[] = [];
    for (const [path, text] of sources) {
      text.split("\n").forEach((line, i) => {
        const hit = RAW_Z.exec(line);
        if (hit) offenders.push(`${path}:${i + 1} → ${hit[0]}`);
      });
    }
    expect(
      offenders,
      "z-index cru. Use a escala: z-(--z-modal), z-(--z-popover)…\n" +
        "Falta a camada? Crie-a em styles/globals.css (:root { --z-* }), na ordem."
    ).toEqual([]);
  });
});
