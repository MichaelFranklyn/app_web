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
 * Tamanho de fonte (`text-[13px]`, `text-sm`, os degraus do @theme como
 * `text-body`), peso (`font-bold`) ou caixa tipográfica escritos direto na
 * classe. `text-(--x)` NÃO conta: é cor. Os degraus nomeados são para as
 * peças do DS (`components/`), não para a tela — ela usa o `Title`.
 */
const TYPOGRAPHY_CLASS =
  /(?<![\w-])(?:text-\[\d+px\]|(?:text-(?:xs|sm|base|lg|xl|2xl|3xl|micro|body-sm|body|body-md|body-lg|lead|heading-sm|heading-md|heading-lg|kpi|heading-xl)|section-label|font-(?:medium|semibold|bold|extrabold))(?![\w-]))/;
// O `\b` depois de `text-[13px]` exigia uma letra colada ao `]` — o tamanho cru
// no fim da classe (ou antes de um espaço) passava pelo guarda sem ser visto
// (24/11/2026). Agora a fronteira é "nem letra nem hífen" dos dois lados.

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
 * Onde a escala PODE ser escrita: as peças do DS. Elas é que definem a
 * tipografia (o `Title`, o `Alert.Title`, o rótulo da `Sidebar`) com os degraus
 * do `@theme`; a tela compõe as peças e não escreve fonte. Enquanto o guarda só
 * lia `className="..."`, a fronteira parecia ser o `Title` — mas as peças que
 * usam `cn()` já escreviam os degraus e passavam sem ser vistas.
 */
const ALLOWED_PREFIX = "src/components/";

/**
 * O valor do `className` de uma tag que começa em `start`: o literal
 * (`className="..."`) ou a expressão inteira (`className={cn("...", x)}`), com
 * as chaves balanceadas. Só olhar o literal deixava `cn("text-[13px]")` passar
 * (24/11/2026) — e `cn` é como metade das telas escreve a classe.
 */
const classNameOf = (text: string, start: number): string | null => {
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    else if (ch === ">" && depth === 0) return null;
    else if (depth === 0 && text.startsWith("className=", i)) {
      const v = i + "className=".length;
      // Com as aspas: o `stringsOf` lê o literal como lê a expressão.
      if (text[v] === '"') return text.slice(v, text.indexOf('"', v + 1) + 1);
      if (text[v] !== "{") return null;
      let d = 0;
      for (let j = v; j < text.length; j++) {
        if (text[j] === "{") d++;
        else if (text[j] === "}" && --d === 0) return text.slice(v + 1, j);
      }
      return null;
    }
  }
  return null;
};

/** As strings de uma expressão: `"a"`, `'b'` e o texto fixo de `` `c ${x}` ``. */
const stringsOf = (expr: string): string[] =>
  [...expr.matchAll(/"([^"]*)"|'([^']*)'|`([^`]*)`/g)].map(
    (m) => m[1] ?? m[2] ?? m[3].replace(/\$\{[^}]*\}/g, " ")
  );

const findOffenders = (): string[] => {
  const offenders: string[] = [];
  const opening = new RegExp(`<(?:${TEXT_TAGS})\\s`, "g");

  for (const [path, text] of sources) {
    if (/\.(test|spec)\.tsx?$/.test(path)) continue;
    if (path.startsWith(ALLOWED_PREFIX)) continue;
    for (const match of text.matchAll(opening)) {
      const value = classNameOf(text, match.index + match[0].length);
      if (value === null) continue;
      const hit = stringsOf(value).find((s) => TYPOGRAPHY_CLASS.test(s));
      if (hit !== undefined) {
        offenders.push(`${path} → ${hit.trim().slice(0, 60)}`);
        break;
      }
    }
  }
  return offenders.sort();
};

/**
 * Dívida conhecida (e exceções com motivo).
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
