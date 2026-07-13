import { expect, test } from "../support/fixtures";
import { emptyDashboardQueries, mockGraphql } from "../support/graphql";

test("forgot-password: solicita o link de redefinição", async ({ page }) => {
  await mockGraphql(page, {
    RequestPasswordReset: () => ({
      requestPasswordReset: { status: true, code: 200, message: "ok" },
    }),
  });

  await page.goto("/forgot-password");

  await page.locator('input[name="email"]').fill("vendedor@empresa.com.br");
  await page.getByRole("button", { name: /Enviar instruções/ }).click();

  await expect(page.getByText("Link enviado com sucesso")).toBeVisible();
});

test("change-password: redefine a senha com token e entra no dashboard", async ({
  page,
}) => {
  // ResetPassword estabelece sessão → roda no servidor (rota /api/session) e é
  // servido pelo stub-backend. Só as queries CLIENT do dashboard são mockadas aqui.
  await mockGraphql(page, { ...emptyDashboardQueries });

  await page.goto("/change-password?token=test-token");

  // Dois campos de senha (InputPassword não tem name; ambos type=password).
  const passwords = page.locator('input[type="password"]');
  await passwords.nth(0).fill("SenhaForte1!");
  await passwords.nth(1).fill("SenhaForte1!");
  await page.getByRole("button", { name: /Redefinir senha/ }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
});
