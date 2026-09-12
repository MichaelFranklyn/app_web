import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { state } = vi.hoisted(() => ({ state: { sp: new URLSearchParams() } }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => state.sp,
  usePathname: () => "/dashboard/reports/sent-orders",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

import { Toast } from "@/components/Toast";
import { ReportFilters } from "../interface";
import {
  PLACED_BY_FACTORY_QUERY,
  SENT_ORDERS_QUERY,
  SENT_ORDERS_STATS_QUERY,
} from "./gql";
import { useSentOrdersReport } from "./useSentOrdersReport";

const money = (value?: string) => (value ?? "").replace(/\u00a0/g, " ");

const FILTERS: ReportFilters = {
  from: "2026-09-01",
  to: "2026-09-30",
  sellerId: null,
  factoryId: null,
};

/** O recorte da aba: pela data do PEDIDO e só o que virou pedido de verdade. */
const baseFilters = [
  { field: "order_date", operator: "gte", value: FILTERS.from },
  { field: "order_date", operator: "lte", value: FILTERS.to },
  {
    field: "status_in",
    operator: "in",
    values: ["CONFIRMED", "INVOICED", "DELIVERED"],
  },
];

const order = (id: string) => ({
  __typename: "OrderType",
  id,
  orderDate: "2026-09-02",
  invoicedAt: null,
  totalAmount: "1000.00",
  commissionAmount: "30.00",
  status: "CONFIRMED",
  isDeliveryOverdue: false,
  seller: { __typename: "UserType", id: "s1", name: "Rafael" },
  client: {
    __typename: "ClientType",
    id: "c1",
    razaoSocial: "ALTO LTDA",
    nomeFantasia: "Alto",
  },
  factory: {
    __typename: "FactoryType",
    id: "f1",
    razaoSocial: "HERC SA",
    nomeFantasia: "HERC",
    nickname: null,
  },
});

const listMock = (
  opts: {
    first?: number;
    after?: string | null;
    filters?: unknown[];
    ids?: string[];
    next?: string | null;
  } = {}
) => ({
  request: {
    query: SENT_ORDERS_QUERY,
    variables: {
      input: {
        first: opts.first ?? 20,
        after: opts.after ?? null,
        filters: opts.filters ?? baseFilters,
      },
    },
  },
  maxUsageCount: 5,
  result: {
    data: {
      sent_orders_report: {
        __typename: "OrderTypeConnection",
        edges: (opts.ids ?? ["o1"]).map((id) => ({
          __typename: "OrderTypeEdge",
          node: order(id),
        })),
        pageInfo: {
          __typename: "PageInfo",
          hasNextPage: Boolean(opts.next),
          endCursor: opts.next ?? null,
        },
        totalCount: 1,
      },
    },
  },
});

const statsMock = (
  stats: Record<string, unknown> = {},
  filters: unknown[] = baseFilters
) => ({
  request: {
    query: SENT_ORDERS_STATS_QUERY,
    variables: { input: { first: 20, filters } },
  },
  maxUsageCount: 5,
  result: {
    data: {
      sent_orders_report_stats: {
        __typename: "OrderStatsType",
        totalOrders: 10,
        totalAmount: "20000.00",
        avgTicket: "2000.00",
        invoicedOrders: 6,
        invoicedAmount: "12000.00",
        ...stats,
      },
    },
  },
});

const chartMock = (points: unknown[] = []) => ({
  request: {
    query: PLACED_BY_FACTORY_QUERY,
    variables: {
      from: FILTERS.from,
      to: FILTERS.to,
      sellerId: null,
      limit: 8,
    },
  },
  maxUsageCount: 5,
  result: { data: { placedOrdersByFactory: points } },
});

const point = {
  __typename: "PlacedByFactoryPoint",
  entityId: "f1",
  entityName: "HERC",
  orderCount: 10,
  total: "20000.00",
  invoicedCount: 6,
  invoicedAmount: "12000.00",
};

const wrapper = (mocks: unknown[]) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Toast.ToastProvider>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- mocks do MockLink */}
      <MockedProvider mocks={mocks as any}>{children}</MockedProvider>
    </Toast.ToastProvider>
  );
  return Wrapper;
};

const run = async (mocks: unknown[]) => {
  const { result } = renderHook(() => useSentOrdersReport(FILTERS), {
    wrapper: wrapper(mocks),
  });
  await waitFor(() => expect(result.current.kpisLoading).toBe(false));
  return result;
};

beforeEach(() => {
  state.sp = new URLSearchParams();
  vi.spyOn(window.history, "replaceState").mockImplementation(() => {});
});

describe("useSentOrdersReport", () => {
  it("mostra o que ainda está parado na fábrica — o número que faz o papel existir", async () => {
    // Enviados menos faturados, em quantidade e em dinheiro.
    const result = await run([listMock(), statsMock(), chartMock()]);

    expect(result.current.kpis[3].value).toBe("4");
    expect(money(result.current.kpis[3].hint)).toBe("R$ 8.000,00");
    expect(result.current.kpis[3].status).toBe("atencao");
  });

  it("fábrica em dia com tudo faturado não cobra nada", async () => {
    const result = await run([
      listMock(),
      statsMock({ invoicedOrders: 10, invoicedAmount: "20000.00" }),
      chartMock(),
    ]);

    expect(result.current.kpis[3].value).toBe("0");
    expect(money(result.current.kpis[3].hint)).toBe("R$ 0,00");
    expect(result.current.kpis[3].status).toBe("ok");
  });

  it("o topo lê o mesmo recorte da tabela", async () => {
    const result = await run([listMock(), statsMock(), chartMock()]);

    expect(result.current.kpis[0].value).toBe("10");
    expect(money(result.current.kpis[1].value)).toBe("R$ 20.000,00");
    expect(money(result.current.kpis[2].hint)).toBe("R$ 12.000,00");
  });

  it("período sem pedido enviado mostra zeros", async () => {
    const semStats = {
      ...statsMock(),
      result: { data: { sent_orders_report_stats: null } },
    };
    const result = await run([listMock({ ids: [] }), semStats, chartMock()]);

    expect(result.current.kpis[0].value).toBe("0");
    expect(money(result.current.kpis[1].value)).toBe("R$ 0,00");
    expect(result.current.kpis[3].status).toBe("ok");
  });

  it("o gráfico usa a agregação que respeita o mesmo recorte de situação", async () => {
    // As agregações genéricas do dashboard contam orçamento e cancelado, e o
    // gráfico acabaria maior do que o total do topo.
    const result = await run([listMock(), statsMock(), chartMock([point])]);

    await waitFor(() => expect(result.current.chart.hasData).toBe(true));
  });

  it("filtrar uma situação leva o filtro ao topo e à exportação", async () => {
    const comStatus = [
      ...baseFilters,
      { field: "status", operator: "eq", value: "CONFIRMED" },
    ];
    const result = await run([
      listMock(),
      statsMock(),
      chartMock(),
      listMock({ filters: comStatus }),
      statsMock({ totalOrders: 4, invoicedOrders: 0 }, comStatus),
      listMock({ first: 100, filters: comStatus, ids: ["o1", "o2"] }),
    ]);

    act(() => result.current.tableData.setFilter("status", "CONFIRMED"));

    await waitFor(() => expect(result.current.kpis[0].value).toBe("4"));
    const rows = await result.current.fetchAllRows();
    expect(rows.map((row) => row.id)).toEqual(["o1", "o2"]);
  });
});
