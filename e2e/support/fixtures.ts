import { test as base, expect, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

/**
 * `test` estendido que, quando `COVERAGE=1`, coleta a cobertura V8 do Chromium
 * por teste e grava em `coverage/e2e-v8/` para o merge-coverage.mjs fundir com
 * o vitest. Sem COVERAGE, é o `test` normal (zero overhead). Specs importam
 * daqui em vez de `@playwright/test`.
 */
const COVERAGE = !!process.env.COVERAGE;
const OUT_DIR = "coverage/e2e-v8";

// Suprime o auto-start do tour guiado (flowTour) nos testes: o overlay do tour
// cobriria a tela e interceptaria cliques (modais, edição). Marca todos os flow
// keys como "já vistos" no localStorage antes de cada navegação. Determinístico.
const FLOW_TOUR_SEEN = JSON.stringify(
  Object.fromEntries(
    [
      "system-overview",
      "routines",
      "routine-day",
      "clients",
      "client-detail",
      "client-visits",
      "client-stock",
      "client-score",
      "client-factories",
      "client-orders",
      "orders",
      "order-detail",
      "factories",
      "factory-detail",
      "factory-products",
      "factory-prices",
      "price-list-detail",
      "product-detail",
      "factory-sellers",
      "factory-clients",
      "factory-orders",
      "factory-import-template",
      "users",
      "sellers",
      "seller-detail",
      "settings-hub",
      "settings-catalog",
      "settings-routine",
      "profile",
    ].map((k) => [k, 99])
  )
);

/**
 * Espera o React terminar de hidratar a página.
 *
 * O `page.goto` devolve o controle assim que o HTML chega, e o HTML do SSR já
 * traz os botões de cabeçalho ("Filtros", "Novo produto", as abas) desenhados e
 * clicáveis — mas SEM handler, enquanto o bundle não hidratou. O clique cai no
 * vazio, o painel não abre, e o teste espera pelo campo até estourar o timeout.
 * Não é hipótese: `factory-products` falhava assim em 8 de 74 execuções com 4
 * workers, e em 0 de 98 com a espera (medido em 22/08/2026). A janela abre
 * quando a máquina está ocupada, então some ao rodar o spec sozinho — o que
 * fazia a falha parecer "lentidão da máquina".
 *
 * O sinal é o do próprio React: ele carimba `__reactFiber$…` em cada nó que
 * hidrata. Não basta olhar o `document` nem o `body`: como o layout raiz põe as
 * páginas dentro de um `<Suspense>`, o React hidrata a casca primeiro e a
 * subárvore depois — medido, o `body` já tinha fiber enquanto os 34 botões e
 * links da tela ainda tinham zero. Por isso a espera é por TODOS os `button` e
 * `a[href]`: são justamente os que dependem de um handler do React, e são o que
 * o teste vai clicar. Converge em 30–430 ms.
 *
 * Campo de formulário fica de fora de propósito: um `input` sem handler (os dias
 * do portal, por exemplo) nunca recebe fiber — o React não precisa dele —, e
 * exigi-lo deixava a espera presa até o timeout numa página que estava pronta.
 * `fill` também não depende de hidratação: escreve no DOM, e o `<form>` do
 * portal é nativo.
 */
async function waitForHydration(page: Page) {
  await page.waitForFunction(
    () => {
      const nodes = Array.from(
        document.body.querySelectorAll("button, a[href]")
      );

      return (
        nodes.length > 0 &&
        nodes.every((node) =>
          Object.keys(node).some((key) => key.startsWith("__reactFiber$"))
        )
      );
    },
    undefined,
    { timeout: 15_000 }
  );
}

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript((value) => {
      window.localStorage.setItem("flowtour:auto-seen", value);
    }, FLOW_TOUR_SEEN);

    // Todo `goto` da suíte só devolve o controle com a página hidratada: assim
    // nenhum spec precisa lembrar de esperar antes do primeiro clique.
    const goto = page.goto.bind(page);
    page.goto = async (url, options) => {
      const response = await goto(url, options);
      await waitForHydration(page);
      return response;
    };

    const canCover = COVERAGE && !!page.coverage; // page.coverage = só Chromium
    if (canCover) {
      await page.coverage.startJSCoverage({ resetOnNavigation: false });
    }
    try {
      // `use` é o fixture do Playwright (não um React Hook) — o plugin react-hooks
      // confunde pelo nome.
      // eslint-disable-next-line react-hooks/rules-of-hooks
      await use(page);
    } finally {
      if (canCover) {
        const entries = await page.coverage.stopJSCoverage();
        mkdirSync(OUT_DIR, { recursive: true });
        writeFileSync(
          `${OUT_DIR}/${randomUUID()}.json`,
          JSON.stringify(entries)
        );
      }
    }
  },
});

export { expect };
