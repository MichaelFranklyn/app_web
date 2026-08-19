import { expect, test } from "../support/fixtures";
import { emptyDashboardQueries, mockGraphql } from "../support/graphql";

test.describe("Login", () => {
  test("credenciais válidas → entra e cai no dashboard", async ({ page }) => {
    // O login roda no servidor (rota /api/session) → o `Login` vem do
    // stub-backend. Só as queries CLIENT do dashboard são mockadas no browser.
    await mockGraphql(page, { ...emptyDashboardQueries });

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

  test("Enter no campo de senha entra, sem precisar do mouse", async ({
    page,
  }) => {
    // O formulário do login roda em modo `unstyled`: o botão "Entrar" mora fora
    // do <form>, e o HTML só envia com Enter quando existe um botão de submit
    // DENTRO dele. Ficou um tempo sem enviar nada — quem digita e-mail e senha
    // e aperta Enter não vai atrás do mouse.
    await mockGraphql(page, { ...emptyDashboardQueries });

    await page.goto("/login");

    await page.locator('input[name="email"]').fill("vendedor@empresa.com.br");
    await page.locator('input[name="password"]').fill("senha-correta");
    await page.locator('input[name="password"]').press("Enter");

    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("credenciais inválidas → mostra erro e permanece no login", async ({
    page,
  }) => {
    const message = "Credenciais inválidas. Verifique seu e-mail e senha.";

    // A rota /api/session responde a falha; interceptamos no browser (o stub
    // sempre devolve sucesso para Login).
    await page.route("**/api/session", (route) =>
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ status: false, message }),
      })
    );

    await page.goto("/login");

    await page.locator('input[name="email"]').fill("errado@empresa.com.br");
    await page.locator('input[name="password"]').fill("senha-errada");
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page.getByText(message)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});
