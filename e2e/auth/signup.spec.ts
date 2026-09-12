import { expect, test } from "../support/fixtures";
import { emptyDashboardQueries, mockGraphql } from "../support/graphql";

/**
 * Cadastro da empresa (`/signup`) — a porta de entrada do teste grátis.
 *
 * Como o login, a mutation roda no SERVIDOR (rota /api/session) e é o stub que
 * a responde; o que se prende aqui é o caminho do formulário: os dois passos, a
 * conferência da senha ANTES de ir à rede e o payload que sai.
 */
const CNPJ = "33.000.167/0001-01";

/** Preenche o passo da empresa e avança para os dados de acesso. */
async function passoEmpresa(page: import("@playwright/test").Page) {
  await page.locator('input[name="cnpj"]').fill(CNPJ);
  await page.locator('input[name="segment"]').fill("Representação Comercial");
  await page.getByRole("button", { name: "Continuar" }).click();
}

async function passoAcesso(
  page: import("@playwright/test").Page,
  senha = "senha-forte-123",
  confirmacao = senha
) {
  await page.locator('input[name="ownerName"]').fill("Dono Novo");
  await page
    .locator('input[name="ownerEmail"]')
    .fill("dono@empresanova.com.br");
  await page.locator('input[name="ownerPassword"]').fill(senha);
  await page.locator('input[name="confirmPassword"]').fill(confirmacao);
}

test.describe("Cadastro", () => {
  test("abre sem sessão e mostra a oferta do teste grátis", async ({
    page,
  }) => {
    const response = await page.goto("/signup");

    expect(response?.status()).toBe(200);
    await expect(page.getByText("Crie sua conta")).toBeVisible();
    await expect(page.getByText("Teste grátis")).toBeVisible();
  });

  test("os dois documentos ficam a um clique de onde se aceita", async ({
    page,
  }) => {
    // Quem chega direto no /signup por link nunca passou pelo rodapé da landing.
    await page.goto("/signup");

    await expect(page.getByRole("link", { name: /Termos/i })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Privacidade/i })
    ).toBeVisible();
  });

  test("cadastro completo abre a sessão e cai no dashboard", async ({
    page,
  }) => {
    await mockGraphql(page, { ...emptyDashboardQueries });

    let sessionBody: Record<string, unknown> | null = null;
    await page.route("**/api/session", async (route) => {
      sessionBody = route.request().postDataJSON();
      await route.continue();
    });

    await page.goto("/signup");
    await passoEmpresa(page);
    await passoAcesso(page);
    await page.getByRole("button", { name: "Criar conta grátis" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);

    // O payload é o normalizado: sem a confirmação de senha, que é só da tela.
    expect(sessionBody).toEqual({
      action: "signup",
      input: {
        cnpj: CNPJ,
        segment: "Representação Comercial",
        ownerName: "Dono Novo",
        ownerEmail: "dono@empresanova.com.br",
        ownerPassword: "senha-forte-123",
      },
    });
  });

  test("senhas diferentes param antes da rede", async ({ page }) => {
    // A conferência é do formulário: mandar ao backend uma conta cuja senha a
    // pessoa não sabe qual é seria pior que recusar aqui.
    let chamou = false;
    await page.route("**/api/session", async (route) => {
      chamou = true;
      await route.abort();
    });

    await page.goto("/signup");
    await passoEmpresa(page);
    await passoAcesso(page, "senha-forte-123", "senha-diferente-123");
    await page.getByRole("button", { name: "Criar conta grátis" }).click();

    await expect(page.getByText("As senhas não conferem.")).toBeVisible();
    expect(chamou).toBe(false);
    await expect(page).toHaveURL(/\/signup$/);
  });

  test("CNPJ inválido não deixa passar do primeiro passo", async ({ page }) => {
    await page.goto("/signup");

    await page.locator('input[name="cnpj"]').fill("11.111.111/1111-11");
    await page.locator('input[name="segment"]').fill("Representação Comercial");
    await page.getByRole("button", { name: "Continuar" }).click();

    // Continua no passo da empresa: o campo de nome do dono nem existe ainda.
    await expect(page.locator('input[name="ownerName"]')).toHaveCount(0);
  });

  test("backend recusando o cadastro mantém a pessoa na tela, com o motivo", async ({
    page,
  }) => {
    const message = "Já existe uma empresa com este CNPJ.";
    await page.route("**/api/session", (route) =>
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ status: false, message }),
      })
    );

    await page.goto("/signup");
    await passoEmpresa(page);
    await passoAcesso(page);
    await page.getByRole("button", { name: "Criar conta grátis" }).click();

    await expect(page.getByText(message)).toBeVisible();
    await expect(page).toHaveURL(/\/signup$/);
  });
});
