import { MockedProvider } from "@apollo/client/testing/react";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// A tabela do relatório lê a URL pelo App Router e a escreve pela History API.
const { state } = vi.hoisted(() => ({ state: { sp: new URLSearchParams() } }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => state.sp,
  usePathname: () => "/dashboard/reports/sales",
}));

import { Toast } from "@/components/Toast";
import { ReportFilters } from "../interface";
import {
  INVOICED_BY_FACTORY_QUERY,
  INVOICED_BY_MONTH_QUERY,
  SALES_REPORT_ORDERS_QUERY,
  SALES_REPORT_STATS_QUERY,
} from "./gql";
import { useSalesReport } from "./useSalesReport";

/** O Intl pt-BR separa "R$" do número com espaço não-quebrável. */
const money = (value: string) => value.replace(/\u00a0/g, " ");

const MES = {
  from: "2026-09-01",
  to: "2026-09-30",
  sellerId: null,
  factoryId: null,
};
const TRIMESTRE = { ...MES, from: "2026-07-01" };

const baseFilters = (filters: ReportFilters) => [
  { field: "invoiced_at", operator: "gte", value: filters.from },
  { field: "invoiced_at", operator: "lte", value: filters.to },
  { field: "status_in", operator: "in", values: ["INVOICED", "DELIVERED"] },
  ...(filters.sellerId
    ? [{ field: "seller_id", operator: "eq", value: filters.sellerId }]
    : []),
];

const order = (id: string) => ({
  __typename: "OrderType",
  id,
  orderDate: "2026-09-02",
  invoicedAt: "2026-09-10",
  totalAmount: "1000.00",
  commissionAmount: "30.00",
  status: "INVOICED",
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

const ordersMock = (
  filters: ReportFilters,
  opts: {
    first?: number;
    after?: string | null;
    ids?: string[];
    next?: string | null;
  } = {}
) => ({
  request: {
    query: SALES_REPORT_ORDERS_QUERY,
    variables: {
      input: {
        first: opts.first ?? 20,
        after: opts.after ?? null,
        filters: baseFilters(filters),
      },
    },
  },
  maxUsageCount: 5,
  result: {
    data: {
      sales_report_orders: {
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
  filters: ReportFilters,
  stats?: Record<string, unknown>
) => ({
  request: {
    query: SALES_REPORT_STATS_QUERY,
    variables: { input: { first: 20, filters: baseFilters(filters) } },
  },
  maxUsageCount: 5,
  result: {
    data: {
      sales_report_stats: {
        __typename: "OrderStatsType",
        totalOrders: 3,
        totalAmount: "15000.00",
        avgTicket: "5000.00",
        commissionAmount: "450.00",
        ...stats,
      },
    },
  },
});

const factoryChartMock = (filters: ReportFilters) => ({
  request: {
    query: INVOICED_BY_FACTORY_QUERY,
    variables: {
      from: filters.from,
      to: filters.to,
      sellerId: filters.sellerId,
      limit: 8,
    },
  },
  maxUsageCount: 5,
  result: {
    data: {
      invoicedRevenueByFactory: [
        {
          __typename: "EntityRevenuePoint",
          entityId: "f1",
          entityName: "HERC",
          total: "15000.00",
          orderCount: 3,
          commissionAmount: "450.00",
        },
      ],
    },
  },
});

const monthChartMock = (filters: ReportFilters) => ({
  request: {
    query: INVOICED_BY_MONTH_QUERY,
    variables: {
      from: filters.from,
      to: filters.to,
      sellerId: filters.sellerId,
    },
  },
  maxUsageCount: 5,
  result: {
    data: {
      invoicedRevenueByMonth: [
        {
          __typename: "MonthRevenuePoint",
          month: "2026-07",
          total: "5000.00",
          orderCount: 1,
          commissionAmount: "150.00",
        },
        {
          __typename: "MonthRevenuePoint",
          month: "2026-08",
          total: "10000.00",
          orderCount: 2,
          commissionAmount: "300.00",
        },
      ],
    },
  },
});

const wrapperWith = (mocks: unknown[]) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Toast.ToastProvider>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- mocks do MockLink */}
      <MockedProvider mocks={mocks as any}>{children}</MockedProvider>
    </Toast.ToastProvider>
  );
  return Wrapper;
};

const run = async (filters: ReportFilters, mocks: unknown[]) => {
  const { result } = renderHook(() => useSalesReport(filters), {
    wrapper: wrapperWith(mocks),
  });
  await waitFor(() => expect(result.current.kpisLoading).toBe(false));
  return result;
};

beforeEach(() => {
  state.sp = new URLSearchParams();
  vi.spyOn(window.history, "replaceState").mockImplementation(() => {});
});

describe("useSalesReport", () => {
  it("recorta tudo pela data de FATURAMENTO, e só o que foi faturado", async () => {
    // A pergunta da aba é "quanto a fábrica faturou em setembro": um pedido de
    // junho faturado em setembro entra em setembro.
    const result = await run(MES, [
      ordersMock(MES),
      statsMock(MES),
      factoryChartMock(MES),
    ]);

    await waitFor(() =>
      expect(result.current.tableData.displayedData).toHaveLength(1)
    );
    expect(result.current.hasRows).toBe(true);
  });

  it("o topo lê o mesmo recorte da tabela", async () => {
    // Mock e hook só se encontram se as variables baterem: o teste falha se o
    // fechamento passar a somar um recorte diferente do da lista.
    const result = await run(MES, [
      ordersMock(MES),
      statsMock(MES),
      factoryChartMock(MES),
    ]);

    expect(result.current.kpis.map((kpi) => money(kpi.value))).toEqual([
      "3",
      "R$ 15.000,00",
      "R$ 5.000,00",
      "R$ 450,00",
    ]);
  });

  it("sem faturamento no período, os KPIs mostram zero em vez de vazio", async () => {
    const result = await run(MES, [
      ordersMock(MES, { ids: [] }),
      statsMock(MES, {
        totalOrders: 0,
        totalAmount: "0",
        avgTicket: "0",
        commissionAmount: "0",
      }),
      factoryChartMock(MES),
    ]);

    expect(result.current.kpis[0].value).toBe("0");
    expect(money(result.current.kpis[1].value)).toBe("R$ 0,00");
  });

  it("um mês só: o gráfico vira o ranking de fábricas", async () => {
    // Um mês num gráfico mensal teria uma barra só — aí a leitura útil é de
    // quem veio o dinheiro.
    const result = await run(MES, [
      ordersMock(MES),
      statsMock(MES),
      factoryChartMock(MES),
    ]);

    await waitFor(() => expect(result.current.chart.hasData).toBe(true));
    expect(result.current.chart.title).toBe("Faturamento por fábrica");
  });

  it("mais de um mês: o gráfico passa a ser a evolução mês a mês", async () => {
    const result = await run(TRIMESTRE, [
      ordersMock(TRIMESTRE),
      statsMock(TRIMESTRE),
      monthChartMock(TRIMESTRE),
    ]);

    await waitFor(() => expect(result.current.chart.hasData).toBe(true));
    expect(result.current.chart.title).toBe("Faturamento mês a mês");
  });

  it("a exportação varre todas as páginas do mesmo recorte", async () => {
    // A tabela mostra 20 por página; o arquivo tem de sair com a lista inteira.
    const result = await run(MES, [
      ordersMock(MES),
      statsMock(MES),
      factoryChartMock(MES),
      ordersMock(MES, { first: 100, ids: ["o1", "o2"], next: "cursor-1" }),
      ordersMock(MES, { first: 100, after: "cursor-1", ids: ["o3"] }),
    ]);

    const rows = await result.current.fetchAllRows();

    expect(rows.map((row) => row.id)).toEqual(["o1", "o2", "o3"]);
  });
});
