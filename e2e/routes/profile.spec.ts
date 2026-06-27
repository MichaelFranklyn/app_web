import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

// /profile carrega via query Me; tem dois cards FormBuilder: dados pessoais e senha.
const meData = () => ({
  me: {
    status: true,
    code: 200,
    message: "ok",
    data: {
      id: "me-1",
      name: "Vendedor Teste",
      email: "vt@empresa.com.br",
      role: "SELLER",
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
      company: {
        id: "c-1",
        nomeFantasia: "Empresa Teste",
        razaoSocial: "Empresa Teste LTDA",
      },
    },
  },
});

test("profile: edita dados pessoais", async ({ page }) => {
  await mockGraphql(page, {
    Me: () => meData(),
    UpdateMyProfile: (v) => ({
      updateMyProfile: {
        status: true,
        code: 200,
        message: "ok",
        data: {
          id: "me-1",
          ...(v.input as object),
          role: "SELLER",
          updatedAt: "2026-06-22T00:00:00Z",
        },
      },
    }),
  });

  await page.goto("/profile");

  await page.locator('input[name="name"]').fill("Vendedor Renomeado");
  await page.getByRole("button", { name: "Salvar alterações" }).click();

  await expect(page.getByText("Perfil atualizado com sucesso")).toBeVisible();
});

test("profile: altera a senha", async ({ page }) => {
  await mockGraphql(page, {
    Me: () => meData(),
    UpdateMyPassword: () => ({
      updateMyPassword: { status: true, code: 200, message: "ok" },
    }),
  });

  await page.goto("/profile");

  await page.locator('input[name="currentPassword"]').fill("SenhaAtual1!");
  await page.locator('input[name="newPassword"]').fill("SenhaNova1!");
  await page.locator('input[name="confirmPassword"]').fill("SenhaNova1!");
  await page.getByRole("button", { name: "Atualizar senha" }).click();

  await expect(page.getByText("Senha atualizada com sucesso")).toBeVisible();
});
