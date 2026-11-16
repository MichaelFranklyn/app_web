import { expect, test } from "../support/fixtures";

/**
 * Pedido aberto dentro do portal (`/p/[token]/pedidos/[orderId]`).
 *
 * Tudo aqui é SERVER-SIDE: não há Apollo no navegador do portal, e a decisão
 * entre a ficha e o "não encontrado" acontece no servidor — fora do alcance do
 * `page.route`. Os dados vêm do stub (`PortalOrder`), que responde por id.
 *
 * É a tela que o cliente lê CONFERINDO, item a item, contra a nota na outra
 * mão: por isso os testes olham para os números e as parcelas, não para o
 * layout.
 */
// Sem sessão, de propósito: quem abre o portal não tem conta no sistema.
test.use({ storageState: { cookies: [], origins: [] } });

const TOKEN = "token-de-teste-do-portal";
const URL = `/p/${TOKEN}/pedidos/order-portal-1`;

test("pedido do portal: abre sem sessão e identifica a compra", async ({
  page,
}) => {
  const response = await page.goto(URL);

  // 200, e não 307 para o login: a liberação de `/p/` é por prefixo, e o id do
  // pedido no caminho não pode fazê-la deixar de valer.
  expect(response?.status()).toBe(200);

  // Como no sistema: o número do pedido no título, a fábrica na descrição.
  await expect(
    page.getByRole("heading", { name: "Pedido #428" })
  ).toBeVisible();
  await expect(
    page.getByText("Fábrica Alfa · Entregue em 10/08/2026")
  ).toBeVisible();
  await expect(page.getByText("R$ 3.000,00").first()).toBeVisible();
  await expect(page.getByText("Entregue", { exact: true })).toBeVisible();
  await expect(page.getByText("Prazo de pagamento")).toBeVisible();
  await expect(page.getByText("30/60", { exact: true })).toBeVisible();
});

test("pedido do portal: lista os itens com quantidade, preço e total da linha", async ({
  page,
}) => {
  await page.goto(URL);

  await expect(page.getByText("1 produto", { exact: true })).toBeVisible();
  await expect(page.getByText("Quantidades em unidades.")).toBeVisible();
  await expect(page.getByText("Torneira Teste")).toBeVisible();
  await expect(page.getByText("Código SKU-1")).toBeVisible();
  // Uma linha da tabela: quantidade, preço com imposto e total da linha.
  const row = page.getByRole("row").filter({ hasText: "Torneira Teste" });
  await expect(row.getByText("12", { exact: true })).toBeVisible();
  // Sem imposto, preço e preço com imposto coincidem.
  await expect(row.getByText("R$ 250,00").first()).toBeVisible();
  await expect(row.getByText("R$ 3.000,00")).toBeVisible();
});

test("pedido do portal: mostra as parcelas e o que já foi pago", async ({
  page,
}) => {
  await page.goto(URL);

  await expect(page.getByRole("heading", { name: "Pagamento" })).toBeVisible();
  await expect(page.getByText("2 parcelas")).toBeVisible();
  await expect(page.getByText("1ª · vence 05/09/2026")).toBeVisible();
  await expect(page.getByText("2ª · vence 05/10/2026")).toBeVisible();
  await expect(page.getByText("Pago em 01/10/2026")).toBeVisible();
});

test("pedido do portal: volta para a lista de pedidos", async ({ page }) => {
  await page.goto(URL);

  // O mesmo destino existe na navegação do portal; aqui o alvo é o link de
  // voltar, dentro do conteúdo.
  await page.getByRole("main").getByRole("link", { name: "Pedidos" }).click();

  await expect(page).toHaveURL(new RegExp(`/p/${TOKEN}/enviados$`));
});

test("pedido do portal: pedido que não é dele não vira ficha vazia", async ({
  page,
}) => {
  // Pedido de outro cliente e pedido inexistente chegam iguais — o backend
  // responde 404 para os dois de propósito, e a tela também não distingue.
  await page.goto(`/p/${TOKEN}/pedidos/de-outro-cliente`);

  await expect(page.getByText("Pedido não encontrado")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Voltar para os pedidos" })
  ).toBeVisible();
});
