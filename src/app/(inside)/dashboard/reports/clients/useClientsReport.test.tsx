import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { state } = vi.hoisted(() => ({ state: { sp: new URLSearchParams() } }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => state.sp,
  usePathname: () => "/dashboard/reports/clients",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

import { Toast } from "@/components/Toast";
import { ReportFilters } from "../interface";
import {
  CLIENTS_AT_RISK_QUERY,
  CLIENTS_REPORT_QUERY,
  CLIENTS_REPORT_STATS_QUERY,
} from "./gql";
import { useClientsReport } from "./useClientsReport";

const FILTERS: ReportFilters = {
  from: "2026-07-01",
  to: "2026-09-30",
  sellerId: null,
  factoryId: null,
};

const client = (id: string) => ({
  __typename: "ClientType",
  id,
  cnpj: "51909936000170",
  razaoSocial: `CLIENTE ${id} LTDA`,
  nomeFantasia: `Cliente ${id}`,
  addressCity: "Salvador",
  addressState: "BA",
  isNeedsAttention: false,
  companyClient: {
    __typename: "CompanyClientType",
    id: `cc-${id}`,
    visitScoreTotal: 40,
    lastOrderDate: "2026-08-10",
    lastVisitDate: "2026-08-20",
    network: null,
    segment: null,
    sellers: [{ __typename: "UserType", id: "s1", name: "Rafael" }],
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
    query: CLIENTS_REPORT_QUERY,
    variables: {
      input: {
        first: opts.first ?? 20,
        after: opts.after ?? null,
        ...(opts.filters?.length ? { filters: opts.filters } : {}),
      },
    },
  },
  maxUsageCount: 5,
  result: {
    data: {
      clients_report: {
        __typename: "ClientTypeConnection",
        edges: (opts.ids ?? ["c1"]).map((id) => ({
          __typename: "ClientTypeEdge",
          node: client(id),
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

const statsMock = (stats: Record<string, number> = {}) => ({
  request: {
    query: CLIENTS_REPORT_STATS_QUERY,
    variables: { sellerId: null },
  },
  maxUsageCount: 5,
  result: {
    data: {
      clients_report_stats: {
        __typename: "ClientStatsType",
        totalClients: 40,
        activeClients: 25,
        atRiskClients: 9,
        noVisit30d: 6,
        ...stats,
      },
    },
  },
});

const riskMock = (points: unknown[] = []) => ({
  request: {
    query: CLIENTS_AT_RISK_QUERY,
    variables: {
      from: FILTERS.from,
      to: FILTERS.to,
      sellerId: null,
      limit: 10,
    },
  },
  maxUsageCount: 5,
  result: { data: { clientsAtRisk: points } },
});

const riskPoint = {
  __typename: "ClientRiskPoint",
  entityId: "c9",
  entityName: "Cliente c9",
  lastOrderDate: "2026-05-01",
  daysSinceLastOrder: 120,
  avgIntervalDays: 30,
  riskRatio: "4",
  orderCount: 8,
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
  const { result } = renderHook(() => useClientsReport(FILTERS), {
    wrapper: wrapper(mocks),
  });
  await waitFor(() => expect(result.current.kpisLoading).toBe(false));
  return result;
};

beforeEach(() => {
  state.sp = new URLSearchParams();
  vi.spyOn(window.history, "replaceState").mockImplementation(() => {});
});

describe("useClientsReport", () => {
  it("os cartões são o retrato de HOJE, não um recorte de período", async () => {
    // Só o gráfico de atraso depende do intervalo: o ritmo de compra de cada
    // cliente sai dos pedidos do período. Os números da carteira, não.
    const result = await run([listMock(), statsMock(), riskMock()]);

    expect(result.current.kpis.map((kpi) => kpi.value)).toEqual([
      "40",
      "25",
      "9",
      "6",
    ]);
  });

  it("cobra visita quando alguém passou de 30 dias sem nenhuma", async () => {
    const result = await run([listMock(), statsMock(), riskMock()]);

    expect(result.current.kpis[3].status).toBe("urgente");
    expect(result.current.kpis[2].status).toBe("atencao");
  });

  it("carteira em dia não acende nada", async () => {
    const result = await run([
      listMock(),
      statsMock({ atRiskClients: 0, noVisit30d: 0 }),
      riskMock(),
    ]);

    expect(result.current.kpis[2].status).toBe("ok");
    expect(result.current.kpis[3].status).toBe("ok");
  });

  it("sem fechamento ainda, mostra zeros em vez de vazio", async () => {
    const semStats = {
      ...statsMock(),
      result: { data: { clients_report_stats: null } },
    };
    const result = await run([listMock(), semStats, riskMock()]);

    expect(result.current.kpis.map((kpi) => kpi.value)).toEqual([
      "0",
      "0",
      "0",
      "0",
    ]);
  });

  it("o gráfico de atraso só aparece quando há quem esteja atrasado", async () => {
    const vazio = await run([listMock(), statsMock(), riskMock()]);
    expect(vazio.current.chart.hasData).toBe(false);

    const comRisco = await run([
      listMock(),
      statsMock(),
      riskMock([riskPoint]),
    ]);
    await waitFor(() => expect(comRisco.current.chart.hasData).toBe(true));
  });

  it("a exportação leva o filtro do painel junto do recorte do relatório", async () => {
    // Sem isso, o arquivo traria a carteira inteira enquanto a tela mostra só
    // uma UF — dois documentos que não se conversam.
    const filtroUf = [{ field: "address_state", operator: "eq", value: "BA" }];
    const result = await run([
      listMock(),
      statsMock(),
      riskMock(),
      listMock({ filters: filtroUf, ids: ["c1"] }),
      listMock({ first: 100, filters: filtroUf, ids: ["c1", "c2"] }),
    ]);

    act(() => result.current.tableData.setFilter("state", "BA"));
    await waitFor(() =>
      expect(result.current.tableData.displayedData).toHaveLength(1)
    );

    const rows = await result.current.fetchAllRows();
    expect(rows.map((row) => row.id)).toEqual(["c1", "c2"]);
  });
});
