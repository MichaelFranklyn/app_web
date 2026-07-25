import { expect, test } from "../support/fixtures";
import {
  emptyConnection,
  emptyDashboardQueries,
  mockGraphql,
} from "../support/graphql";

/**
 * Cauda longa — smoke de RENDER das páginas de leitura/visualização
 * (sem mutação). Mocka as queries de montagem e afirma um elemento estável
 * (o <h1> do header). Não exercita interação — garante que a
 * rota monta sem quebrar com dados vazios.
 */
const conn = (nodes: Array<Record<string, unknown>> = []) => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: false, endCursor: null },
  totalCount: nodes.length,
});

test("dashboard: monta e renderiza o KPI de pedidos do período", async ({
  page,
}) => {
  await mockGraphql(page, {
    ...emptyDashboardQueries,
    // totalCount alimenta o KPI "Pedidos no período" (independe das edges).
    OrdersByPeriod: () => ({ orders_by_period: { edges: [], totalCount: 7 } }),
    CompanyClientsCount: () => ({ company_clients_count: { totalCount: 12 } }),
  });
  await page.goto("/dashboard");
  // O <h1> do PanelHeader.Title é único na página.
  await expect(
    page.getByRole("heading", { name: "Dashboard", level: 1 })
  ).toBeVisible();
  await expect(page.getByText("Pedidos no período")).toBeVisible();
  await expect(page.getByText("7", { exact: true })).toBeVisible();
});

// O perfil substituiu /sellers/[id]: uma tela só, keyed pelo USUÁRIO, que ganha
// as abas de vendedor quando a pessoa tem perfil de vendedor.
test("perfil do vendedor: cabeçalho e blocos de campo na mesma página", async ({
  page,
}) => {
  await mockGraphql(page, {
    UserDetail: () => ({
      user_detail: {
        status: true,
        message: "ok",
        data: {
          id: "u-1",
          name: "Vendedor Detalhe",
          email: "v@empresa.com",
          role: "SELLER",
          isActive: true,
          phone: "11999990000",
          birthDate: "1970-05-10",
          addressZip: null,
          addressStreet: null,
          addressNumber: null,
          addressComplement: null,
          addressNeighborhood: null,
          addressCity: null,
          addressState: null,
          createdAt: "2026-01-01T00:00:00Z",
          company: {
            id: "c-1",
            nomeFantasia: "Empresa Teste",
            razaoSocial: "Empresa Teste LTDA",
          },
          seller: {
            id: "seller-1",
            name: "Vendedor Detalhe",
            region: "Sudeste",
            isActive: true,
            factoryCount: 0,
            clientCount: 0,
            totalRevenue: "0",
            lastOrderDate: null,
            scheduleConfig: null,
          },
        },
      },
    }),
    SellerFactoryAccesses: () => ({ seller_accesses: emptyConnection() }),
    SellerClientLinks: () => ({ seller_clients: emptyConnection() }),
  });

  await page.goto("/settings/users/u-1");

  await expect(
    page.getByRole("heading", { name: "Vendedor Detalhe", level: 1 })
  ).toBeVisible();
  // Sem abas: os blocos de campo estão na mesma página, um abaixo do outro, e
  // só existem porque este usuário tem perfil de vendedor.
  const sections = page.locator('[data-tour="user-profile-sections"]');
  for (const bloco of [
    "Dados pessoais",
    "Acesso ao sistema",
    "Rotina de visitas",
    "Fábricas com acesso",
    "Carteira de clientes",
  ]) {
    await expect(sections.getByRole("heading", { name: bloco })).toBeVisible();
  }
});

test("rotina por data: monta a semana", async ({ page }) => {
  await mockGraphql(page, {
    VisitsWeekSchedule: () => ({ week_schedule: conn([]) }),
  });
  await page.goto("/routines/2026-06-22");
  await expect(
    page.getByRole("heading", { name: "Rota do Dia", level: 1 })
  ).toBeVisible();
});

test("fábrica/pedidos: monta a aba de pedidos", async ({ page }) => {
  // CompanyFactoryDetail (SSR) é servido pelo stub para factory-1.
  await mockGraphql(page, {
    FactoryOrders: () => ({ factory_orders: conn([]) }),
  });
  await page.goto("/factories/factory-1/orders");
  await expect(
    page.getByRole("heading", { name: "Fábrica Detalhe", level: 1 })
  ).toBeVisible();
});
