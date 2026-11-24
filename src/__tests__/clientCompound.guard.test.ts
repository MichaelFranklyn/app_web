import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * GUARDA DE ARQUITETURA — subpeça de composto client só em arquivo client.
 *
 * Um objeto composto (`Object.assign(Root, { Title, … })` ou `{ Root, … }`)
 * exportado de um módulo `"use client"` chega ao server component como
 * referência opaca: `Tabs.List`, `Modal.Content`, `Card.Header.Title` viram
 * `undefined` e a página cai em "Element type is invalid". Em 24/11/2026 a
 * home do portal (`/p/[token]`) e o detalhe do pedido caíram assim, porque três
 * server components passaram a usar `Card.Header.Title` (o `Card/Header` era
 * client). O typecheck e os testes de unidade não veem: só o RSC quebra.
 *
 * Regra: arquivo sem `"use client"` não escreve `Composto.Subpeça` de um
 * composto exportado de módulo client. Ou o arquivo vira client, ou o
 * composto é montado num módulo comum (como `Card/Header/index.tsx`, com a
 * raiz client em `./Root`). Testes ficam de fora: rodam no jsdom, sem RSC.
 */

const SRC = resolve(process.cwd(), "src");
const COMPONENTS = join(SRC, "components");

/** A diretiva vale depois de comentários: só código antes a anula. */
const isClient = (text: string) =>
  /^["']use client["']/.test(
    text.replace(/^(?:\s+|\/\/[^\n]*|\/\*[\s\S]*?\*\/)*/, "")
  );

const walk = (dir: string, out: Map<string, string> = new Map()) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry.name))
      out.set(relative(process.cwd(), full), readFileSync(full, "utf8"));
  }
  return out;
};

const sources = walk(SRC);

/** Caminho de uso do composto: `Tabs` ou, aninhado, `Card.Header`. */
const compoundPaths = (): string[] => {
  const paths: string[] = [];
  for (const [path, text] of sources) {
    const full = resolve(process.cwd(), path);
    if (!full.startsWith(COMPONENTS + sep) || !isClient(text)) continue;
    for (const m of text.matchAll(
      /export const ([A-Z]\w*)\s*=\s*(?:Object\.assign\(|\{)/g
    )) {
      const dirParts = relative(COMPONENTS, dirname(full)).split(sep);
      // components/Tabs/index.tsx → Tabs; components/Card/Header → Card.Header
      const prefix = dirParts.length > 1 ? `${dirParts[0]}.` : "";
      paths.push(prefix + m[1]);
    }
  }
  return paths;
};

const usageOf = (compound: string) =>
  new RegExp(`(?<![\\w.])${compound.replace(/\./g, "\\.")}\\.[A-Z]\\w*`);

describe("guarda: composto client não é usado por arquivo server", () => {
  const compounds = compoundPaths();

  it("encontrou os compostos client", () => {
    expect(compounds).toEqual(expect.arrayContaining(["Tabs", "Modal"]));
  });

  it("nenhum arquivo server usa subpeça de composto client", () => {
    const offenders: string[] = [];
    for (const [path, text] of sources) {
      if (!path.endsWith(".tsx") || /\.(test|spec)\./.test(path)) continue;
      if (isClient(text) || /testSupport\.tsx$/.test(path)) continue;
      text.split("\n").forEach((line, i) => {
        if (/^\s*(\/\/|\/?\*)/.test(line)) return;
        for (const c of compounds) {
          const hit = usageOf(c).exec(line);
          if (hit) offenders.push(`${path}:${i + 1} → ${hit[0]}`);
        }
      });
    }
    expect(
      offenders,
      'Subpeça de composto "use client" em arquivo server: vira undefined no RSC.\n' +
        'Ponha "use client" no arquivo ou monte o composto num módulo comum.'
    ).toEqual([]);
  });

  it("o guarda pega o que deve pegar", () => {
    expect(usageOf("Card.Header").test("<Card.Header.Title>")).toBe(true);
    expect(usageOf("Tabs").test("<Tabs.List>")).toBe(true);
    expect(usageOf("Tabs").test("<MyTabs.List>")).toBe(false);
    expect(usageOf("Card.Header").test("<Drawer.Header.Title>")).toBe(false);
    expect(usageOf("Tabs").test("<Tabs>")).toBe(false);
  });
});
