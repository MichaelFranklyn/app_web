import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { buildSchema } from "graphql";
import { describe, expect, it } from "vitest";

/**
 * TESTE DE CONTRATO — nomes passados aos hooks de invalidação.
 *
 * O `InMemoryCache` guarda cada campo pelo nome do SCHEMA, não pelo alias do
 * documento. Como quase todo `gql` do projeto usa alias (`clients_list:
 * clients(...)`), é fácil escrever `invalidateClient(["clients_list"])` — que
 * compila, passa no lint, roda sem erro e **não invalida nada**: o evict devolve
 * `false` em silêncio, o `cache-first` segue acertando a página velha e o dado
 * novo só aparece depois de um reload (que refaz o SSR).
 *
 * Foi assim em quatro telas ao mesmo tempo (usuários, carteira, acessos de
 * fábrica, notificações). Este teste existe para que não volte: todo nome dado
 * a `invalidateClient` tem de ser um campo de `type Query`, e todo nome dado a
 * `refetchClient` tem de ser o nome de uma operação declarada no front.
 *
 * Fora do escopo, de propósito: `invalidateCache`/`invalidateCacheMany`, cujos
 * argumentos são TAGS do Data Cache do Next (`clients_stats`), não campos.
 */
const ROOT = resolve(process.cwd(), "src");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    if (!/\.tsx?$/.test(entry.name)) return [];
    if (/\.(test|spec)\.tsx?$/.test(entry.name)) return [];
    return [path];
  });
}

const files = sourceFiles(ROOT).map((path) => ({
  path: path.slice(ROOT.length + 1),
  code: readFileSync(path, "utf8"),
}));

const schema = buildSchema(
  readFileSync(resolve(ROOT, "__generated__/schema.graphql"), "utf8")
);
const queryFields = new Set(
  Object.keys(schema.getQueryType()?.getFields() ?? {})
);

/** Nomes de operação declarados no front (`query Orders { ... }`). */
const operationNames = new Set(
  files.flatMap(({ code }) =>
    [...code.matchAll(/\b(?:query|mutation)\s+(\w+)/g)].map((m) => m[1])
  )
);

/** Strings literais de um array — ignora DocumentNodes (`PRICE_LIST_QUERY`). */
const literals = (list: string) =>
  [...list.matchAll(/["'](\w+)["']/g)].map((m) => m[1]);

function collect(pattern: RegExp) {
  return files.flatMap(({ path, code }) =>
    [...code.matchAll(pattern)].flatMap((m) =>
      literals(m[1]).map((name) => ({ path, name }))
    )
  );
}

const invalidated = collect(/invalidateClient\(\s*\[([^\]]*)\]/g).concat(
  collect(/invalidateKeys[=:]\s*\{?\s*\[([^\]]*)\]/g)
);
const refetched = collect(/refetchClient\(\s*\[([^\]]*)\]/g);

describe("contrato dos hooks de invalidação de cache", () => {
  it("coletou as chamadas de invalidação do app", () => {
    expect(invalidated.length).toBeGreaterThan(20);
    expect(queryFields.size).toBeGreaterThan(100);
  });

  it("todo nome em invalidateClient é um campo de type Query (não um alias)", () => {
    const invalid = invalidated
      .filter(({ name }) => !queryFields.has(name))
      .map(({ path, name }) => `${name} — ${path}`);
    expect(invalid).toEqual([]);
  });

  it("todo nome em refetchClient é uma operação declarada no front", () => {
    const invalid = refetched
      .filter(({ name }) => !operationNames.has(name))
      .map(({ path, name }) => `${name} — ${path}`);
    expect(invalid).toEqual([]);
  });
});
