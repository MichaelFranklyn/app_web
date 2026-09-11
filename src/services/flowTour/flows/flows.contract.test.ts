import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { FLOWS } from ".";
import { FLOW_ROUTES } from "./routes";

/**
 * Contrato dos tutoriais guiados: o que um tour aponta tem de existir.
 *
 * Um passo cujo alvo sumiu não quebra nada — o motor pula o alvo ausente e
 * segue. É justamente esse o problema: o tutorial encolhe em silêncio e
 * ninguém percebe. Foi o que aconteceu com o passo "Configurações" do tour do
 * sistema, que mirava um item de menu `/settings` extinto havia tempo, e com a
 * rota `/sellers`, que virou `/settings/users`.
 *
 * Duas amarras, então:
 *
 * 1. Todo seletor citado por um passo existe em algum lugar do código.
 * 2. Toda rota do catálogo corresponde a uma página de verdade.
 *
 * Fora do alcance daqui, de propósito: se o TEXTO do passo descreve a tela como
 * ela é hoje. Isso é leitura humana.
 */
const ROOT = resolve(process.cwd(), "src");
const DEFINITIONS = join(ROOT, "services/flowTour/flows/definitions");

/** Grupos de rota do App Router em que uma página de tour pode morar. */
const ROUTE_GROUPS = [
  "app/(inside)",
  "app/(inside)/(operations)",
  "app/(inside)/(config)",
];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

/**
 * Marcadores que o código realmente emite. Três formas, porque é assim que eles
 * aparecem: o atributo escrito à mão, o valor passado por prop (`dataTour=`) e
 * o item de menu, cujo `data-tour-route` recebe `tourRoute ?? href` do
 * `navConfig`.
 */
const markers = (() => {
  const values = new Set<string>();
  const attributes = new Set<string>();

  for (const file of sourceFiles(ROOT)) {
    if (file.startsWith(DEFINITIONS)) continue;
    const code = readFileSync(file, "utf8");

    for (const [, attribute] of code.matchAll(/(data-tour(?:-[a-z]+)?)=/g))
      attributes.add(attribute);
    for (const [, quoted, template] of code.matchAll(
      /data-tour(?:-[a-z]+)?=(?:"([^"]+)"|\{`([^`]+)`\})/g
    ))
      values.add(quoted ?? template);
    for (const [, value] of code.matchAll(/dataTour="([^"]+)"/g))
      values.add(value);
    for (const [, value] of code.matchAll(/\b(?:tourRoute|href):\s*"([^"]+)"/g))
      values.add(value);
  }

  return { values, attributes };
})();

/** Todos os seletores citados pelos passos, com o fluxo que os cita. */
const stepSelectors = Object.values(FLOWS).flatMap((flow) =>
  flow.steps.flatMap((step) =>
    [
      step.element,
      step.requireSelector,
      step.skipIfSelector,
      ...(Array.isArray(step.clickBefore)
        ? step.clickBefore
        : [step.clickBefore]),
    ]
      .filter((selector): selector is string => Boolean(selector))
      .map((selector) => ({ flow: flow.key, selector }))
  )
);

describe("tutoriais guiados", () => {
  it("cita só seletores que existem no código", () => {
    const órfãos = stepSelectors.filter(({ selector }) =>
      [...selector.matchAll(/\[([a-z-]+)(?:=["']?([^\]"']+)["']?)?\]/g)].some(
        ([, attribute, value]) =>
          !markers.attributes.has(attribute) ||
          (Boolean(value) && !markers.values.has(value))
      )
    );

    expect(órfãos.map(({ flow, selector }) => `${flow}: ${selector}`)).toEqual(
      []
    );
  });

  it("aponta só para rotas que existem", () => {
    const semPágina = Object.entries(FLOW_ROUTES).filter(([, route]) => {
      const segments = route.split("/").filter(Boolean).join("/");
      return !ROUTE_GROUPS.some((group) =>
        existsSync(join(ROOT, group, segments, "page.tsx"))
      );
    });

    expect(semPágina.map(([name, route]) => `${name} → ${route}`)).toEqual([]);
  });

  it("registra cada fluxo numa rota do catálogo", () => {
    const rotasConhecidas = new Set<string>(Object.values(FLOW_ROUTES));
    const foraDoCatálogo = Object.values(FLOWS)
      .filter((flow) => !rotasConhecidas.has(flow.route))
      .map((flow) => `${flow.key} → ${flow.route}`);

    expect(foraDoCatálogo).toEqual([]);
  });
});
