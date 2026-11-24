import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * GUARDA DE ARQUITETURA — raio e sombra se escrevem `rounded-(--r-*)` e
 * `shadow-(--shadow-*)`, e só assim.
 *
 * O `@theme` do `globals.css` espelha a escala nos nomes do Tailwind
 * (`--radius-md` = `--r-md` = 10px; `shadow-lg` = `--shadow-lg`). Por isso
 * `rounded-md` "funciona" — e é exatamente o problema: o nome que o `@theme`
 * NÃO redefine cai no padrão do Tailwind sem aviso (`shadow-xl` é a sombra
 * cinza dele; `rounded` puro, 4px fixos), e a tela ficava com três grafias
 * para a mesma escala (`rounded-md`, `rounded-(--radius-md)`,
 * `rounded-(--r-md)`) — em 24/11/2026, 7 + 29 + 78 usos. Quem lê não sabe
 * qual é a fonte; quem busca por `--r-md` não acha os outros dois terços.
 *
 * Uma grafia só: `rounded-(--r-md)` e `shadow-(--shadow-md)`. Fora do guarda:
 * `rounded-full`/`rounded-none` (forma, não escala) e os valores arbitrários
 * (`rounded-[2px]`, `shadow-[inset_…]`), que são desenho de uma peça só. O
 * `--radius-*` continua no `@theme` — é ele que faz `rounded-full` ser
 * 9999px —, só não se usa pelo nome numa classe.
 */

const SRC = resolve(process.cwd(), "src");

/** O apelido do @theme usado pelo nome: `rounded-(--radius-md)`. */
const RAW_ALIAS = /\(--radius-[a-z]+\)/;

/** `rounded`, `rounded-md`, `rounded-t-lg`, `hover:shadow-sm`, `shadow`… */
const RAW =
  /(?<![\w\-[(.$])(?:rounded(?:-(?:[trblse]|tl|tr|bl|br|ss|se|es|ee))?(?:-(?:xs|sm|md|lg|xl|2xl|3xl|4xl))?|shadow(?:-(?:2xs|xs|sm|md|lg|xl|2xl|inner))?)(?![\w\-[(])/;

/** As strings de uma linha: `"a"`, `'b'` e o texto fixo de `` `c ${x}` ``. */
const stringsOf = (line: string): string[] =>
  [...line.matchAll(/"([^"]*)"|'([^']*)'|`([^`]*)`/g)].map(
    (m) => m[1] ?? m[2] ?? m[3].replace(/\$\{[^}]*\}/g, " ")
  );

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

describe("guarda: raio e sombra vêm de --r-* e --shadow-*", () => {
  it("varreu os componentes do app", () => {
    expect(sources.size).toBeGreaterThan(400);
  });

  it("as escalas existem no globals.css", () => {
    const css = readFileSync(join(SRC, "styles/globals.css"), "utf8");
    expect(css).toMatch(/--r-md:\s*\d+px/);
    expect(css).toMatch(/--shadow-md:/);
  });

  it("nenhum arquivo escreve raio ou sombra da escala do Tailwind", () => {
    const offenders: string[] = [];
    for (const [path, text] of sources) {
      text.split("\n").forEach((line, i) => {
        // Comentário não é classe: "a borda vira `inset shadow`" não é sombra.
        if (/^\s*(\/\/|\/?\*)/.test(line)) return;
        for (const s of stringsOf(line)) {
          const hit = RAW.exec(s) ?? RAW_ALIAS.exec(s);
          if (hit) offenders.push(`${path}:${i + 1} → ${hit[0]}`);
        }
      });
    }
    expect(
      offenders,
      "Raio/sombra fora da grafia única. Use rounded-(--r-sm|md|lg…) e shadow-(--shadow-sm|md|lg…);\n" +
        "rounded-(--radius-full) é rounded-full."
    ).toEqual([]);
  });

  it("o guarda pega o que deve pegar", () => {
    const hits = (s: string) => RAW.test(s);
    expect(hits("p-4 rounded-md w-4")).toBe(true);
    expect(hits("hover:shadow-lg")).toBe(true);
    expect(hits("rounded p-4")).toBe(true);
    expect(hits("rounded-t-lg")).toBe(true);
    expect(RAW_ALIAS.test("rounded-tl-(--radius-md)")).toBe(true);
    expect(hits("rounded-(--r-md) shadow-(--shadow-md)")).toBe(false);
    expect(hits("rounded-full rounded-none rounded-[2px]")).toBe(false);
    expect(hits("shadow-[0_1px_2px_rgba(0,0,0,0.2)]")).toBe(false);
  });
});
