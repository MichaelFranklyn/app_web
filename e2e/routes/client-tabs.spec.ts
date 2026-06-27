import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * Cauda longa — smoke de RENDER das abas de leitura do cliente
 * (clients/[id]/{factories,orders,score,stock,visits}). O layout client-side
 * dispara `Client`; cada aba adiciona sua query. As abas score/stock/visits
 * são EM CASCATA (SellerClientFactoriesByClient → query dependente com
 * skip:!id); com a lista de vínculos vazia a dependente é pulada e a página
 * mostra o estado vazio — suficiente para o smoke.
 */
const conn = () => ({
  edges: [],
  pageInfo: { hasNextPage: false, endCursor: null },
  totalCount: 0,
});

const clientLayout = () => ({
  Client: () => ({
    client: {
      status: true,
      code: 200,
      message: "ok",
      data: {
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
        companyClient: { id: "cc-1", notes: null, isActive: true },
      },
    },
  }),
  SellerClientFactoriesByClient: () => ({ sellerClientFactoryList: conn() }),
});

const eyebrow = /03.*Clientes/;

test("cliente/fábricas: monta a aba", async ({ page }) => {
  await mockGraphql(page, { ...clientLayout() });
  await page.goto("/clients/client-1/factories");
  await expect(page.getByText(eyebrow)).toBeVisible();
});

test("cliente/pedidos: monta a aba", async ({ page }) => {
  await mockGraphql(page, {
    ...clientLayout(),
    ClientOrders: () => ({ orders: conn() }),
  });
  await page.goto("/clients/client-1/orders");
  await expect(page.getByText(eyebrow)).toBeVisible();
});

test("cliente/score: monta a aba", async ({ page }) => {
  await mockGraphql(page, {
    ...clientLayout(),
    ClientVisitScores: () => ({ clientVisitScores: conn() }),
    ClientProductInsights: () => ({ clientProductInsights: conn() }),
  });
  await page.goto("/clients/client-1/score");
  await expect(page.getByText(eyebrow)).toBeVisible();
});

test("cliente/estoque: renderiza uma linha de insight com a unidade (unit.label)", async ({
  page,
}) => {
  await mockGraphql(page, {
    Client: clientLayout().Client,
    // Precisa de um vínculo COM id para a cascata disparar ClientProductInsights.
    SellerClientFactoriesByClient: () => ({
      sellerClientFactoryList: {
        edges: [
          {
            node: {
              id: "scf-1",
              factory: {
                id: "f-1",
                nomeFantasia: "Fábrica",
                razaoSocial: "Fábrica LTDA",
              },
              seller: { id: "s-1", name: "Vendedor" },
              priority: "high",
              visitFrequencyDays: 30,
              lastVisitDate: null,
            },
          },
        ],
        pageInfo: { hasNextPage: false },
        totalCount: 1,
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
  await expect(page.getByText(eyebrow)).toBeVisible();
  await expect(page.getByText("Cimento Forte")).toBeVisible();
  // Valida o fix de contrato (unit virou objeto {label}); a célula mostra "10 SC".
  await expect(page.getByText("10 SC")).toBeVisible();
});

test("cliente/visitas: monta a aba", async ({ page }) => {
  await mockGraphql(page, {
    ...clientLayout(),
    VisitsBySellerClientFactory: () => ({
      visitsBySellerClientFactory: conn(),
    }),
  });
  await page.goto("/clients/client-1/visits");
  await expect(page.getByText(eyebrow)).toBeVisible();
});
