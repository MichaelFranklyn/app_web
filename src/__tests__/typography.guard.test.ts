import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * GUARDA DE ARQUITETURA — tipografia sai do `<Title>`, não do className.
 *
 * A escala de texto do sistema vive em `@/components/Title` (variant + color +
 * weight). Um `<span className="text-[13px]">` funciona igual na tela e é por
 * isso que ele se espalha: em 09/09/2026 havia catorze deles, com SETE tamanhos
 * diferentes (10, 11, 12, 13, 14, 15px e um `font-medium` sem tamanho) — três
 * dos quais não existiam na escala. Ninguém decidiu ter uma fonte de 10px; ela
 * apareceu porque escrever o número era mais curto do que escolher a variante.
 *
 * O custo não é estético: mudar a escala (corpo de 13 para 14px, digamos, que é
 * o tipo de ajuste que o público idoso deste sistema pede) alcança o `Title` e
 * não alcança nada disso. A tela fica com dois tamanhos de corpo e a diferença
 * é invisível no código.
 *
 * Este teste congela o que ainda escreve tipografia à mão: um elemento novo
 * quebra a suíte, e corrigir um exige tirá-lo da lista.
 */

const SRC = resolve(process.cwd(), "src");

/** Tags de texto: onde um tamanho de fonte cru é tipografia, não layout. */
const TEXT_TAGS = "span|p|h1|h2|h3|h4|h5|h6|div|strong|em|label|li|td|th";

/**
 * Tamanho de fonte (`text-[13px]`, `text-sm`), peso (`font-bold`) ou caixa
 * tipográfica escritos direto na classe. `text-(--x)` NÃO conta: é cor.
 */
const TYPOGRAPHY_CLASS =
  /\b(text-\[\d+px\]|text-(?:xs|sm|base|lg|xl|2xl|3xl)|font-(?:medium|semibold|bold|extrabold))\b/;

const readSources = (): Map<string, string> => {
  const out = new Map<string, string>();
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".tsx"))
        out.set(relative(process.cwd(), full), readFileSync(full, "utf8"));
    }
  };
  walk(SRC);
  return out;
};

const sources = readSources();

/**
 * Onde a escala PODE ser escrita: é o arquivo que a define. `style.ts` não
 * aparece aqui porque o guarda só lê `.tsx`.
 */
const ALLOWED = ["src/components/Title/index.tsx"];

const findOffenders = (): string[] => {
  const offenders: string[] = [];
  const opening = new RegExp(`<(?:${TEXT_TAGS})\\s[^>]*className="[^"]*"`, "g");

  for (const [path, text] of sources) {
    if (/\.(test|spec)\.tsx?$/.test(path)) continue;
    if (ALLOWED.includes(path)) continue;
    for (const match of text.matchAll(opening)) {
      const className = /className="([^"]*)"/.exec(match[0])?.[1] ?? "";
      if (TYPOGRAPHY_CLASS.test(className)) {
        offenders.push(`${path} → ${className.trim().slice(0, 60)}`);
        break;
      }
    }
  }
  return offenders.sort();
};

/**
 * Dívida conhecida — hoje, nenhuma.
 *
 * Acrescentar um caminho aqui é assumir que aquele texto vive fora da escala,
 * e o motivo tem de estar escrito ao lado. Se o tamanho que falta é legítimo,
 * o certo é criar a variante no `Title` — foi assim que a cor `inverse`
 * (branco sobre a faixa colorida) entrou, em vez de cada faixa escrever o
 * tamanho à mão só para escapar da cor herdada.
 */
const KNOWN: string[] = [];

describe("guarda: tipografia vem do Title", () => {
  it("varreu os componentes do app", () => {
    expect(sources.size).toBeGreaterThan(400);
  });

  it("nenhum elemento de texto novo escreve a própria tipografia", () => {
    const novos = findOffenders().filter(
      (entry) => !KNOWN.some((known) => entry.startsWith(known))
    );
    expect(
      novos,
      "Texto com tamanho/peso de fonte no className.\n" +
        "Use <Title variant=... color=... weight=...>: a escala inteira mora lá,\n" +
        "e o que está fora dela não acompanha uma mudança de escala.\n" +
        "Falta a variante de que você precisa? Crie-a em components/Title."
    ).toEqual([]);
  });

  it("a lista de dívida não guarda quem já foi corrigido", () => {
    const offenders = findOffenders();
    const resolvidos = KNOWN.filter(
      (known) => !offenders.some((entry) => entry.startsWith(known))
    );
    expect(
      resolvidos,
      "Estes já não escrevem tipografia à mão — tire-os de KNOWN para a lista não mentir."
    ).toEqual([]);
  });
});
