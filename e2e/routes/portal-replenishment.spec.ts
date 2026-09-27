import { expect, test } from "../support/fixtures";

/**
 * Reposição pelo portal: o cliente vê o que está acabando e pede.
 *
 * O envio é Server Action (sai do servidor do Next), então o stub do backend
 * ECOA o que recebeu na mensagem de confirmação — é assim que o teste prova
 * que só o produto MARCADO foi pedido, mesmo com a quantidade dos outros já
 * preenchida.
 */
test.use({ storageState: { cookies: [], origins: [] } });

const TOKEN = "token-de-teste-do-portal";

test("a aba Repor aparece quando o plano do escritório permite", async ({
  page,
}) => {
  await page.goto(`/p/${TOKEN}`);
  await page.getByRole("link", { name: "Repor" }).click();
  await expect(page).toHaveURL(new RegExp("/repor$"));
  await expect(page.getByText("Torneira Teste")).toBeVisible();
});

test("mostra o que está acabando, com a última compra e o que já foi pedido", async ({
  page,
}) => {
  await page.goto(`/p/${TOKEN}/repor`);

  await expect(page.getByText("Acaba em ~3 dias")).toBeVisible();
  await expect(page.getByText("Deve ter acabado")).toBeVisible();
  // A quantidade vem com a última compra, e o múltiplo da fábrica é dito.
  await expect(page.locator("#qty__prod-repor-1")).toHaveValue("24");
  await expect(page.getByText("A fábrica vende de 12 em 12.")).toBeVisible();
  // O que já espera o representante aparece, para ninguém pedir duas vezes.
  await expect(
    page.getByText(/Já pedido: 6 unidades, esperando o representante/)
  ).toBeVisible();
  // Sem preço: quem fecha preço e condição é o representante.
  await expect(
    page.getByText(/confere preço, condição e frete e confirma/)
  ).toBeVisible();
});

test("só o produto marcado é pedido", async ({ page }) => {
  await page.goto(`/p/${TOKEN}/repor`);

  await page.locator("#qty__prod-repor-1").fill("36");
  await page.getByLabel("Pedir este produto").first().check({ force: true });
  await page
    .getByRole("button", { name: "Pedir ao meu representante" })
    .click();

  await expect(page.getByText("Recebido: prod-repor-1=36")).toBeVisible();
  // A grade remonta: nada fica marcado depois do envio.
  await expect(page.getByLabel("Pedir este produto").first()).not.toBeChecked();
});

test("sem nada marcado, avisa e não envia", async ({ page }) => {
  await page.goto(`/p/${TOKEN}/repor`);

  await page
    .getByRole("button", { name: "Pedir ao meu representante" })
    .click();

  await expect(
    page.getByText("Marque pelo menos um produto e diga quanto quer.")
  ).toBeVisible();
});
