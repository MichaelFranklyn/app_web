import { createServer, type Server } from "node:http";

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
