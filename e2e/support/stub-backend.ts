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
