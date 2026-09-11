/**
 * Dados mínimos por rota para as telas montarem DE VERDADE.
 *
 * Existe para a guarda de responsividade: medir overflow numa tela que caiu em
 * "não foi possível carregar" passa sempre, e foi assim que as páginas novas
 * ficaram fora do radar. Cada entrada traz uma linha de conteúdo — é com dado
 * na tela que coluna larga, KPI e cabeçalho cheio aparecem.
 *
 * Os shapes seguem os dos specs de cada área; o que muda aqui é o volume (o
 * suficiente para renderizar, não para exercitar regra de negócio).
 */
import { getTodayIso } from "@/utils/format/date";

import { orderDetailData } from "./graphql";

/**
 * Datas ancoradas no MÊS CORRENTE.
 *
 * A tela de comissões filtra as linhas pelo mês que está aberto — e ela abre no
 * mês de hoje. Com datas fixas (julho/agosto de 2026, como estava aqui), a
 * linha caía fora do recorte, os cartões zeravam e a tela mostrava "Nenhuma
 * comissão": o mock envelhecia sozinho com a passagem do tempo, sem ninguém
 * mexer nele. Ancorado em `getTodayIso`, o dado entra no mês qualquer dia que
 * a suíte rode.
 */
const noMesCorrente = (dia: number): string =>
  `${getTodayIso().slice(0, 7)}-${String(dia).padStart(2, "0")}`;

type Handlers = Record<string, () => unknown>;

const conn = (nodes: Record<string, unknown>[]) => ({
  edges: nodes.map((node) => ({ node, cursor: "c" })),
  pageInfo: { hasNextPage: false, endCursor: null },
  totalCount: nodes.length,
});

const sellers = () => ({
  edges: [{ node: { id: "seller-1", name: "Rafael Vendas", isActive: true } }],
  totalCount: 1,
});

const factoryRef = {
  id: "factory-1",
  nomeFantasia: "Herc",
  nickname: null,
  razaoSocial: "INDUSTRIA HERC LTDA",
};

const clientRef = {
  id: "client-1",
  razaoSocial: "CASA DO SONO COLCHOES E ESTOFADOS LTDA",
  nomeFantasia: "Casa do Sono",
};

/** Uma linha de comissão (a tabela mais larga do app). */
const commissionRow = () => ({
  orderId: "order-1",
  installmentId: "inst-1",
  sequence: 1,
  orderDate: noMesCorrente(2),
  invoicedAt: noMesCorrente(4),
  invoiceNumber: "12345",
  dueDate: noMesCorrente(9),
  paidAt: null,
  installmentAmount: "12500.00",
  amount: "625.00",
  status: "receivable",
  receiveDate: noMesCorrente(9),
  isReceivable: true,
  isReceived: false,
  isReconciled: false,
  reconciledAt: null,
  isOverdue: false,
  defaultedAt: null,
  isChargebackSettled: false,
  chargebackSettledAt: null,
  sellerAmount: "312.50",
  sellerStatus: "receivable",
  sellerReceiveDate: noMesCorrente(9),
  isSellerPaid: false,
  sellerChargebackMonth: null,
  isSellerChargebackSettled: false,
  sellerChargebackSettledAt: null,
  client: clientRef,
  factory: factoryRef,
  seller: { id: "seller-1", name: "Rafael Vendas" },
});

const commissions = () => ({
  commissions: {
    latestReceiveDate: null,
    totalReceivable: "625.00",
    totalReceived: "0",
    totalPending: "0",
    countReceivable: 1,
    totalChargeback: "0",
    totalSellerChargeback: "0",
    totalSellerChargebackPending: "0",
    totalRefund: "0",
    totalSellerRefund: "0",
    countOverdue: 0,
    rows: [commissionRow()],
  },
});

const billingInstallment = () => ({
  installmentId: "inst-1",
  orderId: "order-1",
  sequence: 1,
  clientId: "client-1",
  clientName: clientRef.razaoSocial,
  factoryId: "factory-1",
  factoryName: "Herc",
  sellerId: "seller-1",
  sellerName: "Rafael Vendas",
  invoiceNumber: "12345",
  invoicedAt: "2026-07-10",
  dueDate: "2026-08-09",
  amount: "12500.00",
  paidAt: null,
  isOverdue: false,
  daysOverdue: 0,
  status: "PENDING",
});

const reportSellers = {
  DashboardSellers: () => ({ dashboard_sellers: sellers() }),
};

/** Cliente completo — o layout resolve o vínculo e o cliente aninhado. */
const clientData = () => ({
  id: "client-1",
  cnpj: "11222333000181",
  razaoSocial: "CASA DO SONO COLCHOES E ESTOFADOS LTDA",
  nomeFantasia: "Casa do Sono",
  cnae: "4744-0/99",
  cnaeDescription: "Comércio varejista de materiais de construção em geral",
  addressStreet: "Avenida Presidente Getúlio Vargas",
  addressNumber: "1500",
  addressComplement: "Galpão 3",
  addressNeighborhood: "Centro Industrial",
  addressZip: "40000-000",
  addressCity: "Salvador",
  addressState: "BA",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
  companyClient: { id: "cc-1", notes: null, isActive: true },
});

/** Casca do cliente: o que TODA aba de /clients/[id] dispara ao montar. */
const clientShell: Handlers = {
  CompanyClient: () => ({
    companyClient: {
      status: true,
      code: 200,
      message: "ok",
      data: { id: "cc-1", notes: null, isActive: true, client: clientData() },
    },
  }),
  Client: () => ({
    client: { status: true, code: 200, message: "ok", data: clientData() },
  }),
  SellerClientFactoriesByClient: () => ({
    sellerClientFactoryList: conn([]),
  }),
};

const orderItem = () => ({
  id: "oi-1",
  quantity: 120,
  unitsTotal: 120,
  unitPrice: "1250.00",
  discount: "0",
  subtotal: "150000.00",
  avgShelfDays: null,
  source: "MANUAL",
  ipiRate: null,
  ipiAmount: null,
  taxAmount: null,
  unitPriceWithTax: null,
  isPromo: false,
  createdAt: "2026-07-02T10:00:00Z",
  product: {
    id: "p-1",
    name: "Colchão Ortopédico Premium Queen 158x198",
    sku: "CLH-QUEEN-158",
    imageUrl: null,
    saleMultiple: null,
  },
  tier: { id: "t-1", name: "Varejo" },
});

/** Rota → handlers. As rotas de detalhe usam os ids que o stub já conhece. */
export const PAGE_DATA: Record<string, Handlers> = {
  "/commissions": {
    ...reportSellers,
    Commissions: commissions,
    CommissionsSellers: () => ({ commissions_sellers: sellers() }),
    CommissionsFactories: () => ({
      commissions_factories: conn([
        {
          id: "cf-1",
          factoryId: "factory-1",
          nickname: null,
          factory: factoryRef,
        },
      ]),
    }),
  },

  "/goals": {
    GoalsSellers: () => ({ goals_sellers: sellers() }),
    GoalsFactories: () => ({ goals_factories: conn([]) }),
    SellerGoals: () => ({
      sellerGoals: {
        rows: [
          {
            goalId: "goal-1",
            sellerId: "seller-1",
            factoryId: "factory-1",
            periodMonth: "2026-09-01",
            seller: { id: "seller-1", name: "Rafael Vendas" },
            factory: factoryRef,
            targetInvoicedAmount: "80000",
            targetOrderCount: 40,
            targetPositivation: 25,
            targetNewClients: 5,
            invoicedAmount: "52000",
            orderCount: 26,
            positivation: 18,
            newClients: 3,
          },
        ],
      },
    }),
  },

  // `data` é um OBJETO com `generatedAt` e `insights`, não a lista solta: a
  // tela lê `myInsights.data.insights` (ver a query MyInsights). Enquanto aqui
  // vinha o array direto, `data.insights` era undefined, a rota caía no estado
  // vazio ("Nada pendente") e a medição de largura olhava para um lugar onde
  // não havia cartão nenhum — justamente o que esta lista existe para evitar.
  "/insights": {
    MyInsights: () => ({
      myInsights: {
        status: true,
        message: "ok",
        data: {
          generatedAt: "2026-09-11T09:00:00Z",
          insights: [
            {
              kind: "CLIENT_OVERDUE",
              group: "WALLET",
              count: 23,
              blockedCount: 0,
              amount: null,
              daysLeft: null,
              samples: [
                {
                  id: "c-1",
                  label: "DECORE CASA & CONSTRUCAO LTDA ME",
                  detail: "348 dias sem comprar",
                  link: null,
                  reason: null,
                },
              ],
            },
          ],
        },
      },
    }),
    // Só o gestor pede esta; com o papel padrão (vendedor) ela é pulada. Fica
    // registrada para a rota não depender de quem está logado.
    InsightsSellers: () => ({
      insights_sellers: conn([
        { id: "seller-1", name: "Rafael Vendas", isActive: true },
      ]),
    }),
  },

  "/orders/order-1": {
    OrderDetail: () => ({
      order: {
        status: true,
        code: 200,
        message: "ok",
        data: orderDetailData(),
      },
    }),
    OrderItems: () => ({ orderItems: conn([orderItem()]) }),
  },

  "/clients/cc-1/overview": {
    ...clientShell,
    ClientContacts: () => ({
      clientContacts: conn([
        {
          id: "ct-1",
          name: "Maria de Souza Albuquerque",
          role: "Compradora",
          phone: "71988887777",
          email: "maria.albuquerque@casadosono.com.br",
          isPrimary: true,
          isActive: true,
        },
      ]),
    }),
  },

  "/clients/cc-1/orders": {
    ...clientShell,
    // Shape da CLIENT_FACTORY_ORDERS_QUERY: a fábrica vem aninhada (o cartão
    // resolve o nome por `factoryName(summary.factory)`) e a contagem é
    // `totalOrders`. Vinha aqui o formato antigo — `factoryName`/`orderCount`
    // soltos —, e o cartão desenhava a fábrica como "—" e a contagem vazia.
    ClientFactoryOrders: () => ({
      companyClient: {
        data: {
          id: "cc-1",
          factoryOrderSummaries: [
            {
              sellerClientFactoryId: "scf-1",
              sellerId: "seller-1",
              totalOrders: 4,
              totalAmount: "48200.00",
              lastOrderDate: "2026-07-02",
              // Nome longo de propósito: é com ele que a largura aperta, e o
              // `factoryRef` curto ("Herc") não exercitaria nada.
              factory: {
                id: "factory-1",
                nomeFantasia: "Industria Herc Colchoes",
                nickname: null,
                razaoSocial: "INDUSTRIA HERC COLCHOES LTDA",
              },
            },
          ],
        },
      },
    }),
  },

  "/factories/factory-1/contacts": {
    FactoryContacts: () => ({
      factoryContacts: conn([
        {
          id: "fc-1",
          name: "Central de Vendas Nordeste",
          role: "Televendas",
          phone: "11988887777",
          email: "pedidos@industriaherc.com.br",
          isPrimary: true,
          isActive: true,
        },
      ]),
    }),
  },

  "/factories/factory-1/payment-terms": {
    FactoryPaymentTerms: () => ({
      payment_terms: conn([
        {
          id: "pt-1",
          name: "30/60/90 com faturamento mínimo",
          installmentsDays: [30, 60, 90],
          minOrderAmount: "5000.00",
        },
      ]),
    }),
  },

  "/factories/factory-1/products": {
    ProductCategoriesOptions: () => ({
      productCategories: conn([
        { id: "cat-1", name: "Colchões de molas ensacadas" },
      ]),
    }),
    ProductUnitsOptions: () => ({
      productUnits: conn([{ id: "u-1", label: "Peça" }]),
    }),
    ProductUnitLabelsOptions: () => ({
      productUnitLabels: conn([{ id: "ul-1", label: "Fardo" }]),
    }),
    FactoryProducts: () => ({
      factory_products: conn([
        {
          id: "p-1",
          sku: "CLH-QUEEN-158-ORTOPEDICO",
          name: "Colchão Ortopédico Premium Queen 158x198x30",
          ncm: "9404.21.00",
          imageUrl: null,
          unitPerPack: 1,
          isActive: true,
          isNeedsAttention: true,
          attentionReason: "Preço sem nível definido",
          unitId: "u-1",
          unitLabelId: "ul-1",
          unit: { id: "u-1", label: "Peça" },
          unitLabel: { id: "ul-1", label: "Fardo" },
          category: { id: "cat-1", name: "Colchões de molas ensacadas" },
        },
      ]),
    }),
  },

  "/factories/factory-1/price-lists": {
    FactoryPriceLists: () => ({
      factory_price_lists: conn([
        {
          id: "pl-1",
          name: "Tabela Nordeste 2026 — vigência anual",
          region: "Nordeste",
          validFrom: "2026-01-01",
          validUntil: "2026-12-31",
          isActive: true,
          clonedFromId: null,
        },
      ]),
    }),
  },

  "/platform/companies": {
    PlatformTenants: () => ({
      platform_tenants: conn([
        {
          id: "t-1",
          cnpj: "11222333000181",
          razaoSocial: "REPRESENTACOES COMERCIAIS NORDESTE LTDA ME",
          nomeFantasia: "Representações Nordeste",
          segment: "Móveis e colchões",
          plan: "PRO",
          logoUrl: null,
          isActive: true,
          suspendedAt: null,
          suspensionReason: null,
          trialEndsAt: null,
          createdAt: "2026-01-15T00:00:00Z",
          usersCount: 12,
          sellersCount: 8,
          clientsCount: 340,
          factoriesCount: 6,
          ordersCount: 1280,
          ordersInPeriod: 96,
          gmvInPeriod: "840500.00",
          lastLoginAt: "2026-09-09T18:00:00Z",
          lastOrderDate: "2026-09-09",
        },
      ]),
    }),
  },

  "/dashboard/reports/billing": {
    ...reportSellers,
    BillingReport: () => ({
      billingReport: {
        rows: [billingInstallment()],
        installmentCount: 1,
        orderCount: 1,
        totalAmount: "12500.00",
        paidAmount: "0",
        openAmount: "12500.00",
        overdueAmount: "0",
        overdueCount: 0,
      },
    }),
  },

  "/dashboard/reports/factories": {
    ...reportSellers,
    FactoryOrdersReport: () => ({
      factoryOrdersReport: [
        {
          entityId: "factory-1",
          entityName: "Industria Herc Colchoes",
          orderCount: 10,
          totalAmount: "48200.00",
          invoicedCount: 8,
          invoicedAmount: "40100.00",
          avgTicket: "4820.00",
          clientCount: 6,
          commissionAmount: "2410.00",
        },
      ],
    }),
  },

  "/dashboard/reports/wallet": {
    ...reportSellers,
    WalletStatusReport: () => ({
      walletStatusReport: {
        rows: [
          {
            clientId: "client-1",
            companyClientId: "cc-1",
            clientName: "MÓVEIS NORTE COMERCIO DE MOVEIS LTDA ME",
            city: "Salvador",
            state: "BA",
            situation: "AT_RISK",
            lastOrderDate: "2026-05-01",
            daysSinceLastOrder: 96,
            avgIntervalDays: 60,
            riskRatio: 1.6,
            orderCount: 4,
            periodOrderCount: 0,
            periodAmount: "0",
          },
        ],
        totalClients: 1,
        activeClients: 0,
        atRiskClients: 1,
        inactiveClients: 0,
        neverBoughtClients: 0,
        newClients: 0,
        periodAmount: "0",
      },
    }),
  },

  "/dashboard/reports/abc": {
    ...reportSellers,
    ClientAbcCurve: () => ({
      clientAbcCurve: [
        {
          clientId: "client-1",
          clientName: "TENDTUDO VALERIA MATERIAIS DE CONSTRUCAO LTDA",
          rank: 1,
          totalAmount: "80000.00",
          orderCount: 12,
          commissionAmount: "2400.00",
          share: 0.8,
          cumulativeShare: 0.8,
          abcClass: "A",
          lastOrderDate: "2026-07-18",
        },
      ],
    }),
  },

  "/dashboard/reports/positivation": {
    ...reportSellers,
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
            factoryName: "Industria Herc Colchoes",
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
            clientName: "CASA DO SONO COLCHOES E ESTOFADOS LTDA",
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
                factoryName: "Industria Herc Colchoes",
                isLinked: true,
                isPositivated: true,
                orderCount: 2,
                totalAmount: "4820.00",
                lastOrderDate: "2026-07-21",
              },
            ],
          },
        ],
      },
    }),
  },

  "/dashboard/reports/purchases": {
    ...reportSellers,
    ClientFactoryPurchasesReport: () => ({
      clientFactoryPurchasesReport: {
        rows: [
          {
            companyClientId: "cc-1",
            clientName: clientRef.razaoSocial,
            factoryId: "factory-1",
            factoryName: "Herc",
            sellerName: "Rafael Vendas",
            lastOrderDate: "2026-07-02",
            daysSinceLastOrder: 70,
            orderCount: 5,
            totalAmount: "24000.00",
            avgIntervalDays: 45,
          },
        ],
        clientCount: 1,
        factoryCount: 1,
      },
    }),
  },
};

/** Texto que só aparece com a tela montada (evita medir uma tela de erro). */
export const PAGE_READY: Record<string, RegExp> = {
  // Texto de CONTEÚDO, não de moldura: "Resumo de setembro", "Metas de
  // setembro" e o próprio "Insights" são desenhados com ou sem dado, então
  // casavam numa tela vazia e deixavam a medição passar no lugar errado — foi
  // assim que o shape velho do /insights ficou meses sem ninguém notar.
  "/commissions": /Industria Herc Colchoes|Herc/i,
  "/goals": /Rafael Vendas/i,
  "/insights": /348 dias sem comprar/i,
  "/orders/order-1": /Colchão Ortopédico Premium/i,
  "/clients/cc-1/overview": /Casa do Sono/i,
  "/clients/cc-1/orders": /Industria Herc Colchoes/i,
  "/factories/factory-1/contacts": /Central de Vendas Nordeste/i,
  "/factories/factory-1/payment-terms": /30\/60\/90/i,
  "/factories/factory-1/products": /Colchão Ortopédico Premium/i,
  "/factories/factory-1/price-lists": /Tabela Nordeste 2026/i,
  "/platform/companies": /Representações Nordeste/i,
  "/dashboard/reports/billing": /12\.500/,
  "/dashboard/reports/factories": /Industria Herc Colchoes/i,
  "/dashboard/reports/wallet": /MÓVEIS NORTE/i,
  "/dashboard/reports/abc": /TENDTUDO VALERIA/i,
  "/dashboard/reports/positivation": /Industria Herc Colchoes/i,
  "/dashboard/reports/purchases": /Casa do Sono|CASA DO SONO/i,
};
