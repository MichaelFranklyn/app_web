import { expect, test } from "../support/fixtures";

/**
 * O portal do cliente ponta a ponta, no navegador.
 *
 * Vale um E2E — e não só testes de unidade — por duas razões que só aparecem
 * com um navegador de verdade:
 *
 *  • **Ele tem que abrir SEM sessão.** O `proxy.ts` erra do lado seguro e manda
 *    para o login tudo que não está liberado; foi assim que a landing quebrou
 *    quando foi publicada. O portal libera `/p/` por PREFIXO, que é uma regra
 *    diferente da do marketing, e um redirecionamento aqui deixaria o cliente
 *    numa tela de login que ele não tem como passar.
 *
 *  • **O estoque é enviado por Server Action.** O formulário não passa pelo
 *    Apollo nem por rota de API: o POST sai do servidor do Next. Nenhum teste
 *    de unidade cobre o caminho do clique até a requisição.
 */
// Sem sessão, de propósito: quem abre o portal é um cliente que não tem conta
// no sistema. Com o storageState do usuário logado, o teste provaria menos.
test.use({ storageState: { cookies: [], origins: [] } });

const TOKEN = "token-de-teste-do-portal";

test.describe("Portal do cliente", () => {
  test("abre sem sessão e mostra o resumo das compras", async ({ page }) => {
    const response = await page.goto(`/p/${TOKEN}`);

    // 200, e não 307 para o login: é o que a liberação por prefixo garante.
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(new RegExp(`/p/${TOKEN}$`));

    await expect(
      page.getByRole("heading", { level: 1, name: "Resumo" })
    ).toBeVisible();
    // Quem é o cliente e quem o atende ficam na descrição do cabeçalho.
    await expect(
      page.getByText(
        "Loja do Cliente · Salvador - BA · atendido por Empresa Teste"
      )
    ).toBeVisible();

    await expect(page.getByText("R$ 5.000,00")).toBeVisible();
    await expect(page.getByText("Compras por mês")).toBeVisible();
    // Duas fábricas: a divisão aparece. Com uma só, o bloco some.
    await expect(page.getByText("Compras por fábrica")).toBeVisible();
    // A lista de pedidos mora em "Pedidos": o resumo não a repete.
    await expect(page.getByText("Seus pedidos")).toHaveCount(0);
  });

  test("o detalhe do pedido mostra os itens e as parcelas", async ({
    page,
  }) => {
    await page.goto(`/p/${TOKEN}/pedidos/order-portal-1`);

    await expect(page.getByText("Torneira Teste")).toBeVisible();
    await expect(page.getByText("Código SKU-1")).toBeVisible();
    await expect(page.getByText("Prazo de pagamento")).toBeVisible();
    await expect(page.getByText("30/60", { exact: true })).toBeVisible();

    await expect(page.getByText("2 parcelas")).toBeVisible();
    await expect(page.getByText("vence 05/09/2026")).toBeVisible();
    await expect(page.getByText("Pago em 01/10/2026")).toBeVisible();
  });

  test("o cliente informa o estoque e recebe a confirmação", async ({
    page,
  }) => {
    await page.goto(`/p/${TOKEN}/estoque`);

    // Uma fábrica por vez, abrindo pela mais urgente: o produto com 5 dias é
    // da Alfa; o sem estimativa, da Beta, aparece ao trocar a fábrica.
    await expect(page.getByText("Acaba em ~5 dias")).toBeVisible();
    await expect(page.getByText("Sifão Teste")).toBeHidden();
    await page
      .getByRole("button", { name: "Fábrica Beta", exact: true })
      .click();
    await expect(page.getByText("Sifão Teste")).toBeVisible();
    await page
      .getByRole("button", { name: "Fábrica Alfa", exact: true })
      .click();

    await page.locator("#days__prod-1").fill("3");
    // O botão conta o que vai: "Enviar 1 produto para o meu representante".
    await page
      .getByRole("button", {
        name: /enviar 1 produto para o meu representante/i,
      })
      .click();

    await expect(
      page.getByText("Obrigado! Seu representante já vê essa informação.")
    ).toBeVisible();
  });

  test("não envia nada quando nenhum campo foi preenchido", async ({
    page,
  }) => {
    await page.goto(`/p/${TOKEN}/estoque`);

    await page
      .getByRole("button", { name: /enviar para o meu representante/i })
      .click();

    // O cliente que toca no botão sem preencher precisa de um recado, não de
    // um "obrigado" por um envio vazio.
    await expect(
      page.getByText("Preencha pelo menos um produto para enviar.")
    ).toBeVisible();
  });

  test("navega entre as duas abas", async ({ page }) => {
    await page.goto(`/p/${TOKEN}`);

    await page.getByRole("link", { name: "Meu estoque" }).click();
    await expect(page).toHaveURL(new RegExp("/estoque$"));

    await page.getByRole("link", { name: "Resumo" }).click();
    await expect(page).toHaveURL(new RegExp(`/p/${TOKEN}$`));
  });
});
