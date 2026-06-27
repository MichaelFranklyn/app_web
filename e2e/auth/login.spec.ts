import { expect, test } from "../support/fixtures";
import {
  emptyDashboardQueries,
  loginFailure,
  loginSuccess,
  mockGraphql,
} from "../support/graphql";

test.describe("Login", () => {
  test("credenciais válidas → entra e cai no dashboard", async ({ page }) => {
    await mockGraphql(page, {
      Login: () => loginSuccess(),
      ...emptyDashboardQueries,
    });

    await page.goto("/login");

    await page.locator('input[name="email"]').fill("vendedor@empresa.com.br");
    await page.locator('input[name="password"]').fill("senha-correta");
    await page.getByRole("button", { name: /entrar/i }).click();

    // Redireciona para o dashboard...
    await expect(page).toHaveURL(/\/dashboard$/);
    // ...e o layout interno (sidebar) está montado.
    await expect(page.getByRole("link", { name: "Pedidos" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Fábricas" })).toBeVisible();
  });

  test("credenciais inválidas → mostra erro e permanece no login", async ({
    page,
  }) => {
    const message = "Credenciais inválidas. Verifique seu e-mail e senha.";

    await mockGraphql(page, {
      Login: () => loginFailure(message),
    });

    await page.goto("/login");

    await page.locator('input[name="email"]').fill("errado@empresa.com.br");
    await page.locator('input[name="password"]').fill("senha-errada");
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page.getByText(message)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});
