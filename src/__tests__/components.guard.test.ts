import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import ts from "typescript";
import { describe, expect, it } from "vitest";

/**
 * GUARDA DAS PEÇAS — o que `src/components` pode escrever nas próprias classes.
 *
 * O `ds.guard` vigia as telas (`src/app`): elas só posicionam e usam peças.
 * Este vigia as peças, que são quem desenha — e por isso o desvio delas se
 * espalha por todas as telas de uma vez. Recusa, nas strings do código:
 *
 * - `hex` — cor literal (`#ffffff`). A cor vem dos tokens de `globals.css`
 *   (`--amber`, `--text`…), que é o único lugar com hex e o único que muda no
 *   tema. Um hex na peça não acompanha nada.
 * - `important` — `!bg-…`, `bg-…!`, `!important`. Quase sempre é uma briga de
 *   especificidade que se ganha com o seletor certo (ver `calendarStyles.day`):
 *   o `!` ganha hoje e perde da próxima regra que também precisar ganhar.
 * - `outline-none` sem substituto — tirar o contorno de foco sem pôr outro no
 *   lugar (`focus:ring`, `focus:bg`, `focus-ring`, `focus-within:`…) deixa quem
 *   usa teclado sem saber onde está (WCAG 2.4.7). O substituto pode estar em
 *   outra string do MESMO arquivo (é o caso de `controlBase` + `controlBordered`).
 *
 * Exceções vão em ALLOW, cada uma com o motivo.
 */

const ROOT = process.cwd();
const COMPONENTS = resolve(ROOT, "src/components");

const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/;
const OUTLINE_NONE = /(?:^|\s)(?:[\w-]+:)*outline-none(?:\s|$)/;
const FOCUS_SUBSTITUTE =
  /(?:^|\s)(?:[\w-]+:)*(?:focus|focus-visible|focus-within)(?:\/\w+)?:(?:ring|bg|border|outline-(?!none)|shadow|text|underline)|(?:^|\s)focus-ring/;

/** Classe utilitária com `!` na frente ou atrás (Tailwind v3 e v4). */
const isImportantToken = (token: string) =>
  token === "!important" ||
  /^(?:[^\s]*:)?![a-z[(-]/.test(token) ||
  (/[-[(]/.test(token) &&
    /^[a-z0-9:[\]()&>_/.\-=@*%,'#]+[a-z0-9\])]!$/.test(token));

/** Exceções conhecidas: `arquivo → regra`, e o porquê. */
const ALLOW: Record<string, string> = {
  // O canvas do Chart.js não lê variável CSS: as cores da série espelham os
  // tokens do globals.css aqui, e só aqui.
  "src/components/Chart/chartTheme.ts → hex":
    "canvas não resolve var(--…); espelho dos tokens",
  // O input interno do Select/Date não tem anel próprio: quem acende é o
  // wrapper, por `focus-within` (inputStyles.controlBorderedWithin / group).
  "src/components/Input/InputSelect.tsx → outline-none":
    "anel no wrapper via focus-within",
  "src/components/Input/InputDate.tsx → outline-none":
    "anel no wrapper via focus-within",
};

const walk = (dir: string, out: string[] = []): string[] => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (
      /\.(ts|tsx)$/.test(entry.name) &&
      !/\.(test|spec)\.tsx?$/.test(entry.name)
    )
      out.push(full);
  }
  return out;
};

/** Textos de string do arquivo, fora de `gql\`…\`` (lá `Input!` é tipo). */
const stringsOf = (sf: ts.SourceFile): string[] => {
  const out: string[] = [];
  const visit = (node: ts.Node) => {
    if (
      ts.isTaggedTemplateExpression(node) &&
      /^(gql|graphql)$/.test(node.tag.getText(sf))
    )
      return;
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    )
      out.push(node.text);
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
};

const findOffenders = (): string[] => {
  const found = new Set<string>();
  for (const file of walk(COMPONENTS)) {
    const sf = ts.createSourceFile(
      file,
      readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );
    const rel = relative(ROOT, file);
    const strings = stringsOf(sf);

    if (strings.some((s) => HEX.test(s))) found.add(`${rel} → hex`);
    if (strings.some((s) => s.split(/\s+/).some(isImportantToken)))
      found.add(`${rel} → important`);
    if (
      strings.some((s) => OUTLINE_NONE.test(s)) &&
      !strings.some((s) => FOCUS_SUBSTITUTE.test(s))
    )
      found.add(`${rel} → outline-none`);
  }
  return [...found].sort();
};

const offenders = findOffenders();

describe("guarda: as peças de src/components só usam tokens e foco visível", () => {
  it("varreu as peças", () => {
    expect(walk(COMPONENTS).length).toBeGreaterThan(200);
  });

  it("detecta o que deveria detectar", () => {
    expect(isImportantToken("!bg-(--amber)")).toBe(true);
    expect(isImportantToken("hover:!text-(--text)")).toBe(true);
    expect(isImportantToken("[&>svg]:!block")).toBe(true);
    expect(isImportantToken("bg-red-500!")).toBe(true);
    expect(isImportantToken("Salvo!")).toBe(false);
    expect(isImportantToken("bg-(--amber)")).toBe(false);
    expect(HEX.test("text-[#ffffff]")).toBe(true);
    expect(HEX.test("Pedido #42")).toBe(false);
    expect(FOCUS_SUBSTITUTE.test("focus:outline-none")).toBe(false);
    expect(FOCUS_SUBSTITUTE.test("outline-none focus:bg-(--bg3)")).toBe(true);
    expect(FOCUS_SUBSTITUTE.test("focus-within:ring-1")).toBe(true);
  });

  it("nenhuma peça com hex, !important ou outline-none sem substituto", () => {
    const novos = offenders.filter((entry) => !(entry in ALLOW));
    expect(
      novos,
      "Cor → token de globals.css (`text-(--text)`), não hex.\n" +
        "`!` → resolva a especificidade com o seletor certo.\n" +
        "`outline-none` → ponha outro sinal de foco (`focus-ring`, `focus:bg-…`)."
    ).toEqual([]);
  });

  it("a lista de exceções não guarda quem já foi corrigido", () => {
    const resolvidos = Object.keys(ALLOW).filter(
      (known) => !offenders.includes(known)
    );
    expect(resolvidos).toEqual([]);
  });
});
