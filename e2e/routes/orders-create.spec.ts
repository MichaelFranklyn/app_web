import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * Fluxo de ESCRITA mais complexo: criar pedido via AddOrderModal.
 *
 * Wizard de 2 passos: passo 1 (Dados) com 3 selects custom EM CASCATA
 * (Vendedor → Fábrica → Cliente — cada seleção dispara uma query e habilita o
 * próximo select) + data via atalho "Hoje"; passo 2 (Itens, opcional) é pulado
 * aqui. Escolher a fábrica já monta o catálogo do passo 2 (queries OrderItem*),
 * por isso elas também são mockadas. Após sucesso: add otimista + refetch de
 * Orders/OrderStats.
 */

// Escolhe uma opção num Input.Select custom (dropdown em portal, fora do dialog).
async function pickOption(
  dialog: import("@playwright/test").Locator,
  page: import("@playwright/test").Page,
  fieldLabel: string,
  typeText: string,
  optionText: string
) {
  const select = dialog.getByRole("textbox", { name: fieldLabel });
  await expect(select).toBeEnabled();
  await select.click();
  await select.pressSequentially(typeText);
  await page
    .locator("[data-select-dropdown]")
    .getByText(optionText, { exact: true })
    .click();
}

test("orders: cria um pedido pela cascata vendedor→fábrica→cliente", async ({
  page,
}) => {
  const orders: Array<Record<string, unknown>> = [];

  const gql = await mockGraphql(page, {
    Orders: () => ({
      orders_list: {
        edges: orders.map((node) => ({ node })),
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: orders.length,
      },
    }),
    OrderStats: () => ({
      orderStats: {
        totalOrders: orders.length,
        totalAmount: "0",
        avgTicket: "0",
      },
    }),
    OrderSellersOptions: () => ({
      order_sellers_options: {
        edges: [{ node: { id: "seller-1", name: "Vendedor A" } }],
      },
    }),
    OrderSellerFactories: () => ({
      sellerFactoryAccessList: {
        edges: [
          {
            node: {
              factoryId: "factory-1",
              factory: {
                id: "factory-1",
                nomeFantasia: "Fábrica Modelo",
                razaoSocial: "Fabrica LTDA",
              },
            },
          },
        ],
      },
    }),
    OrderSellerClients: () => ({
      sellerClientFactoryList: {
        edges: [
          {
            node: {
              clientId: "client-1",
              client: {
                id: "client-1",
                razaoSocial: "Cliente LTDA",
                nomeFantasia: "Cliente XYZ",
              },
            },
          },
        ],
      },
    }),
    // Ao escolher a Fábrica, o passo 2 do wizard (rascunho de itens) monta o
    // catálogo da fábrica e dispara estas 5 queries. Sem mock elas caíam no
    // fallback `{}` — resposta malformada que o Apollo refazia em loop,
    // re-renderizando o form sem parar e desanexando o campo Cliente (o flake).
    // Respostas vazias e bem-formadas encerram o loop (o passo 2 não é exercido).
    OrderItemCompanyFactories: () => ({ companyFactories: { edges: [] } }),
    OrderItemProducts: () => ({ products: { edges: [] } }),
    OrderItemTiers: () => ({ priceTiers: { edges: [] } }),
    OrderItemPriceLists: () => ({ factoryPriceLists: { edges: [] } }),
    OrderItemPriceListItems: () => ({ priceListItems: { edges: [] } }),
    CreateOrder: () => {
      const node = {
        id: "order-1",
        orderDate: "2026-06-22",
        totalAmount: "0",
        commissionAmount: "0",
        status: "DRAFT",
        seller: { id: "seller-1", name: "Vendedor A" },
        client: {
          id: "client-1",
          razaoSocial: "Cliente LTDA",
          nomeFantasia: "Cliente XYZ",
        },
        factory: {
          id: "factory-1",
          nomeFantasia: "Fábrica Modelo",
          razaoSocial: "Fabrica LTDA",
        },
      };
      orders.push(node);
      return {
        createOrder: { status: true, code: 200, message: "ok", data: node },
      };
    },
  });

  await page.goto("/orders");
  await page.getByRole("button", { name: "Novo Pedido" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  await pickOption(dialog, page, "Vendedor", "Vendedor A", "Vendedor A");
  await pickOption(dialog, page, "Fábrica", "Fábrica", "Fábrica Modelo");
  await pickOption(dialog, page, "Cliente", "Cliente", "Cliente XYZ");

  // Data do pedido via atalho "Hoje". O <input> é pointer-events-none e quem
  // tem o onClick é o container; force:true faz o clique chegar nele e abrir.
  await dialog
    .getByRole("textbox", { name: "Data do pedido" })
    .click({ force: true });
  await page.getByRole("button", { name: "Hoje" }).click();

  // Passo 1 (Dados): "Avançar" valida os campos e vai ao passo 2 (Itens).
  await dialog.getByRole("button", { name: "Avançar" }).click();
  // Passo 2 (Itens, opcional): sem itens, o botão é "Criar pedido".
  await dialog
    .getByRole("button", { name: "Criar pedido", exact: true })
    .click();

  await expect(page.getByText("Pedido criado com sucesso")).toBeVisible();
  await expect(dialog).toBeHidden();

  // Não basta o toast: o payload precisa carregar exatamente a cascata escolhida
  // (vendedor/fábrica/cliente) + a data no formato ISO local.
  const createVars = await gql.waitForCall("CreateOrder");
  expect(createVars.input).toMatchObject({
    sellerId: "seller-1",
    factoryId: "factory-1",
    clientId: "client-1",
  });
  expect((createVars.input as { orderDate: string }).orderDate).toMatch(
    /^\d{4}-\d{2}-\d{2}$/
  );
});
