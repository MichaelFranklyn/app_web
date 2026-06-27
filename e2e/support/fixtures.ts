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

export const test = base.extend({
  page: async ({ page }, use) => {
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
