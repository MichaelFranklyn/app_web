import { expect, test } from "../support/fixtures";
import {
  emptyConnection,
  emptyDashboardQueries,
  mockGraphql,
} from "../support/graphql";

/**
 * Cauda longa — smoke de RENDER das páginas de leitura/visualização
 * (sem mutação). Mocka as queries de montagem e afirma um elemento estável
 * (eyebrow numerado / título único). Não exercita interação — garante que a
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
  await expect(page.getByText("Visão Geral")).toBeVisible();
  await expect(page.getByText("Pedidos no período")).toBeVisible();
  await expect(page.getByText("7", { exact: true })).toBeVisible();
});

test("vendedor detalhe: monta o cabeçalho", async ({ page }) => {
  await mockGraphql(page, {
    SellerDetail: () => ({
      seller_detail: {
        status: true,
        message: "ok",
        data: {
          id: "seller-1",
          name: "Vendedor Detalhe",
          phone: "11999990000",
          cpf: "12345678909",
          region: "Sudeste",
          homeCep: null,
          homeStreet: null,
          homeNumber: null,
          homeComplement: null,
          homeNeighborhood: null,
          homeCity: null,
          homeState: null,
          isActive: true,
          factoryCount: 0,
          clientCount: 0,
          totalRevenue: "0",
          lastOrderDate: null,
          createdAt: "2026-01-01T00:00:00Z",
          user: { id: "u-1", email: "v@empresa.com" },
        },
      },
    }),
    SellerFactoryAccesses: () => ({ seller_accesses: emptyConnection() }),
    SellerClientLinks: () => ({ seller_clients: emptyConnection() }),
  });

  await page.goto("/sellers/seller-1");
  await expect(page.getByText("Vendedor Detalhe").first()).toBeVisible();
});

test("rotina por data: monta a semana", async ({ page }) => {
  await mockGraphql(page, {
    VisitsWeekSchedule: () => ({ week_schedule: conn([]) }),
  });
  await page.goto("/routines/2026-06-22");
  await expect(page.getByText(/07.*Rotina/)).toBeVisible();
});

test("fábrica/pedidos: monta a aba de pedidos", async ({ page }) => {
  // CompanyFactoryDetail (SSR) é servido pelo stub para factory-1.
  await mockGraphql(page, {
    FactoryOrders: () => ({ factory_orders: conn([]) }),
  });
  await page.goto("/factories/factory-1/orders");
  await expect(page.getByText(/02.*Fábricas/)).toBeVisible();
});
