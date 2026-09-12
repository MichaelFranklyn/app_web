import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { plan } = vi.hoisted(() => ({ plan: { hasRoutines: true } }));
vi.mock("@/services/plan", () => ({ useFeature: () => plan.hasRoutines }));
// O seed do SSR tem teste próprio (useSeedQuery); aqui o cache começa frio.
vi.mock("@/hooks/useSeedQuery", () => ({ useSeedQuery: () => {} }));

import {
  COMPANY_CLIENTS_COUNT_QUERY,
  DASHBOARD_SELLERS_QUERY,
  ORDERS_BY_PERIOD_QUERY,
  RECENT_ORDERS_QUERY,
  SCHEDULES_BY_PERIOD_QUERY,
} from "./gql";
import { DateRangeIso } from "./interface";
import { useDashboard } from "./useDashboard";
import { dashboardVariables, SELLERS_VARIABLES } from "./utils";

const RANGE: DateRangeIso = { from: "2026-09-01", to: "2026-09-30" };

const sellersMock = (sellers: { id: string; name: string }[]) => ({
  request: { query: DASHBOARD_SELLERS_QUERY, variables: SELLERS_VARIABLES },
  maxUsageCount: 10,
  result: {
    data: {
      dashboard_sellers: {
        __typename: "UserTypeConnection",
        edges: sellers.map((seller) => ({
          __typename: "UserTypeEdge",
          node: { __typename: "UserType", ...seller },
        })),
        totalCount: sellers.length,
      },
    },
  },
});

const ordersMock = (
  sellerId: string | null,
  orders: { id: string; totalAmount: string }[],
  totalCount = orders.length
) => ({
  request: {
    query: ORDERS_BY_PERIOD_QUERY,
    variables: dashboardVariables(RANGE, sellerId).orders,
  },
  maxUsageCount: 10,
  result: {
    data: {
      orders_by_period: {
        __typename: "OrderTypeConnection",
        edges: orders.map((order) => ({
          __typename: "OrderTypeEdge",
          node: { __typename: "OrderType", ...order },
        })),
        totalCount,
      },
    },
  },
});

/**
 * Os mesmos pedidos da soma, com cliente e fábrica. O valor tem de bater: o
 * cache do Apollo é normalizado por id, e duas respostas divergentes para o
 * mesmo pedido fariam a última vencer.
 */
const recentMock = (
  sellerId: string | null,
  orders: { id: string; totalAmount: string }[]
) => ({
  request: {
    query: RECENT_ORDERS_QUERY,
    variables: dashboardVariables(RANGE, sellerId).recentOrders,
  },
  maxUsageCount: 10,
  result: {
    data: {
      recent_orders: {
        __typename: "OrderTypeConnection",
        edges: orders.map(({ id, totalAmount }) => ({
          __typename: "OrderTypeEdge",
          node: {
            __typename: "OrderType",
            id,
            orderDate: "2026-09-10",
            totalAmount,
            status: "CONFIRMED",
            client: {
              __typename: "ClientType",
              id: "c1",
              razaoSocial: "ALTO",
              nomeFantasia: null,
            },
            factory: {
              __typename: "FactoryType",
              id: "f1",
              razaoSocial: "HERC SA",
              nomeFantasia: "HERC",
              nickname: null,
            },
          },
        })),
        totalCount: orders.length,
      },
    },
  },
});

const clientsMock = (sellerId: string | null, totalCount: number) => ({
  request: {
    query: COMPANY_CLIENTS_COUNT_QUERY,
    variables: dashboardVariables(RANGE, sellerId).clientsCount,
  },
  maxUsageCount: 10,
  result: {
    data: {
      company_clients_count: {
        __typename: "CompanyClientConnection",
        totalCount,
      },
    },
  },
});

const visitItem = (id: string, status: string) => ({
  __typename: "VisitScheduleItemType",
  id,
  plannedOrder: 1,
  status,
  clientFactoryLink: {
    __typename: "SellerClientFactoryType",
    id: `scf-${id}`,
    client: {
      __typename: "ClientType",
      id: "c1",
      razaoSocial: "ALTO",
      nomeFantasia: null,
    },
    factory: {
      __typename: "FactoryType",
      id: "f1",
      razaoSocial: "HERC SA",
      nomeFantasia: "HERC",
      nickname: null,
    },
  },
});

const schedulesMock = (
  sellerId: string | null,
  items: ReturnType<typeof visitItem>[]
) => ({
  request: {
    query: SCHEDULES_BY_PERIOD_QUERY,
    variables: dashboardVariables(RANGE, sellerId).schedules,
  },
  maxUsageCount: 10,
  result: {
    data: {
      schedules_by_period: {
        __typename: "VisitScheduleConnection",
        edges: [
          {
            __typename: "VisitScheduleEdge",
            node: {
              __typename: "VisitScheduleType",
              id: "sch-1",
              weekStart: "2026-09-07",
              status: "ACTIVE",
              days: [
                {
                  __typename: "VisitScheduleDayType",
                  id: "d1",
                  date: "2026-09-08",
                  items,
                },
              ],
            },
          },
        ],
      },
    },
  },
});

const PEDIDOS = [
  { id: "o1", totalAmount: "1000.00" },
  { id: "o2", totalAmount: "2500.50" },
];

const painel = (sellerId: string | null) => [
  ordersMock(sellerId, PEDIDOS),
  recentMock(sellerId, PEDIDOS),
  clientsMock(sellerId, 42),
  schedulesMock(sellerId, [
    visitItem("v1", "COMPLETED"),
    visitItem("v2", "PENDING"),
    visitItem("v3", "PENDING"),
  ]),
];

const wrapper = (mocks: unknown[]) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any -- mocks do MockLink */
    <MockedProvider mocks={mocks as any}>{children}</MockedProvider>
  );
  return Wrapper;
};

const run = (
  mocks: unknown[],
  params: {
    canSelectSeller?: boolean;
    ownSellerId?: string | null;
    initialSellerId?: string | null;
  } = {}
) =>
  renderHook(
    () =>
      useDashboard({
        canSelectSeller: params.canSelectSeller ?? false,
        ownSellerId: params.ownSellerId ?? null,
        initialRange: RANGE,
        initialSellerId: params.initialSellerId ?? null,
        seed: null,
      }),
    { wrapper: wrapper(mocks) }
  ).result;

beforeEach(() => {
  plan.hasRoutines = true;
});

describe("useDashboard — os números do período", () => {
  it("soma o faturado, conta os pedidos e os clientes", async () => {
    // A lista que aparece e a que soma são consultas diferentes: a de baixo
    // traz quatro linhas com cliente e fábrica; esta traz só o valor de cem.
    const result = run(painel(null));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.totalOrders).toBe(2);
    expect(result.current.totalRevenue).toBe(3500.5);
    expect(result.current.totalClients).toBe(42);
    expect(result.current.orders).toHaveLength(2);
  });

  it("separa visita concluída de visita planejada", async () => {
    const result = run(painel(null));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.completedVisits).toBe(1);
    expect(result.current.totalPlannedVisits).toBe(3);
    expect(result.current.upcomingVisits).toHaveLength(2);
  });

  it("a agenda mostra no máximo cinco próximas", async () => {
    const muitas = Array.from({ length: 8 }, (_, i) =>
      visitItem(`v${i}`, "PENDING")
    );
    const result = run([
      ordersMock(null, []),
      recentMock(null, []),
      clientsMock(null, 0),
      schedulesMock(null, muitas),
    ]);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.upcomingVisits).toHaveLength(5);
  });
});

describe("useDashboard — plano e escopo", () => {
  it("sem o motor de rotina no plano, o painel não pergunta pela agenda", async () => {
    // O backend recusa `visitSchedules` para quem não contratou, e a recusa
    // derrubaria o dashboard inteiro por causa de um cartão.
    plan.hasRoutines = false;
    const result = run([
      ordersMock(null, []),
      recentMock(null, []),
      clientsMock(null, 5),
    ]);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasRoutines).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.totalPlannedVisits).toBe(0);
  });

  it("gestor sem vendedor escolhido não busca dados soltos", async () => {
    const result = run([sellersMock([])], { canSelectSeller: true });

    await waitFor(() => expect(result.current.sellers).toEqual([]));
    expect(result.current.error).toBeUndefined();
  });

  it("o gestor que também vende abre no próprio painel", async () => {
    // Mesma regra do servidor: o próprio perfil, senão o primeiro da lista.
    const result = run(
      [
        sellersMock([
          { id: "s1", name: "Rafael" },
          { id: "s2", name: "Bruna" },
        ]),
        ...painel("s2"),
      ],
      { canSelectSeller: true, ownSellerId: "s2" }
    );

    await waitFor(() => expect(result.current.selectedSellerId).toBe("s2"));
    expect(result.current.selectedSellerName).toBe("Bruna");
  });

  it("gestor que não vende abre no primeiro vendedor da lista", async () => {
    const result = run(
      [
        sellersMock([
          { id: "s1", name: "Rafael" },
          { id: "s2", name: "Bruna" },
        ]),
        ...painel("s1"),
      ],
      { canSelectSeller: true, ownSellerId: null }
    );

    await waitFor(() => expect(result.current.selectedSellerId).toBe("s1"));
  });

  it("trocar de vendedor troca o recorte de todas as consultas", async () => {
    const result = run(
      [
        sellersMock([
          { id: "s1", name: "Rafael" },
          { id: "s2", name: "Bruna" },
        ]),
        ...painel("s1"),
        ...painel("s2"),
      ],
      { canSelectSeller: true, initialSellerId: "s1" }
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setSelectedSellerId("s2"));

    await waitFor(() =>
      expect(result.current.selectedSellerName).toBe("Bruna")
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
});
