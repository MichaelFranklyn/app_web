import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
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
 * Chamadas que fazem a página esperar o backend antes de renderizar.
 *
 * São duas porque há dois jeitos de buscar no servidor: `executeServerQueries`
 * (listas, que desembrulha a resposta) e `gqlFetch` direto (páginas de detalhe
 * que semeiam o cache do Apollo — ver `useSeedQuery`, que precisa do shape cru).
 *
 * O guarda nasceu conhecendo só o primeiro, e as páginas de detalhe passaram a
 * usar o segundo: três telas do console de plataforma esperavam o backend sem
 * limite de Suspense e o teste continuava verde.
 */
const SERVER_FETCHES = ["executeServerQueries", "gqlFetch"];

function findPagesWithServerFetch(dir: string): string[] {
  const found: string[] = [];

  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);

    if (statSync(path).isDirectory()) {
      found.push(...findPagesWithServerFetch(path));
      continue;
    }

    if (entry === "page.tsx") {
      const text = readFileSync(path, "utf-8");
      if (!SERVER_FETCHES.some((call) => text.includes(call))) continue;
      found.push(dir);
    }
  }

  return found;
}

function hasLoadingFile(dir: string): boolean {
  return readdirSync(dir).includes("loading.tsx");
}

describe("limites de loading das rotas", () => {
  const dirs = findPagesWithServerFetch(APP_DIR);

  it("encontra as páginas que buscam dados no servidor", () => {
    // Guarda contra a varredura silenciosamente parar de achar nada (mudança de
    // helper, de caminho) e o teste passar vazio.
    expect(dirs.length).toBeGreaterThan(0);
  });

  it.each(dirs)("%s tem loading.tsx", (dir) => {
    expect(hasLoadingFile(dir)).toBe(true);
  });
});
