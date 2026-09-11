import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Leitura DERIVADA revalida ao abrir.
 *
 * Desempenho, relatórios e o console da plataforma resumem o que as outras
 * telas escrevem: `revenueByMonth` não muda por si, muda quando alguém fatura
 * um pedido — e nenhuma mutation invalida esses campos (seriam 44 nomes
 * pendurados nas constantes de assunto, um por gráfico). Com `cache-first`,
 * abrir o desempenho, lançar um pedido e voltar mostrava o número do primeiro
 * acesso até um F5.
 *
 * A regra aqui é a política de leitura: nessas três áreas, toda query pinta com
 * o cache e revalida por baixo (`cache-and-network`, ou `revalidate: true` nos
 * hooks do projeto). `network-only` também passa — é mais forte, só pisca.
 */
const ROOT = resolve(process.cwd(), "src");

/** Áreas de leitura derivada, relativas a `src/`. */
const AREAS = [
  "app/(inside)/dashboard/analytics",
  "app/(inside)/dashboard/reports",
  "app/(platform)",
];

const QUERY_HOOKS =
  /\b(useQuery|useAsyncQuery|useTableData|useAllPages)\s*[<(]/g;

/**
 * Leitura que NÃO é derivada, apesar de morar numa dessas áreas — o dado não
 * muda por mutation nenhuma do app. Cada linha diz por quê.
 */
const NAO_DERIVADAS: Record<string, string> = {
  "app/(platform)/platform/usePlanCatalog.ts":
    "o catálogo de planos é definido em código, não em banco: nada o altera em runtime",
};

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    if (!/\.tsx?$/.test(entry.name)) return [];
    if (/\.(test|spec)\.tsx?$/.test(entry.name)) return [];
    return [path];
  });
}

/** Trecho da chamada: do nome do hook até o parêntese que a fecha. */
function callSlice(code: string, from: number): string {
  const open = code.indexOf("(", from);
  if (open === -1) return "";
  let depth = 0;
  for (let i = open; i < code.length; i += 1) {
    if (code[i] === "(") depth += 1;
    else if (code[i] === ")") {
      depth -= 1;
      if (depth === 0) return code.slice(from, i + 1);
    }
  }
  return code.slice(from);
}

const chamadas = AREAS.flatMap((area) =>
  sourceFiles(join(ROOT, area)).flatMap((path) => {
    const code = readFileSync(path, "utf8");
    return [...code.matchAll(QUERY_HOOKS)].map((m) => ({
      path: path.slice(ROOT.length + 1),
      trecho: callSlice(code, m.index ?? 0),
    }));
  })
);

const revalida = (trecho: string) =>
  /fetchPolicy:\s*"(cache-and-network|network-only|no-cache)"/.test(trecho) ||
  /revalidate:\s*true/.test(trecho) ||
  /cache:\s*false/.test(trecho);

describe("contrato das leituras derivadas", () => {
  it("achou as chamadas de query das três áreas", () => {
    expect(chamadas.length).toBeGreaterThan(30);
  });

  it("nenhuma query de desempenho, relatório ou console fica em cache-first", () => {
    const cacheFirst = chamadas
      .filter(
        ({ path, trecho }) => !(path in NAO_DERIVADAS) && !revalida(trecho)
      )
      .map(({ path, trecho }) => `${path} — ${trecho.slice(0, 60)}…`);
    expect(cacheFirst).toEqual([]);
  });
});
