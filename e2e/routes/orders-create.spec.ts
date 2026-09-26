import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";
import { grantRole } from "../support/role";

/**
 * Fluxo de ESCRITA mais complexo: criar pedido na página `/orders/new`.
 *
 * O usuário do storageState é um VENDEDOR, e para ele a cascata começa na
 * fábrica: o campo "Vendedor" só existe para gestor, porque a query `sellers`
 * é admin-only no backend (403 para o vendedor) e o `createOrder` já força o
 * vendedor do token. Enquanto o campo existia para todo mundo, este spec
 * passava com o select preenchido pelo mock e a tela real ficava travada.
 *
 * Página única: "Dados do pedido" com selects custom EM CASCATA (Fábrica →
 * Cliente — cada seleção dispara uma query e habilita o próximo) + data via
 * atalho "Hoje"; os "Itens" (opcionais) ficam logo abaixo e não são exercidos
 * aqui. Escolher a fábrica já monta o catálogo dos itens (queries OrderItem*),
 * por isso elas também são mockadas. Após sucesso: invalidação da listagem e
 * ENTRADA no pedido recém-criado (o botão segura o loading até lá).
 */

// Escolhe uma opção num Input.Select custom (dropdown em portal).
async function pickOption(
  page: import("@playwright/test").Page,
  fieldLabel: string,
  typeText: string,
  optionText: string
) {
  const select = page.getByRole("textbox", { name: fieldLabel });
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
        invoicedOrders: 0,
        invoicedAmount: "0",
        commissionAmount: "0",
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
    // Ao escolher a Fábrica, o cartão de itens (rascunho) monta o
    // catálogo da fábrica e dispara estas 5 queries. Sem mock elas caíam no
    // fallback `{}` — resposta malformada que o Apollo refazia em loop,
    // re-renderizando o form sem parar e desanexando o campo Cliente (o flake).
    // Respostas vazias e bem-formadas encerram o loop (os itens não são exercidos).
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
    // Destino do redirect: o pedido recém-criado abre sozinho.
    OrderDetail: () => ({
      order: {
        status: true,
        code: 200,
        message: "ok",
        data: {
          id: "order-1",
          orderDate: "2026-06-22",
          totalAmount: "0",
          ipiAmount: "0",
          taxAmount: "0",
          ipiInOrder: false,
          commissionAmount: "0",
          status: "DRAFT",
          freightType: null,
          fileUrl: null,
          isFileParsed: false,
          notes: null,
          createdAt: "2026-06-22T12:00:00Z",
          invoicedAt: null,
          deliveredAt: null,
          deliveryEstimateDays: null,
          coverageDays: null,
          estimatedDeliveryDate: null,
          isDeliveryOverdue: false,
          paymentTermId: null,
          commissionCalcBasis: null,
          installmentDueBasis: null,
          parentOrderId: null,
          isBackorder: false,
          parentOrder: null,
          backorderChildren: [],
          seller: { id: "seller-1", name: "Vendedor A" },
          client: {
            id: "client-1",
            razaoSocial: "Cliente LTDA",
            nomeFantasia: "Cliente XYZ",
            cnpj: null,
            addressCity: null,
            addressState: null,
          },
          factory: {
            id: "factory-1",
            nomeFantasia: "Fábrica Modelo",
            nickname: null,
            razaoSocial: "Fabrica LTDA",
            logoUrl: null,
          },
          paymentTerm: null,
          availablePaymentTerms: [],
          installments: [],
        },
      },
    }),
    OrderItems: () => ({ orderItems: { edges: [], totalCount: 0 } }),
  });

  await page.goto("/orders");
  // Pedido digitado tem página própria: o botão leva para ela, não abre modal.
  await page.getByRole("button", { name: "Novo pedido" }).click();
  await expect(page).toHaveURL(/\/orders\/new$/);

  // Vendedor logado não escolhe vendedor: o campo nem existe para ele.
  await expect(page.getByRole("textbox", { name: "Fábrica" })).toBeEnabled();
  await expect(page.getByRole("textbox", { name: "Vendedor" })).toHaveCount(0);
  await pickOption(page, "Fábrica", "Fábrica", "Fábrica Modelo");
  await pickOption(page, "Cliente", "Cliente", "Cliente XYZ");

  // Data do pedido via atalho "Hoje". O <input> é pointer-events-none e quem
  // tem o onClick é o container; force:true faz o clique chegar nele e abrir.
  await page
    .getByRole("textbox", { name: "Data do pedido" })
    .click({ force: true });
  await page.getByRole("button", { name: "Hoje" }).click();

  // Sem itens, o botão é "Criar pedido": valida os dados e grava.
  await page.getByRole("button", { name: "Criar pedido", exact: true }).click();

  await expect(page.getByText("Pedido criado com sucesso")).toBeVisible();
  // Criar leva PARA DENTRO do pedido: é o que o vendedor faz em seguida
  // (conferir e lançar itens).
  await expect(page).toHaveURL(/\/orders\/order-1$/);

  // Não basta o toast: o payload precisa carregar exatamente a cascata escolhida
  // (vendedor/fábrica/cliente) + a data no formato ISO local.
  const createVars = await gql.waitForCall("CreateOrder");
  expect(createVars.input).toMatchObject({
    // Veio do perfil de quem está logado (cookie `userData.sellerId`), não de
    // um campo do formulário.
    sellerId: "seller-1",
    factoryId: "factory-1",
    clientId: "client-1",
  });
  expect((createVars.input as { orderDate: string }).orderDate).toMatch(
    /^\d{4}-\d{2}-\d{2}$/
  );
});

/**
 * A outra metade da regra: o GESTOR escolhe de quem é o pedido.
 *
 * Sem este caso, esconder o campo para o vendedor poderia ter escondido para
 * todo mundo — e o gestor perderia a única forma de lançar um pedido no nome de
 * outra pessoa.
 */
test("orders: gestor escolhe o vendedor do pedido", async ({ page }) => {
  await grantRole(page, "OWNER");
  await mockGraphql(page, {
    Orders: () => ({
      orders_list: {
        edges: [],
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: 0,
      },
    }),
    OrderStats: () => ({
      orderStats: {
        totalOrders: 0,
        totalAmount: "0",
        avgTicket: "0",
        invoicedOrders: 0,
        invoicedAmount: "0",
        commissionAmount: "0",
      },
    }),
    // Opções do painel de filtros (só o gestor as vê).
    OrderFilterSellers: () => ({ order_filter_sellers: { edges: [] } }),
    OrderFilterFactories: () => ({ order_filter_factories: { edges: [] } }),
    OrderFilterClients: () => ({ order_filter_clients: { edges: [] } }),
    OrderSellersOptions: () => ({
      order_sellers_options: {
        edges: [{ node: { id: "seller-1", name: "Vendedor A" } }],
      },
    }),
  });

  await page.goto("/orders/new");

  await expect(page.getByRole("textbox", { name: "Vendedor" })).toBeEnabled();
});

/**
 * A porta da FÁBRICA: a página abre com a fábrica decidida e o dono do pedido
 * sai do vínculo vendedor → cliente — nada de cascata.
 */
test("orders/new: da fábrica, escolhe o vínculo e grava com a fábrica da tela", async ({
  page,
}) => {
  const gql = await mockGraphql(page, {
    FactoryAssignments: () => ({
      sellerClientFactoryList: {
        edges: [
          {
            node: {
              id: "scf-1",
              sellerId: "seller-1",
              clientId: "client-1",
              isNegative: false,
              negativeReason: null,
              seller: { id: "seller-1", name: "Vendedor A" },
              client: {
                id: "client-1",
                razaoSocial: "Cliente LTDA",
                nomeFantasia: "Cliente XYZ",
                cnpj: null,
              },
              cadence: null,
            },
          },
        ],
        totalCount: 1,
      },
    }),
    OrderItemCompanyFactories: () => ({ companyFactories: { edges: [] } }),
    OrderItemProducts: () => ({ products: { edges: [] } }),
    OrderItemTiers: () => ({ priceTiers: { edges: [] } }),
    OrderItemPriceLists: () => ({ factoryPriceLists: { edges: [] } }),
    OrderItemPriceListItems: () => ({ priceListItems: { edges: [] } }),
    CreateOrder: () => ({
      createOrder: {
        status: true,
        code: 200,
        message: "ok",
        data: {
          id: "order-2",
          orderDate: "2026-09-25",
          invoicedAt: null,
          totalAmount: "0",
          commissionAmount: "0",
          status: "CONFIRMED",
          seller: { id: "seller-1", name: "Vendedor A" },
          client: {
            id: "client-1",
            razaoSocial: "Cliente LTDA",
            nomeFantasia: "Cliente XYZ",
          },
          factory: {
            id: "factory-1",
            nomeFantasia: "Fábrica Modelo",
            nickname: null,
            razaoSocial: "Fabrica LTDA",
          },
        },
      },
    }),
  });

  await page.goto(
    "/orders/new?factoryId=factory-1&from=/factories/cf-1/orders"
  );

  // A volta leva para a aba da fábrica, não para a lista geral.
  await expect(
    page.getByRole("link", { name: "Fábrica", exact: true })
  ).toHaveAttribute("href", "/factories/cf-1/orders");
  await expect(page.getByRole("textbox", { name: "Fábrica" })).toHaveCount(0);

  await pickOption(
    page,
    "Vendedor → Cliente",
    "Cliente",
    "Vendedor A → Cliente XYZ"
  );
  await page
    .getByRole("textbox", { name: "Data do pedido" })
    .click({ force: true });
  await page.getByRole("button", { name: "Hoje" }).click();
  await page.getByRole("button", { name: "Criar pedido", exact: true }).click();

  await expect(page).toHaveURL(/\/orders\/order-2$/);
  const createVars = await gql.waitForCall("CreateOrder");
  expect(createVars.input).toMatchObject({
    sellerId: "seller-1",
    clientId: "client-1",
    factoryId: "factory-1",
  });
});

/**
 * Guarda de saída: com algo feito e não gravado (dados, itens), sair da página
 * pergunta antes — por link e pelo botão Voltar do navegador. É a interação com
 * o roteador do Next (sentinela no histórico) que só o navegador de verdade
 * prova.
 */
test("orders/new: sair com algo não gravado pergunta antes (dados, item, itens)", async ({
  page,
}) => {
  await mockGraphql(page, {
    Orders: () => ({
      orders_list: {
        edges: [],
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: 0,
      },
    }),
    OrderStats: () => ({
      orderStats: {
        totalOrders: 0,
        totalAmount: "0",
        avgTicket: "0",
        invoicedOrders: 0,
        invoicedAmount: "0",
        commissionAmount: "0",
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
      sellerClientFactoryList: { totalCount: 0, edges: [] },
    }),
    OrderItemCompanyFactories: () => ({
      companyFactories: {
        edges: [
          {
            node: {
              id: "cf-1",
              factoryId: "factory-1",
              ipiInOrder: false,
              freeFreightCifAmount: null,
            },
          },
        ],
      },
    }),
    // Com a fábrica resolvida, as condições e o nível do vínculo também são
    // consultados — sem resposta bem-formada o Apollo repete em loop.
    OrderPaymentTerms: () => ({ factoryPaymentTerms: { edges: [] } }),
    OrderItemLinkedTier: () => ({ sellerClientFactoryList: { edges: [] } }),
    OrderItemPriceLists: () => ({ factoryPriceLists: { edges: [] } }),
    OrderItemPriceListItems: () => ({ priceListItems: { edges: [] } }),
    OrderItemTiers: () => ({ priceTiers: { edges: [] } }),
    OrderItemProductOptions: () => ({
      products: {
        edges: [
          {
            node: {
              id: "p-1",
              name: "Produto X",
              sku: "SKU-1",
              imageUrl: null,
            },
          },
        ],
      },
    }),
    OrderItemProducts: () => ({
      products: {
        edges: [
          {
            node: {
              id: "p-1",
              name: "Produto X",
              sku: "SKU-1",
              imageUrl: null,
              saleMultiple: null,
              unitPerPack: "1.0000",
              unit: { id: "ul-1", label: "CX" },
              taxes: [],
            },
          },
        ],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    }),
  });

  const leaveDialog = page.getByRole("dialog", {
    name: "Sair sem criar o pedido?",
  });

  // Entra pela lista: é para ela que o Voltar tem de levar no fim.
  await page.goto("/orders");
  await page.getByRole("button", { name: "Novo pedido" }).click();
  await expect(page).toHaveURL(/\/orders\/new$/);

  // 0) Página intocada: sair é livre, sem pergunta.
  await page
    .getByRole("link", { name: "Pedidos", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/orders$/);
  await expect(leaveDialog).toHaveCount(0);
  await page.getByRole("button", { name: "Novo pedido" }).click();
  await expect(page).toHaveURL(/\/orders\/new$/);

  // 1) Só os dados mexidos (nenhum item ainda) já contam: Voltar pergunta.
  await pickOption(page, "Fábrica", "Fábrica", "Fábrica Modelo");
  await page.goBack();
  await expect(leaveDialog).toBeVisible();
  await leaveDialog
    .getByRole("button", { name: "Continuar no pedido" })
    .click();
  await expect(page).toHaveURL(/\/orders\/new$/);

  // Um item no rascunho (sem nível e sem tabela: o preço é digitado).
  const produto = page.getByRole("textbox", {
    name: "Produto (nome ou código)",
  });
  await produto.click();
  await produto.pressSequentially("Produto X");
  await page
    .locator("[data-select-dropdown]")
    .getByText("SKU-1 — Produto X", { exact: true })
    .click();
  await page.getByRole("textbox", { name: /Preço por/ }).fill("1000");
  await page.getByRole("spinbutton", { name: "Quantidade" }).fill("10");
  await page.getByRole("button", { name: "Adicionar item" }).click();
  await expect(
    page.getByRole("button", { name: "Criar pedido com 1 item" })
  ).toBeVisible();

  // 2) Link (o caminho do topo): pergunta, e "continuar" fica com o rascunho.
  await page
    .getByRole("link", { name: "Pedidos", exact: true })
    .first()
    .click();
  await expect(leaveDialog).toBeVisible();
  await leaveDialog
    .getByRole("button", { name: "Continuar no pedido" })
    .click();
  await expect(leaveDialog).toBeHidden();
  await expect(page).toHaveURL(/\/orders\/new$/);
  await expect(page.getByText("Produto X")).toBeVisible();

  // 3) Voltar do navegador: pergunta; confirmado, volta para a lista.
  await page.goBack();
  await expect(leaveDialog).toBeVisible();
  await expect(page).toHaveURL(/\/orders\/new$/);
  await leaveDialog.getByRole("button", { name: "Sair e descartar" }).click();
  await expect(page).toHaveURL(/\/orders$/);
});
