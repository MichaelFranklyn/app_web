import { expect, test } from "../support/fixtures";
import {
  FAKE_JWT,
  emptyDashboardQueries,
  mockGraphql,
} from "../support/graphql";

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
  await mockGraphql(page, {
    ResetPassword: () => ({
      resetPassword: {
        status: true,
        code: 200,
        message: "ok",
        data: {
          accessToken: FAKE_JWT,
          refreshToken: FAKE_JWT,
          userName: "Vendedor Teste",
          companyName: "Empresa Teste",
          role: "SELLER",
        },
      },
    }),
    ...emptyDashboardQueries,
  });

  await page.goto("/change-password?token=test-token");

  // Dois campos de senha (InputPassword não tem name; ambos type=password).
  const passwords = page.locator('input[type="password"]');
  await passwords.nth(0).fill("SenhaForte1!");
  await passwords.nth(1).fill("SenhaForte1!");
  await page.getByRole("button", { name: /Redefinir senha/ }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
});
