import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * GUARDA DE ARQUITETURA — select com teto fixo.
 *
 * Um select que busca `first: N` e filtra no NAVEGADOR mostra só os N primeiros
 * que o banco devolver. Passando de N, o registro existe e a tela diz que não —
 * sem erro, sem aviso. Foi o que aconteceu com o catálogo de produtos: a fábrica
 * tinha 621 itens, o modal pedia 200, e o produto "não existia".
 *
 * O caminho certo é `useAsyncSelectOptions` (busca `like` no servidor, com
 * `baseFilters` para o escopo). Este teste congela os selects que AINDA usam
 * teto fixo: incluir um novo quebra a suíte, e corrigir um exige tirá-lo da
 * lista. A lista é dívida conhecida, não permissão.
 *
 * Há duas saídas, e a escolha é pelo tamanho do catálogo:
 *
 * - **cresce sem teto** (produtos, clientes) → `useAsyncSelectOptions`: busca
 *   `like` no servidor. Baixar 800 itens para escolher um é desperdício mesmo
 *   quando não trunca.
 * - **pequeno por natureza** (níveis, vendedores, unidades, regras de imposto)
 *   → `useCompleteList`: uma requisição enquanto couber, e uma segunda pelo
 *   total no dia em que não couber. A UX não muda — o select segue filtrando em
 *   memória.
 */

const MIN_PAGE_SIZE = 50;

const SRC = resolve(process.cwd(), "src");

/** Todos os fontes do app, com o caminho relativo à raiz do projeto. */
const readSources = (): Map<string, string> => {
  const out = new Map<string, string>();
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (/\.tsx?$/.test(entry.name)) {
        out.set(relative(process.cwd(), full), readFileSync(full, "utf8"));
      }
    }
  };
  walk(SRC);
  return out;
};

/**
 * Tira comentários antes de procurar o teto.
 *
 * O guarda lê TEXTO, e um arquivo que explica por que deixou de ter teto fixo
 * escreve o número antigo por extenso ("o `first: 50` que estava aqui"). Sem
 * isto, documentar a correção acusa o arquivo corrigido — e o caminho mais
 * curto para o verde passaria a ser apagar a explicação.
 */
const stripComments = (text: string): string =>
  text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");

const sources = readSources();

/** Um select costuma nascer num arquivo e ser desenhado no vizinho. */
const groupOf = (path: string): string => {
  const dir = dirname(path);
  return [...sources]
    .filter(([p]) => dirname(p) === dir)
    .map(([, text]) => stripComments(text))
    .join("\n");
};

const drawsSelect = (text: string) =>
  /"select-(single|multi)"|Input\.Select|<Select/.test(text);

const findOffenders = (): string[] => {
  const offenders: string[] = [];
  for (const [path, text] of sources) {
    if (/\.(test|spec)\.tsx?$/.test(path)) continue;
    const code = stripComments(text);
    const pages = [...code.matchAll(/first:\s*(\d+)/g)].map((m) =>
      Number(m[1])
    );
    if (!pages.some((n) => n >= MIN_PAGE_SIZE)) continue;
    // Quem pagina em laço não tem teto: percorre até a última página.
    if (code.includes("useAllPages") || code.includes("MAX_PAGES")) continue;
    const group = groupOf(path);
    if (!drawsSelect(group)) continue;
    if (group.includes("onSearch")) continue;
    offenders.push(path);
  }
  return offenders.sort();
};

/**
 * Dívida conhecida — hoje, nenhuma.
 *
 * Todo select do app ou busca no servidor (`useAsyncSelectOptions`, para
 * catálogo que cresce) ou carrega a lista inteira (`useCompleteList`, que
 * rebusca pelo total quando a primeira página não deu conta). Acrescentar um
 * caminho aqui é assumir que aquele select pode esconder registro — só com o
 * número medido no banco ao lado.
 */
const KNOWN: string[] = [];

describe("guarda: select com teto fixo", () => {
  it("varreu os fontes do app", () => {
    expect(sources.size).toBeGreaterThan(500);
  });

  it("nenhum select novo busca uma página fixa em vez de buscar no servidor", () => {
    const novos = findOffenders().filter((p) => !KNOWN.includes(p));
    expect(
      novos,
      `Select novo com \`first: N\` fixo e filtro no navegador.\n` +
        `Passando de N o registro existe e a tela diz que não — sem erro nenhum.\n` +
        `Use \`useAsyncSelectOptions\` (searchField + baseFilters), como em\n` +
        `AddItemModal da tabela de preço. Se o catálogo for realmente pequeno e\n` +
        `limitado, acrescente o arquivo a KNOWN com o número medido no banco.`
    ).toEqual([]);
  });

  it("a lista de dívida não guarda quem já foi corrigido", () => {
    const offenders = findOffenders();
    const resolvidos = KNOWN.filter((p) => !offenders.includes(p));
    expect(
      resolvidos,
      "Estes já não têm teto fixo — tire-os de KNOWN para a lista não mentir."
    ).toEqual([]);
  });
});
