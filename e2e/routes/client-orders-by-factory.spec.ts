import { expect, test } from "../support/fixtures";
import { emptyConnection as conn, mockGraphql } from "../support/graphql";

/**
 * Aba Pedidos do cliente (/clients/[id]/orders). O pedido é POR FÁBRICA: a aba
 * lista um card por vínculo e os pedidos daquela fábrica só carregam ao abrir o
 * card — mesma forma das abas Score e Estoque.
 */
const clientLayout = () => ({
  CompanyClient: () => ({
    companyClient: {
      status: true,
      code: 200,
      message: "ok",
      data: {
        id: "cc-1",
        notes: null,
        isActive: true,
        topVisitScore: null,
        factoryVisitScores: [],
        client: {
          id: "client-1",
          cnpj: "12345678000199",
          razaoSocial: "Cliente LTDA",
          nomeFantasia: "Meu Cliente",
          cnae: "4744099",
          cnaeDescription: null,
          addressStreet: null,
          addressNumber: null,
          addressComplement: null,
          addressNeighborhood: null,
          addressZip: null,
          addressCity: null,
          addressState: null,
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
      },
    },
  }),
});

const summaries = () => ({
  companyClient: {
    data: {
      id: "cc-1",
      factoryOrderSummaries: [
        {
          sellerClientFactoryId: "scf-1",
          sellerId: "s-1",
          totalOrders: 2,
          totalAmount: "1500.00",
          lastOrderDate: "2026-06-20",
          factory: {
            id: "f-1",
            nomeFantasia: "Fábrica Alfa",
            razaoSocial: "Alfa LTDA",
          },
        },
        {
          sellerClientFactoryId: "scf-2",
          sellerId: "s-1",
          totalOrders: 0,
          totalAmount: "0.00",
          lastOrderDate: null,
          factory: {
            id: "f-2",
            nomeFantasia: "Fábrica Beta",
            razaoSocial: "Beta LTDA",
          },
        },
      ],
    },
  },
});

const orderNode = {
  id: "0000aaaa-1111-2222-3333-444455556666",
  orderDate: "2026-06-20",
  totalAmount: "1000.00",
  status: "confirmado",
  notes: null,
  factory: {
    id: "f-1",
    nomeFantasia: "Fábrica Alfa",
    razaoSocial: "Alfa LTDA",
  },
  seller: { id: "s-1", name: "Vendedor Teste" },
};

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

test("cliente/pedidos: criar pedido usa o wizard e redireciona ao pedido novo", async ({
  page,
}) => {
  let createVars: Record<string, unknown> | null = null;

  await mockGraphql(page, {
    ...clientLayout(),
    ClientFactoryOrders: summaries,
    // Vínculos vendedor→fábrica do cliente (passo 1 do wizard).
    ClientAssignments: () => ({
      sellerClientFactoryList: {
        edges: [
          {
            node: {
              id: "scf-1",
              sellerId: "s-1",
              factoryId: "f-1",
              seller: { id: "s-1", name: "Vendedor A" },
              factory: {
                id: "f-1",
                nomeFantasia: "Fábrica Alfa",
                razaoSocial: "Alfa LTDA",
              },
            },
          },
        ],
      },
    }),
    // Escolher o vínculo monta o catálogo do passo 2 (respostas vazias encerram
    // o carregamento sem exercer os itens).
    OrderItemCompanyFactories: () => ({ companyFactories: { edges: [] } }),
    OrderItemProducts: () => ({ products: { edges: [] } }),
    OrderItemTiers: () => ({ priceTiers: { edges: [] } }),
    OrderItemPriceLists: () => ({ factoryPriceLists: { edges: [] } }),
    OrderItemPriceListItems: () => ({ priceListItems: { edges: [] } }),
    CreateOrderFromClient: (variables) => {
      createVars = variables.input as Record<string, unknown>;
      return {
        createOrder: {
          status: true,
          code: 200,
          message: "ok",
          data: { id: "order-novo" },
        },
      };
    },
  });

  await page.goto("/clients/cc-1/orders");
  await page.getByRole("button", { name: "Pedido", exact: true }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  await pickOption(
    dialog,
    page,
    "Vendedor → Fábrica",
    "Vendedor",
    "Vendedor A → Fábrica Alfa"
  );
  await dialog
    .getByRole("textbox", { name: "Data do pedido" })
    .click({ force: true });
  await page.getByRole("button", { name: "Hoje" }).click();

  // Passo 1 (Dados) → passo 2 (Itens, opcional) → criar sem itens.
  await dialog.getByRole("button", { name: "Avançar" }).click();
  await dialog
    .getByRole("button", { name: "Criar pedido", exact: true })
    .click();

  // Redireciona para o pedido recém-criado.
  await page.waitForURL(/\/orders\/order-novo/);
  expect(createVars).toMatchObject({
    sellerId: "s-1",
    clientId: "client-1",
    factoryId: "f-1",
  });
});

test("cliente/pedidos: um card por fábrica, incluindo onde nunca comprou", async ({
  page,
}) => {
  await mockGraphql(page, {
    ...clientLayout(),
    ClientFactoryOrders: summaries,
  });

  await page.goto("/clients/cc-1/orders");

  await expect(page.getByText("Fábrica Alfa")).toBeVisible();
  // Sem o dia exato: `formatDate` lê a data pura como UTC e o rótulo desloca com
  // o fuso da máquina que roda o teste.
  await expect(page.getByText(/Última em \d{2}\/\d{2}\/\d{4}/)).toBeVisible();
  await expect(page.getByText("2 pedidos")).toBeVisible();

  // A fábrica sem pedido aparece: a ausência de compra é informação de venda.
  await expect(page.getByText("Fábrica Beta")).toBeVisible();
  await expect(page.getByText("Nunca comprou")).toBeVisible();
});

test("cliente/pedidos: abrir o card carrega os pedidos daquela fábrica", async ({
  page,
}) => {
  let ordersVariables: Record<string, unknown> | null = null;

  await mockGraphql(page, {
    ...clientLayout(),
    ClientFactoryOrders: summaries,
    ClientOrders: (variables) => {
      ordersVariables = variables;
      return {
        orders: { ...conn(), edges: [{ node: orderNode }], totalCount: 1 },
      };
    },
  });

  await page.goto("/clients/cc-1/orders");
  await page
    .getByRole("button", { name: "Ver os pedidos de Fábrica Alfa" })
    .click();

  const modal = page.getByLabel("Pedidos — Fábrica Alfa");
  await expect(
    page.getByRole("heading", { name: "Pedidos — Fábrica Alfa" })
  ).toBeVisible();
  // Escopado ao modal: o nome do vendedor logado também aparece na sidebar.
  await expect(modal.getByText("Vendedor Teste")).toBeVisible();

  // O recorte é cliente × fábrica: sem o filtro de fábrica o modal mostraria os
  // pedidos de todas as fábricas do cliente.
  const filters = (
    (ordersVariables as unknown as { input: { filters: unknown[] } }).input
      .filters as { field: string; value: string }[]
  ).map((f) => [f.field, f.value]);

  expect(filters).toContainEqual(["factory_id", "f-1"]);
  // `[id]` da rota é a carteira; a query de pedidos usa o id do cliente global.
  expect(filters).toContainEqual(["client_id", "client-1"]);
  // NUNCA por vendedor: o vínculo troca de dono e o histórico de compra fica —
  // filtrar por `seller_id` sumia com tudo o que o vendedor anterior vendeu.
  expect(filters.map(([field]) => field)).not.toContain("seller_id");
});
