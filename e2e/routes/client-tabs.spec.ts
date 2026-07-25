import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * Cauda longa — smoke de RENDER das abas de leitura do cliente
 * (clients/[id]/{factories,orders,score,stock,visits}). A rota é chaveada pelo id
 * da carteira (company_client); o layout dispara `CompanyClient` e resolve o
 * cliente global aninhado, disponibilizando o clientId às abas via contexto.
 * Cada aba adiciona sua query. As abas score/stock/visits são EM CASCATA
 * (SellerClientFactoriesByClient → query dependente com skip:!id); com a lista de
 * vínculos vazia a dependente é pulada e a página mostra o estado vazio.
 */
const conn = () => ({
  edges: [],
  pageInfo: { hasNextPage: false, endCursor: null },
  totalCount: 0,
});

const clientLayout = () => ({
  CompanyClient: () => ({
    companyClient: {
      status: true,
      code: 200,
      message: "ok",
      data: {
        id: "client-1",
        notes: null,
        isActive: true,
        client: {
          id: "client-1",
          cnpj: "12345678000190",
          razaoSocial: "Cliente Abas LTDA",
          nomeFantasia: "Cliente Abas",
          cnae: null,
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
  SellerClientFactoriesByClient: () => ({ sellerClientFactoryList: conn() }),
});

// O <h1> do header do cliente — o eyebrow numerado saiu de todas as telas.
const cabecalho = (page: import("@playwright/test").Page) =>
  page.getByRole("heading", { name: "Cliente Abas", level: 1 });

test("cliente/fábricas: monta a aba", async ({ page }) => {
  await mockGraphql(page, { ...clientLayout() });
  await page.goto("/clients/client-1/factories");
  await expect(cabecalho(page)).toBeVisible();
});

test("cliente/pedidos: monta a aba", async ({ page }) => {
  await mockGraphql(page, {
    ...clientLayout(),
    // A aba agrupa por fábrica: os pedidos de cada uma só carregam ao abrir o card.
    ClientFactoryOrders: () => ({
      companyClient: { data: { id: "cc-1", factoryOrderSummaries: [] } },
    }),
  });
  await page.goto("/clients/client-1/orders");
  await expect(cabecalho(page)).toBeVisible();
});

test("cliente/score: monta a aba", async ({ page }) => {
  await mockGraphql(page, {
    ...clientLayout(),
    // O cliente tem um score POR FÁBRICA; a aba monta a grade a partir daqui.
    ClientFactoryScores: () => ({
      companyClient: { data: { id: "cc-1", factoryVisitScores: [] } },
    }),
    ClientVisitScores: () => ({ clientVisitScores: conn() }),
    ClientProductInsights: () => ({ clientProductInsights: conn() }),
  });
  await page.goto("/clients/client-1/score");
  await expect(cabecalho(page)).toBeVisible();
});

test("cliente/estoque: renderiza uma linha de insight com a unidade (unit.label)", async ({
  page,
}) => {
  await mockGraphql(page, {
    CompanyClient: clientLayout().CompanyClient,
    // O estoque é por fábrica: a aba mostra um card por vínculo e os produtos só
    // carregam quando o card abre.
    ClientFactoryStock: () => ({
      companyClient: {
        data: {
          id: "cc-1",
          factoryStockSummaries: [
            {
              sellerClientFactoryId: "scf-1",
              totalProducts: 1,
              stockedOut: 0,
              critical: 0,
              factory: {
                id: "f-1",
                nomeFantasia: "Fábrica",
                razaoSocial: "Fábrica LTDA",
              },
            },
          ],
        },
      },
    }),
    ClientProductInsights: () => ({
      clientProductInsights: {
        edges: [
          {
            node: {
              id: "ins-1",
              lastPurchaseDate: "2026-05-01",
              lastQuantity: "10",
              avgQuantity: "8",
              avgShelfDays: 20,
              avgIntervalDays: 30,
              estimatedStockoutDate: "2026-07-01",
              daysSinceStockout: -5,
              nextPurchaseEstimate: "2026-06-30",
              churnRisk: "baixo",
              product: {
                id: "p-1",
                name: "Cimento Forte",
                unit: { label: "SC" },
              },
            },
          },
        ],
        totalCount: 1,
      },
    }),
  });
  await page.goto("/clients/client-1/stock");
  await expect(cabecalho(page)).toBeVisible();

  await page
    .getByRole("button", { name: "Ver os produtos de Fábrica" })
    .click();

  await expect(page.getByText("Cimento Forte")).toBeVisible();
  // Valida o fix de contrato (unit virou objeto {label}); a célula mostra "10 SC".
  await expect(page.getByText("10 SC")).toBeVisible();
});

test("cliente/visitas: monta a aba", async ({ page }) => {
  await mockGraphql(page, {
    ...clientLayout(),
    // A visita é do cliente, não do vínculo: uma ida cobre várias fábricas.
    VisitsByCompanyClient: () => ({ visitsByCompanyClient: conn() }),
  });
  await page.goto("/clients/client-1/visits");
  await expect(cabecalho(page)).toBeVisible();
});
