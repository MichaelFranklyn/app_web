import { test as setup } from "@playwright/test";
import { STORAGE_STATE } from "../../playwright.config";
import { emptyDashboardQueries, loginSuccess, mockGraphql } from "./graphql";

/**
 * Faz login uma única vez (com o GraphQL mockado) e persiste os cookies em
 * STORAGE_STATE. As specs do projeto `authenticated` reaproveitam esse estado,
 * evitando repetir o fluxo de login em cada teste de rota.
 */
setup("authenticate", async ({ page }) => {
  await mockGraphql(page, {
    Login: () => loginSuccess(),
    ...emptyDashboardQueries,
  });

  await page.goto("/login");
  await page.locator('input[name="email"]').fill("vendedor@empresa.com.br");
  await page.locator('input[name="password"]').fill("senha-correta");
  await page.getByRole("button", { name: /entrar/i }).click();

  await page.waitForURL(/\/dashboard$/);
  await page.context().storageState({ path: STORAGE_STATE });
});
