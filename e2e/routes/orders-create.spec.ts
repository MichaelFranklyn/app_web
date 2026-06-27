import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * Fluxo de ESCRITA mais complexo: criar pedido via AddOrderModal.
 *
 * Single-step (sem tabela de itens — itens entram depois), mas com 3 selects
 * custom EM CASCATA: Vendedor → Fábrica → Cliente. Cada seleção dispara uma
 * query (OrderSellerFactories / OrderSellerClients) e habilita o próximo select.
 * A data usa o atalho "Hoje" do date picker (evita navegar o calendário).
 * Após sucesso: add otimista + refetch de Orders/OrderStats.
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

  await mockGraphql(page, {
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

  await dialog.getByRole("button", { name: "Criar pedido" }).click();

  await expect(page.getByText("Pedido iniciado com sucesso")).toBeVisible();
  await expect(dialog).toBeHidden();
});
