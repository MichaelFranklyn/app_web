import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Toda página que consulta o backend no SERVIDOR precisa de um `loading.tsx`
 * ao lado.
 *
 * Sem esse limite de Suspense, o React não pode enviar nada ao navegador antes
 * de a query terminar: o shell (sidebar, topbar) não é liberado e a entrada na
 * rota fica em branco até a resposta chegar — em produção, com o Cloud Run
 * dormindo, isso são segundos de tela vazia. Com o `loading.tsx`, o esqueleto
 * da tela aparece na hora e o conteúdo entra por cima.
 *
 * O teste varre `src/app` em vez de listar rotas: uma página nova que passe a
 * buscar dados no servidor cai aqui sozinha.
 */

const APP_DIR = join(process.cwd(), "src/app");

/**
 * Chamadas que fazem a rota esperar o backend antes de renderizar.
 *
 * São quatro porque há quatro jeitos de buscar no servidor:
 * `executeServerQueries` (listas, que desembrulha a resposta), `gqlFetch`
 * direto (páginas de detalhe que semeiam o cache do Apollo — ver
 * `useSeedQuery`, que precisa do shape cru) e os dois fetches por TOKEN DE
 * LINK, `portalFetch` (portal do cliente) e `visitResponseFetch` (folha de
 * resposta da rota).
 *
 * O guarda nasceu conhecendo só o primeiro, e as páginas de detalhe passaram a
 * usar o segundo: três telas do console de plataforma esperavam o backend sem
 * limite de Suspense e o teste continuava verde. Os dois últimos entraram pelo
 * mesmo motivo, em 21/09/2026: as quatro telas do portal do cliente esperavam
 * sem limite nenhum, e são JUSTAMENTE as que mais precisam dele — quem abre um
 * link no 4G de uma loja não tem sidebar nem topbar na tela para entender que
 * algo está carregando, só branco.
 */
const SERVER_FETCHES = [
  "executeServerQueries",
  "gqlFetch",
  "portalFetch",
  "visitResponseFetch",
];

const hasServerFetch = (path: string): boolean => {
  const text = readFileSync(path, "utf-8");
  return SERVER_FETCHES.some((call) => text.includes(call));
};

/** Diretórios cujo `page.tsx` espera o backend. */
function findPagesWithServerFetch(dir: string): string[] {
  const found: string[] = [];

  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);

    if (statSync(path).isDirectory()) {
      found.push(...findPagesWithServerFetch(path));
      continue;
    }

    if (entry === "page.tsx" && hasServerFetch(path)) found.push(dir);
  }

  return found;
}

/** Diretórios cujo `layout.tsx` espera o backend. */
function findLayoutsWithServerFetch(dir: string): string[] {
  const found: string[] = [];

  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);

    if (statSync(path).isDirectory()) {
      found.push(...findLayoutsWithServerFetch(path));
      continue;
    }

    if (entry === "layout.tsx" && hasServerFetch(path)) found.push(dir);
  }

  return found;
}

function hasLoadingFile(dir: string): boolean {
  return readdirSync(dir).includes("loading.tsx");
}

/**
 * O `loading.tsx` mais próximo ACIMA do diretório, sem contar o próprio.
 *
 * É o que responde pela espera de um `layout.tsx`: o limite de um segmento
 * envolve a página dele, não o layout dele. Enquanto o layout busca, nada de
 * dentro chegou a existir — quem cobre é o limite de um segmento de cima.
 */
function hasAncestorLoadingFile(dir: string): boolean {
  let current = dirname(dir);
  while (current.startsWith(APP_DIR)) {
    if (hasLoadingFile(current)) return true;
    if (current === APP_DIR) return false;
    current = dirname(current);
  }
  return false;
}

describe("limites de loading das rotas", () => {
  const dirs = findPagesWithServerFetch(APP_DIR);
  const layoutDirs = findLayoutsWithServerFetch(APP_DIR);

  it("encontra as páginas que buscam dados no servidor", () => {
    // Guarda contra a varredura silenciosamente parar de achar nada (mudança de
    // helper, de caminho) e o teste passar vazio.
    expect(dirs.length).toBeGreaterThan(0);
  });

  it.each(dirs)("%s tem loading.tsx", (dir) => {
    expect(hasLoadingFile(dir)).toBe(true);
  });

  it.each(layoutDirs)("%s busca no layout e tem limite ACIMA", (dir) => {
    // Um `loading.tsx` ao lado do layout não o cobre — ver
    // `hasAncestorLoadingFile`. O limite tem de estar num segmento de cima.
    expect(hasAncestorLoadingFile(dir)).toBe(true);
  });
});
