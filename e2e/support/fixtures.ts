import { test as base, expect } from "@playwright/test";
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
      "settings-catalog",
      "settings-routine",
      "profile",
    ].map((k) => [k, 99])
  )
);

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript((value) => {
      window.localStorage.setItem("flowtour:auto-seen", value);
    }, FLOW_TOUR_SEEN);
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
