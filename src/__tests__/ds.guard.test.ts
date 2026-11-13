import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import ts from "typescript";
import { describe, expect, it } from "vitest";

/**
 * GUARDA DE ARQUITETURA — a tela é montada com as peças de `src/components`.
 *
 * Uma tela é um quebra-cabeça: as peças (`Card`, `Title`, `Table`, `Button`,
 * `TextLink`, `SampleRow`…) trazem o desenho; o HTML cru da tela só POSICIONA
 * (flex, grid, gap, padding, largura). Quando uma tela pinta a própria borda,
 * escreve a própria cor de texto ou usa um `<button>` cru, ela sai do sistema:
 * mudar a peça não a alcança e o desvio fica invisível no código.
 *
 * O que este guarda recusa em `src/app` (a landing `(marketing)` fica de fora
 * — é vitrine, desenhada à parte):
 *
 * - `raw:<tag>` — controle ou texto em HTML cru (`<p>`, `<button>`, `<a>`,
 *   `<input>`, `<img>`, `<table>`…). Cada um tem a sua peça.
 * - `cls:<tipo>` — tag crua com classe VISUAL (borda, fundo, raio, sombra,
 *   anel, peso de fonte, cor/tamanho de texto, opacidade/gradiente).
 *   Padding e layout são posição e passam.
 * - `style` — `style={…}` em tag crua.
 * - `rawtext:<tag>` — texto solto num `div`/`span`/`li`… fora de uma peça de
 *   texto (`Title`, `Emphasis`, `*.Title`, `TextLink`…). Leitor de tela
 *   (`sr-only`) passa.
 * - `ds-override:<tipo>` — classe visual por cima de uma PEÇA (sombra num
 *   `Card.Root`, raio numa barra). Peça que não serve ganha a prop que falta.
 *   Ícone do lucide pode receber cor: é a regra, não exceção.
 *
 * Um achado novo quebra a suíte; corrigir um exige tirá-lo de KNOWN.
 */

const ROOT = process.cwd();
const APP = resolve(ROOT, "src/app");

const RAW_CONTROLS = new Set([
  "input",
  "select",
  "textarea",
  "button",
  "table",
  "thead",
  "tbody",
  "tr",
  "td",
  "th",
  "img",
  "hr",
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "strong",
  "small",
  "label",
  "a",
  "em",
  "b",
  "i",
  "iframe",
  "svg",
]);

const PREFIX = String.raw`(?:^|[\s:"'\x60{])`;
const VISUAL: [RegExp, string][] = [
  [new RegExp(`${PREFIX}border(?:-|\\s|$)`), "border"],
  [new RegExp(`${PREFIX}bg-`), "bg"],
  [new RegExp(`${PREFIX}rounded`), "rounded"],
  [new RegExp(`${PREFIX}shadow`), "shadow"],
  [new RegExp(`${PREFIX}ring-`), "ring"],
  [
    new RegExp(
      `${PREFIX}font-(?:medium|semibold|bold|extrabold|normal|mono|sans)`
    ),
    "font",
  ],
  [
    new RegExp(
      `${PREFIX}text-(?:\\[|\\(|xs|sm|base|lg|xl|2xl|3xl|4xl|white|black|gray|slate|zinc|neutral|red|green|amber|blue|yellow|orange|emerald|sky|violet|purple|pink|rose|teal|cyan|indigo|lime|muted|primary|secondary|danger|success|warning|accent)`
    ),
    "text",
  ],
  [
    new RegExp(`${PREFIX}(?:opacity|backdrop|blur|from-|to-|via-|bg-gradient)`),
    "effect",
  ],
];

const TEXT_CONTAINERS = new Set(["div", "span", "li", "section", "ul"]);

/** Peça que dita a tipografia do que vai dentro dela. */
const isTextPiece = (tag: string) =>
  /(?:^|\.)(?:Title|Emphasis|TextLink|CellText|Text|Description|Label|Info)$/.test(
    tag
  ) || /Title$/.test(tag);

const walk = (dir: string, out: string[] = []): string[] => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "(marketing)") walk(full, out);
    } else if (
      entry.name.endsWith(".tsx") &&
      !/\.(test|spec)\.tsx$/.test(entry.name)
    ) {
      out.push(full);
    }
  }
  return out;
};

const lucideImports = (sf: ts.SourceFile): Set<string> => {
  const names = new Set<string>();
  for (const stmt of sf.statements) {
    if (
      ts.isImportDeclaration(stmt) &&
      ts.isStringLiteral(stmt.moduleSpecifier) &&
      stmt.moduleSpecifier.text === "lucide-react"
    ) {
      const bindings = stmt.importClause?.namedBindings;
      if (bindings && ts.isNamedImports(bindings))
        for (const el of bindings.elements) names.add(el.name.text);
    }
  }
  return names;
};

/** Ícone: importado do lucide ou recebido como componente (`Icon`, `FileIcon`). */
const isIcon = (tag: string, lucide: Set<string>) =>
  lucide.has(tag) || /(?:^|[a-z])Icon$/.test(tag) || tag === "Icon";

const classTextOf = (
  attrs: ts.JsxAttributes,
  name: string,
  sf: ts.SourceFile
): string | null => {
  for (const a of attrs.properties) {
    if (ts.isJsxAttribute(a) && a.name.getText(sf) === name)
      return a.initializer ? a.initializer.getText(sf) : "";
  }
  return null;
};

const findOffenders = (): string[] => {
  const found = new Set<string>();

  for (const file of walk(APP)) {
    const sf = ts.createSourceFile(
      file,
      readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    );
    const rel = relative(ROOT, file);
    const lucide = lucideImports(sf);
    const add = (kind: string, tag: string) =>
      found.add(`${rel} → ${kind} <${tag}>`);

    const visit = (node: ts.Node, insideTextPiece: boolean) => {
      let inside = insideTextPiece;

      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
        const opening = ts.isJsxElement(node) ? node.openingElement : node;
        const tag = opening.tagName.getText(sf);
        const className = classTextOf(opening.attributes, "className", sf);

        if (/^[A-Z]/.test(tag)) {
          if (className && !isIcon(tag, lucide)) {
            for (const [re, kind] of VISUAL)
              if (re.test(className)) add(`ds-override:${kind}`, tag);
          }
          if (isTextPiece(tag)) inside = true;
        } else {
          // `<input type="hidden">` é dado do formulário, não desenho.
          const isHiddenInput =
            tag === "input" &&
            classTextOf(opening.attributes, "type", sf) === '"hidden"';
          if (RAW_CONTROLS.has(tag) && !isHiddenInput) add(`raw:${tag}`, tag);
          if (classTextOf(opening.attributes, "style", sf) !== null)
            add("style", tag);
          if (className)
            for (const [re, kind] of VISUAL)
              if (re.test(className)) add(`cls:${kind}`, tag);
          if (
            ts.isJsxElement(node) &&
            TEXT_CONTAINERS.has(tag) &&
            !inside &&
            !className?.includes("sr-only") &&
            node.children.some(
              (c) => ts.isJsxText(c) && c.getText(sf).trim().length > 0
            )
          )
            add(`rawtext:${tag}`, tag);
        }
      }
      ts.forEachChild(node, (child) => visit(child, inside));
    };
    visit(sf, false);
  }
  return [...found].sort();
};

/**
 * Dívida conhecida — cada linha com o motivo. A lista só encolhe: quem sai
 * dela não volta (o último teste recusa entrada que já não acontece).
 */
const KNOWN: string[] = [];

const offenders = findOffenders();

describe("guarda: telas montadas com as peças de src/components", () => {
  it("varreu as telas do app", () => {
    expect(walk(APP).length).toBeGreaterThan(300);
  });

  it("nenhum desvio novo do design system", () => {
    const novos = offenders.filter((entry) => !KNOWN.includes(entry));
    expect(
      novos,
      "A tela desenhou algo à mão em vez de usar uma peça.\n" +
        "Texto → <Title>/<Emphasis>; link → <TextLink>/<Button.Link>; caixa → <Card>.\n" +
        "A peça não tem a variação que você precisa? Crie a prop em src/components."
    ).toEqual([]);
  });

  it("a lista de dívida não guarda quem já foi corrigido", () => {
    const resolvidos = KNOWN.filter((known) => !offenders.includes(known));
    expect(
      resolvidos,
      "Estes já seguem o design system — tire-os de KNOWN para a lista não mentir."
    ).toEqual([]);
  });
});
