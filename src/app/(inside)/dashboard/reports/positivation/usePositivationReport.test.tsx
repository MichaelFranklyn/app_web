import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { state } = vi.hoisted(() => ({ state: { sp: new URLSearchParams() } }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => state.sp,
  usePathname: () => "/dashboard/reports/positivation",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

import { Toast } from "@/components/Toast";
import { ReportFilters } from "../interface";
import { POSITIVATION_REPORT_QUERY } from "./gql";
import { usePositivationReport } from "./usePositivationReport";

const money = (value: string) => value.replace(/\u00a0/g, " ");

const FILTERS: ReportFilters = {
  from: "2026-09-01",
  to: "2026-09-30",
  sellerId: null,
  factoryId: null,
};

const cell = (factoryId: string, isPositivated: boolean) => ({
  __typename: "PositivationCell",
  factoryId,
  factoryName: factoryId === "f1" ? "HERC" : "Silvana",
  isLinked: true,
  isPositivated,
  orderCount: isPositivated ? 1 : 0,
  totalAmount: isPositivated ? "1000.00" : "0",
  lastOrderDate: isPositivated ? "2026-09-15" : null,
});

const clientRow = (
  clientId: string,
  positivatedFactories: number,
  cells: ReturnType<typeof cell>[]
) => ({
  __typename: "PositivationRow",
  clientId,
  companyClientId: `cc-${clientId}`,
  clientName: `Cliente ${clientId}`,
  sellerId: "s1",
  sellerName: "Rafael",
  linkedFactories: cells.length,
  positivatedFactories,
  orderCount: positivatedFactories,
  totalAmount: `${positivatedFactories * 1000}.00`,
  lastOrderDate: "2026-09-15",
  cells,
});

const REPORT = {
  __typename: "PositivationReportType",
  walletClients: 3,
  positivatedClients: 2,
  clientPositivationRate: 0.6667,
  linkedPairs: 6,
  positivatedPairs: 3,
  pairPositivationRate: 0.5,
  totalAmount: "3000.00",
  factories: [
    {
      __typename: "PositivationFactory",
      factoryId: "f1",
      factoryName: "HERC",
      linkedClients: 3,
      positivatedClients: 2,
      positivationRate: 0.6667,
      totalAmount: "2000.00",
    },
    {
      __typename: "PositivationFactory",
      factoryId: "f2",
      factoryName: "Silvana",
      linkedClients: 3,
      positivatedClients: 1,
      positivationRate: 0.3333,
      totalAmount: "1000.00",
    },
  ],
  rows: [
    clientRow("c1", 2, [cell("f1", true), cell("f2", true)]),
    clientRow("c2", 1, [cell("f1", true), cell("f2", false)]),
    clientRow("c3", 0, [cell("f1", false), cell("f2", false)]),
  ],
};

const reportMock = (report: unknown = REPORT) => ({
  request: {
    query: POSITIVATION_REPORT_QUERY,
    variables: { from: FILTERS.from, to: FILTERS.to, sellerId: null },
  },
  maxUsageCount: 5,
  result: { data: { positivationReport: report } },
});

const wrapper = (mocks: unknown[]) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Toast.ToastProvider>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- mocks do MockLink */}
      <MockedProvider mocks={mocks as any}>{children}</MockedProvider>
    </Toast.ToastProvider>
  );
  return Wrapper;
};

const run = async (mocks: unknown[] = [reportMock()]) => {
  const { result } = renderHook(() => usePositivationReport(FILTERS), {
    wrapper: wrapper(mocks),
  });
  await waitFor(() => expect(result.current.loading).toBe(false));
  return result;
};

beforeEach(() => {
  state.sp = new URLSearchParams();
  vi.spyOn(window.history, "replaceState").mockImplementation(() => {});
});

describe("usePositivationReport", () => {
  it("traz a matriz inteira — quem não comprou é o assunto do papel", async () => {
    const result = await run();

    expect(result.current.rows).toHaveLength(3);
    expect(result.current.chart.hasData).toBe(true);
  });

  it("mede a positivação por cliente e por vínculo", async () => {
    // A taxa por vínculo é a que revela o cliente fiel a uma fábrica e fechado
    // nas outras — a por cliente sozinha esconderia isso.
    const result = await run();

    expect(result.current.kpis[0].value).toContain("67");
    expect(result.current.kpis[0].hint).toBe("2 de 3 cliente(s)");
    expect(result.current.kpis[1].value).toContain("50");
    expect(result.current.kpis[1].hint).toBe("3 de 6 vínculo(s)");
  });

  it("conta os zerados e cobra atenção enquanto houver algum", async () => {
    const result = await run();

    expect(result.current.kpis[2].value).toBe("1");
    expect(result.current.kpis[2].status).toBe("urgente");
    expect(money(result.current.kpis[3].value)).toBe("R$ 3.000,00");
  });

  it("carteira toda positivada fecha o alerta", async () => {
    const result = await run([
      reportMock({
        ...REPORT,
        walletClients: 2,
        positivatedClients: 2,
        clientPositivationRate: 1,
        rows: [clientRow("c1", 2, [cell("f1", true), cell("f2", true)])],
      }),
    ]);

    expect(result.current.kpis[2].value).toBe("0");
    expect(result.current.kpis[2].status).toBe("ok");
    expect(result.current.kpis[0].status).toBe("ok");
  });

  it("isola os zerados sem mexer nas taxas do topo", async () => {
    const result = await run();

    act(() => result.current.setFilter("positivated", "no"));

    await waitFor(() =>
      expect(result.current.rows.map((row) => row.clientId)).toEqual(["c3"])
    );
    expect(result.current.kpis[0].hint).toBe("2 de 3 cliente(s)");
  });

  it("filtrar por fábrica responde 'quem comprou desta' pela célula", async () => {
    const result = await run();

    act(() => result.current.setFilter("factoryId", "f2"));

    await waitFor(() =>
      expect(result.current.rows.map((row) => row.clientId)).toEqual(["c1"])
    );
  });

  it("período sem carteira não quebra as taxas", async () => {
    const result = await run([reportMock(null)]);

    expect(result.current.kpis[2].value).toBe("0");
    expect(result.current.chart.hasData).toBe(false);
    expect(result.current.hasRows).toBe(false);
  });
});
