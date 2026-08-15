import { createServer, type Server } from "node:http";
import { emptyConnection, FAKE_JWT, loginSuccess } from "./graphql";

/**
 * Stub GraphQL mínimo para satisfazer as queries SERVER-SIDE do Next
 * (executeServerQueries em clients/page.tsx e sellers/page.tsx). O `page.route`
 * do Playwright só intercepta requisições do browser; chamadas feitas pelo
 * servidor Next ao backend escapam dele e quebrariam o SSR sem este stub.
 *
 * As chamadas do browser continuam controladas por `mockGraphql` em cada teste;
 * este servidor responde apenas ao que o servidor Next busca ao renderizar.
 */
const SSR_RESPONSES: Record<string, unknown> = {
  // Listas de topo agora buscam a 1ª página no SERVIDOR (SSR-seed do useTableData,
  // ver [[project_ssr_list_apollo_cache_seed]]). O stub devolve connection VAZIO:
  // o seed só semeia com linhas de verdade, então com vazio o cliente busca e os
  // mocks de browser (page.route) assumem — o comportamento que os specs esperam.
  Users: { users_list: emptyConnection() },
  Sellers: { sellers_list: emptyConnection() },
  Clients: { clients_list: emptyConnection() },
  CompanyFactories: { company_factories_list: emptyConnection() },
  Orders: { orders_list: emptyConnection() },

  // O DETALHE do pedido também busca no servidor (detalhe + itens em paralelo,
  // para o cliente não encadear uma query depois da outra). Mesma ideia das
  // listas: vazio aqui, e o `page.route` de cada spec continua mandando no que
  // a tela mostra.
  OrderDetail: {
    order: { status: true, code: 200, message: "ok", data: null },
  },
  OrderItems: { orderItems: emptyConnection() },

  // Auth via BFF: login/change-password agora rodam a mutation no SERVIDOR
  // (rota /api/session), fora do alcance do page.route do browser — então o stub
  // precisa respondê-las como qualquer fetch SSR do Next.
  Login: loginSuccess(),
  ResetPassword: {
    resetPassword: {
      status: true,
      code: 200,
      message: "ok",
      data: {
        accessToken: FAKE_JWT,
        refreshToken: FAKE_JWT,
        userName: "Vendedor Teste",
        companyName: "Empresa Teste",
        role: "SELLER",
      },
    },
  },
  // Queries do SHELL (topbar/sidebar/tour). Não são SSR do Next: são do browser,
  // mas passam pelo BFF (/api/graphql), então chegam aqui em todo spec que não
  // as declara no mockGraphql — por ex. os specs do hub de /settings, que não
  // mockam nada porque a página é estática.
  MyUnreadNotificationsCount: {
    myUnreadNotificationsCount: { status: true, data: 0 },
  },
  // O plano da empresa é lido no SERVIDOR, no layout de `(inside)`: é ele que
  // decide quais itens a sidebar tem. Sem esta resposta, todo spec de tela
  // interna rodaria como se a empresa não tivesse contratado nada, e o menu
  // sairia sem Rotina, Comissões nem Metas.
  MyPlanFeatures: {
    myPlan: {
      status: true,
      code: 200,
      message: "ok",
      data: {
        code: "pro",
        label: "Pro",
        features: [
          "ROUTINES",
          "ANALYTICS",
          "REPORTS",
          "BULK_IMPORT",
          "GOALS",
          "COMMISSIONS",
          "NOTIFICATIONS",
        ],
      },
    },
  },
  // Portal do cliente: TODAS as telas são SSR (não há Apollo no navegador lá),
  // então cada query e a mutation do estoque precisam de resposta aqui — o
  // `page.route` do spec não alcança nenhuma delas.
  PortalProfile: {
    portalProfile: {
      status: true,
      code: 200,
      message: "ok",
      data: {
        clientName: "Loja do Cliente",
        clientCity: "Salvador",
        clientState: "BA",
        companyName: "Empresa Teste",
        companyLogoUrl: null,
      },
    },
  },
  PortalPurchases: {
    portalPurchaseSummary: {
      status: true,
      code: 200,
      message: "ok",
      data: {
        totalAmount: "5000.0000",
        orderCount: 2,
        averageTicket: "2500.0000",
        months: [
          { month: "2026-07-01", amount: "2000.0000", orderCount: 1 },
          { month: "2026-08-01", amount: "3000.0000", orderCount: 1 },
        ],
        factories: [
          { factoryName: "Fábrica Alfa", amount: "3000.0000", orderCount: 1 },
          { factoryName: "Fábrica Beta", amount: "2000.0000", orderCount: 1 },
        ],
      },
    },
    portalOrders: {
      totalCount: 1,
      pageInfo: { hasNextPage: false, hasPreviousPage: false },
      edges: [
        {
          node: {
            id: "order-portal-1",
            orderDate: "2026-08-01",
            factoryName: "Fábrica Alfa",
            totalAmount: "3000.0000",
            ipiAmount: "0.0000",
            status: "DELIVERED",
            invoicedAt: "2026-08-05",
            deliveredAt: "2026-08-10",
            estimatedDeliveryDate: null,
          },
        },
      ],
    },
  },
  PortalOrder: {
    portalOrder: {
      status: true,
      code: 200,
      message: "ok",
      data: {
        id: "order-portal-1",
        orderDate: "2026-08-01",
        factoryName: "Fábrica Alfa",
        totalAmount: "3000.0000",
        ipiAmount: "0.0000",
        status: "DELIVERED",
        invoicedAt: "2026-08-05",
        deliveredAt: "2026-08-10",
        estimatedDeliveryDate: null,
        paymentTermName: "30/60",
        items: [
          {
            id: "item-1",
            productName: "Torneira Teste",
            sku: "SKU-1",
            quantity: "12.0000",
            unitPrice: "250.0000",
            subtotal: "3000.0000",
            ipiAmount: "0.0000",
          },
        ],
        installments: [
          {
            sequence: 1,
            amount: "1500.0000",
            dueDate: "2026-09-05",
            status: "PENDING",
            paidAt: null,
          },
          {
            sequence: 2,
            amount: "1500.0000",
            dueDate: "2026-10-05",
            status: "PAID",
            paidAt: "2026-10-01",
          },
        ],
      },
    },
  },
  PortalStock: {
    portalStock: {
      status: true,
      code: 200,
      message: "ok",
      data: [
        {
          productId: "prod-1",
          productName: "Torneira Teste",
          sku: "SKU-1",
          factoryName: "Fábrica Alfa",
          lastPurchaseDate: "2026-08-01",
          estimatedStockoutDate: "2026-08-20",
          daysRemaining: 5,
          lastReportedAt: null,
        },
        {
          productId: "prod-2",
          productName: "Sifão Teste",
          sku: "SKU-2",
          factoryName: "Fábrica Beta",
          lastPurchaseDate: "2026-07-01",
          estimatedStockoutDate: null,
          daysRemaining: null,
          lastReportedAt: null,
        },
      ],
    },
  },
  SubmitPortalStock: {
    submitPortalStock: {
      status: true,
      code: 200,
      message: "Obrigado! Seu representante já vê essa informação.",
    },
  },
  CompanyBranding: {
    company_branding: {
      status: true,
      data: {
        id: "c-1",
        razaoSocial: "Empresa Teste LTDA",
        nomeFantasia: "Empresa Teste",
        logoUrl: null,
        avatarUrl: null,
      },
    },
  },
  userFlowLayout: {
    userFlowLayout: { status: true, code: 200, message: "ok", data: [] },
  },
  ClientStats: {
    clientStats: {
      totalClients: 0,
      activeClients: 0,
      atRiskClients: 0,
      noVisit30d: 0,
    },
  },
  sellersStats: {
    sellersStats: {
      totalCount: 0,
      activeCount: 0,
      activeFactoryAccessCount: 0,
      inactiveFactoryAccessCount: 0,
    },
  },
  // Detalhe da fábrica (factories/[id] é SSR). DataResponse: o executeServerQueries
  // extrai `.data`. Usado pelos testes de factories/[id]/* (Lote 3).
  CompanyFactoryDetail: {
    company_factory_detail: {
      status: true,
      message: "ok",
      data: {
        id: "cf-1",
        commissionRate: 10,
        commissionCalcBasis: "Faturado",
        paymentTermDays: 5,
        territory: "Sudeste",
        contractStart: null,
        contractEnd: null,
        specialConditions: null,
        factory: {
          id: "factory-1",
          cnpj: "11222333000181",
          razaoSocial: "Fábrica Detalhe LTDA",
          nomeFantasia: "Fábrica Detalhe",
          addressCity: "São Paulo",
          addressState: "SP",
          deletedAt: null,
        },
      },
    },
  },
};

// Operações SSR que chegaram sem resposta canned durante a suíte. O stub segue
// respondendo `{}` (não quebra o render), mas o globalSetup teardown FALHA a run
// inteira se este conjunto não estiver vazio — assim uma query SSR nova sem
// stub vira erro de CI em vez de passar silenciosamente. Módulo-nível: o mesmo
// processo do Playwright roda o stub, o setup e o teardown, então persiste.
const unhandledSsrOps = new Set<string>();

/** Operações SSR vistas sem resposta canned (para o teardown falhar a suíte). */
export function getUnhandledSsrOps(): string[] {
  return [...unhandledSsrOps];
}

let server: Server | undefined;

export function startStubBackend(port: number): Promise<void> {
  return new Promise((resolve) => {
    server = createServer((req, res) => {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        let operationName = "";
        try {
          operationName = JSON.parse(body || "{}").operationName ?? "";
        } catch {
          // corpo não-JSON: responde data vazio
        }
        // Uma operação SSR nova sem resposta canned cairia no `{}` e renderizaria
        // a página com dados vazios — passando o teste por acidente e mascarando
        // a quebra. Responder um erro aqui não basta: a página SSR degrada com
        // gracia (o `unstable_cache` engole o erro e o teste ainda passa). Então
        // REGISTRAMOS a operação e o teardown do globalSetup FALHA a run inteira
        // se algo ficou sem stub — vira erro de CI, não silêncio. Seguimos
        // respondendo `{}` para não quebrar o render no meio. (Operações sem nome
        // — introspecção etc. — são ignoradas.)
        if (operationName && !(operationName in SSR_RESPONSES)) {
          unhandledSsrOps.add(operationName);
          console.error(
            `[stub-backend] SSR sem resposta para "${operationName}". ` +
              `Adicione-a em SSR_RESPONSES (e2e/support/stub-backend.ts) — a página faz esse fetch no servidor.`
          );
        }
        const data = SSR_RESPONSES[operationName] ?? {};
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ data }));
      });
    });

    server.listen(port, () => {
      // unref: não impede o processo do Playwright de encerrar ao fim da suíte.
      server?.unref();
      resolve();
    });
  });
}
