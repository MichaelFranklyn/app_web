import { test as setup } from "@playwright/test";
import { STORAGE_STATE } from "../../playwright.config";
import { emptyDashboardQueries, mockGraphql } from "./graphql";

/**
 * Faz login uma única vez e persiste os cookies (incl. o token httpOnly) em
 * STORAGE_STATE. As specs do projeto `authenticated` reaproveitam esse estado.
 *
 * Com o BFF httpOnly, o login roda a mutation no SERVIDOR (rota /api/session),
 * então o `Login` é servido pelo stub-backend (:8099), não por page.route. Só as
 * queries CLIENT do dashboard (via /api/graphql) seguem mockadas no browser.
 */
setup("authenticate", async ({ page }) => {
  await mockGraphql(page, { ...emptyDashboardQueries });

  await page.goto("/login");
  await page.locator('input[name="email"]').fill("vendedor@empresa.com.br");
  await page.locator('input[name="password"]').fill("senha-correta");
  await page.getByRole("button", { name: /entrar/i }).click();

  await page.waitForURL(/\/dashboard$/);
  await page.context().storageState({ path: STORAGE_STATE });
});
