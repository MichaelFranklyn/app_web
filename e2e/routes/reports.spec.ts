import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";
import { grantRole } from "../support/role";

/**
 * As cinco abas de relatório (/dashboard/reports).
 *
 * O que estes testes prendem, além de "a tela monta": que cada aba consulta o
 * RECORTE certo (a de vendas pela data de faturamento, a de pedidos enviados pela
 * data do pedido) e que o período e o vendedor escolhidos sobrevivem à troca de
 * aba — é o que faz a área ser um bloco de trabalho e não cinco telas soltas.
 */

const orderNode = (overrides: Record<string, unknown> = {}) => ({
  id: "order-1",
  orderDate: "2026-07-05",
  invoicedAt: "2026-07-12",
  totalAmount: "4820.00",
  commissionAmount: "144.60",
  status: "INVOICED",
  isDeliveryOverdue: false,
  seller: { id: "seller-1", name: "Rafael Vendas" },
  client: {
    id: "client-1",
    razaoSocial: "CASA DO SONO LTDA",
    nomeFantasia: "Casa do Sono",
  },
  factory: {
    id: "factory-1",
    razaoSocial: "INDUSTRIA HERC LTDA",
    nomeFantasia: "Herc",
    nickname: null,
  },
  ...overrides,
});

const connection = (nodes: Record<string, unknown>[]) => ({
  edges: nodes.map((node) => ({ node, cursor: "c" })),
  pageInfo: { hasNextPage: false, endCursor: null },
  totalCount: nodes.length,
});

const orderStats = (overrides: Record<string, unknown> = {}) => ({
  totalOrders: 1,
  totalAmount: "4820.00",
  avgTicket: "4820.00",
  invoicedOrders: 1,
  invoicedAmount: "4820.00",
  commissionAmount: "144.60",
  ...overrides,
});

const sellers = () => ({
  edges: [{ node: { id: "seller-1", name: "Rafael Vendas" } }],
});

test("vendas: KPIs, linhas e recorte pela data de faturamento", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    DashboardSellers: () => ({ dashboard_sellers: sellers() }),
    SalesReportOrders: () => ({
      sales_report_orders: connection([orderNode()]),
    }),
    SalesReportStats: () => ({ sales_report_stats: orderStats() }),
    InvoicedRevenueByFactory: () => ({
      invoicedRevenueByFactory: [
        {
          entityId: "factory-1",
          entityName: "Herc",
          total: "4820.00",
          orderCount: 1,
          commissionAmount: "144.60",
        },
      ],
    }),
  });

  await page.goto("/dashboard/reports/sales");

  await expect(
    page.getByRole("heading", { name: "Relatórios", level: 1 })
  ).toBeVisible();
  await expect(page.getByText("Pedidos faturados").first()).toBeVisible();
  await expect(page.getByText("CASA DO SONO LTDA")).toBeVisible();

  // O recorte é o que separa este relatório do de pedidos enviados.
  const variables = await spy.waitForCall("SalesReportOrders");
  const sent = JSON.stringify(variables);
  expect(sent).toContain("invoiced_at");
  expect(sent).toContain("status_in");
  expect(sent).not.toContain("order_date");
});

test("pedidos enviados: recorta pela data do pedido e mostra o que espera faturamento", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    DashboardSellers: () => ({ dashboard_sellers: sellers() }),
    SentOrdersReport: () => ({
      sent_orders_report: connection([
        orderNode({ invoicedAt: null, status: "CONFIRMED" }),
      ]),
    }),
    SentOrdersReportStats: () => ({
      sent_orders_report_stats: orderStats({
        invoicedOrders: 0,
        invoicedAmount: "0",
      }),
    }),
    PlacedOrdersByFactory: () => ({
      placedOrdersByFactory: [
        {
          entityId: "factory-1",
          entityName: "Herc",
          orderCount: 1,
          total: "4820.00",
          invoicedCount: 0,
          invoicedAmount: "0",
        },
      ],
    }),
  });

  await page.goto("/dashboard/reports/sent-orders");

  await expect(
    page.getByText("Pedidos colocados na fábrica").first()
  ).toBeVisible();
  // Pedido sem faturamento aparece como "Aguardando", não como um traço: é a
  // linha que o relatório existe para apontar.
  await expect(page.getByText("Aguardando").first()).toBeVisible();

  const variables = await spy.waitForCall("SentOrdersReport");
  const sent = JSON.stringify(variables);
  expect(sent).toContain("order_date");
  expect(sent).toContain("status_in");
  expect(sent).not.toContain("invoiced_at");
});

test("comissões: recorta as parcelas pelo período em que a comissão cai", async ({
  page,
}) => {
  await mockGraphql(page, {
    DashboardSellers: () => ({ dashboard_sellers: sellers() }),
    CommissionsReport: () => ({
      commissions_report: {
        totalReceivable: "144.60",
        totalReceived: "0",
        totalPending: "0",
        countReceivable: 1,
        rows: [
          {
            orderId: "order-1",
            installmentId: "inst-1",
            sequence: 1,
            orderDate: "2026-06-10",
            invoicedAt: "2026-06-20",
            invoiceNumber: "12345",
            dueDate: "2026-07-20",
            paidAt: null,
            installmentAmount: "4820.00",
            amount: "144.60",
            status: "receivable",
            // Dentro do mês corrente do E2E? Não: a data é fixa, então o teste
            // navega com o período explícito na URL.
            receiveDate: "2026-07-20",
            isReceivable: true,
            isReceived: false,
            isReconciled: false,
            reconciledAt: null,
            client: {
              id: "client-1",
              razaoSocial: "CASA DO SONO LTDA",
              nomeFantasia: "Casa do Sono",
            },
            factory: {
              id: "factory-1",
              nomeFantasia: "Herc",
              nickname: null,
              razaoSocial: "INDUSTRIA HERC LTDA",
            },
            seller: { id: "seller-1", name: "Rafael Vendas" },
          },
        ],
      },
    }),
  });

  await page.goto(
    "/dashboard/reports/commissions?from=2026-07-01&to=2026-07-31"
  );

  await expect(page.getByText("Parcelas de comissão").first()).toBeVisible();
  await expect(page.getByText("CASA DO SONO LTDA")).toBeVisible();

  // Fora do período, a mesma parcela não pode aparecer.
  await page.goto(
    "/dashboard/reports/commissions?from=2026-09-01&to=2026-09-30"
  );
  await expect(
    page.getByRole("heading", { name: "Nenhuma comissão no período" })
  ).toBeVisible();
  await expect(page.getByText("CASA DO SONO LTDA")).toHaveCount(0);
});

test("positivação: matriz cliente × fábrica e o recorte de zerados", async ({
  page,
}) => {
  await mockGraphql(page, {
    DashboardSellers: () => ({ dashboard_sellers: sellers() }),
    PositivationReport: () => ({
      positivationReport: {
        walletClients: 2,
        positivatedClients: 1,
        clientPositivationRate: 0.5,
        linkedPairs: 3,
        positivatedPairs: 1,
        pairPositivationRate: 0.3333,
        totalAmount: "4820.00",
        factories: [
          {
            factoryId: "factory-1",
            factoryName: "Herc",
            linkedClients: 2,
            positivatedClients: 1,
            positivationRate: 0.5,
            totalAmount: "4820.00",
          },
        ],
        rows: [
          {
            clientId: "client-1",
            companyClientId: "cc-1",
            clientName: "CASA DO SONO",
            sellerId: "seller-1",
            sellerName: "Rafael Vendas",
            linkedFactories: 1,
            positivatedFactories: 1,
            orderCount: 2,
            totalAmount: "4820.00",
            lastOrderDate: "2026-07-21",
            cells: [
              {
                factoryId: "factory-1",
                factoryName: "Herc",
                isLinked: true,
                isPositivated: true,
                orderCount: 2,
                totalAmount: "4820.00",
                lastOrderDate: "2026-07-21",
              },
            ],
          },
          {
            clientId: "client-2",
            companyClientId: "cc-2",
            clientName: "MOVEIS NORTE",
            sellerId: "seller-1",
            sellerName: "Rafael Vendas",
            linkedFactories: 1,
            positivatedFactories: 0,
            orderCount: 0,
            totalAmount: "0",
            lastOrderDate: null,
            cells: [
              {
                factoryId: "factory-1",
                factoryName: "Herc",
                isLinked: true,
                isPositivated: false,
                orderCount: 0,
                totalAmount: "0",
                lastOrderDate: null,
              },
            ],
          },
        ],
      },
    }),
  });

  await page.goto("/dashboard/reports/positivation");

  await expect(page.getByText("Cliente × fábrica").first()).toBeVisible();
  await expect(page.getByText("CASA DO SONO")).toBeVisible();
  await expect(page.getByText("MOVEIS NORTE")).toBeVisible();

  // O recorte que faz o relatório valer: só quem não comprou nada. Virou campo
  // do painel de filtros (antes eram abas), para poder se combinar com fábrica
  // e vendedor.
  await page.getByRole("button", { name: "Filtros" }).click();
  const positivacao = page
    .locator("[data-filters-panel]")
    .getByPlaceholder("Positivaram ou não");
  await positivacao.click();
  await page
    .locator("[data-select-dropdown]")
    .getByText("Zerados (não compraram)", { exact: true })
    .click();

  await expect(page).toHaveURL(/positivated=no/);
  await expect(page.getByText("MOVEIS NORTE")).toBeVisible();
  await expect(page.getByText("CASA DO SONO")).toHaveCount(0);
});

test("clientes: a carteira lista quem nunca comprou", async ({ page }) => {
  await mockGraphql(page, {
    DashboardSellers: () => ({ dashboard_sellers: sellers() }),
    ClientsReport: () => ({
      clients_report: connection([
        {
          id: "client-2",
          cnpj: "12345678000199",
          razaoSocial: "MOVEIS NORTE LTDA",
          nomeFantasia: "Móveis Norte",
          addressCity: "Salvador",
          addressState: "BA",
          isNeedsAttention: false,
          companyClient: {
            id: "cc-2",
            visitScoreTotal: "71.2",
            lastOrderDate: null,
            lastVisitDate: null,
            network: null,
            segment: null,
            sellers: [{ id: "seller-1", name: "Rafael Vendas" }],
          },
        },
      ]),
    }),
    ClientsReportStats: () => ({
      clients_report_stats: {
        totalClients: 1,
        activeClients: 0,
        atRiskClients: 1,
        noVisit30d: 1,
      },
    }),
    ClientsReportAtRisk: () => ({ clientsAtRisk: [] }),
  });

  await page.goto("/dashboard/reports/clients");

  await expect(page.getByText("Carteira de clientes").first()).toBeVisible();
  await expect(page.getByText("Móveis Norte")).toBeVisible();
  // "nunca comprou" em vez de "0 dias": zero seria lido como "comprou hoje".
  await expect(page.getByText("nunca comprou")).toBeVisible();
});

test("o recorte sobrevive à troca de aba", async ({ page }) => {
  const spy = await mockGraphql(page, {
    DashboardSellers: () => ({ dashboard_sellers: sellers() }),
    SalesReportOrders: () => ({ sales_report_orders: emptyConnection() }),
    SalesReportStats: () => ({ sales_report_stats: orderStats() }),
    InvoicedRevenueByFactory: () => ({ invoicedRevenueByFactory: [] }),
    SentOrdersReport: () => ({ sent_orders_report: emptyConnection() }),
    SentOrdersReportStats: () => ({ sent_orders_report_stats: orderStats() }),
    PlacedOrdersByFactory: () => ({ placedOrdersByFactory: [] }),
  });

  await page.goto(
    "/dashboard/reports/sales?from=2026-05-01&to=2026-05-31&seller=seller-1"
  );
  await expect(page.getByText("Pedidos faturados").first()).toBeVisible();

  // Quem filtrou maio de um vendedor e clica na aba seguinte espera continuar em
  // maio daquele vendedor — não recomeçar do mês corrente.
  await page.getByRole("link", { name: "Pedidos enviados" }).click();

  await expect(page).toHaveURL(/from=2026-05-01/);
  await expect(page).toHaveURL(/seller=seller-1/);

  const variables = await spy.waitForCall("SentOrdersReport");
  const sent = JSON.stringify(variables);
  expect(sent).toContain("2026-05-01");
  expect(sent).toContain("seller-1");
});

/**
 * Regressão de 13/08/2026: a tela inteira caía no error boundary quando a
 * resposta da lista de vendedores chegava SEM o campo — `data?.x.edges` protegia
 * só o primeiro nível, e o throw dentro do `useMemo` derrubava o render antes de
 * o toast de erro ter chance de aparecer.
 *
 * O CI pegou por acaso (o mock vazio devolve `{}` e a corrida entre a query e a
 * asserção decidia o resultado), mas o caso é real: erro parcial do GraphQL
 * devolve `data` preenchido e o campo nulo. O relatório precisa ficar de pé sem
 * a lista, não sumir.
 */
test("relatórios: resposta sem a lista de vendedores não derruba a tela", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    // Exatamente o que um erro parcial produz: a chave existe, o campo não.
    DashboardSellers: () => ({}),
  });
  // OWNER é quem pode escolher vendedor — é esse papel que faz a toolbar
  // disparar a consulta (`skip: !canSelectSeller`).
  await grantRole(page, "OWNER");

  await page.goto("/dashboard/reports/sales");

  // Esperar a resposta RUIM chegar é o que torna o teste determinístico: o
  // heading vem do SSR e já está na tela, então asserir direto venceria a
  // corrida contra o re-render que quebrava — foi assim que o bug passou no CI
  // rápido e falhou no lento.
  await spy.waitForCall("DashboardSellers");

  await page.waitForLoadState("networkidle");

  // Só depois do re-render é que a asserção significa alguma coisa: o heading
  // vive dentro do `main`, que é justamente o que o error boundary substitui.
  await expect(page.getByRole("heading", { name: "Relatórios" })).toBeVisible();
  await expect(
    page.getByText("Não foi possível carregar esta página")
  ).toHaveCount(0);
});
