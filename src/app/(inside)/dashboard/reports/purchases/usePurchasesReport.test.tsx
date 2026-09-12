import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { state } = vi.hoisted(() => ({ state: { sp: new URLSearchParams() } }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => state.sp,
  usePathname: () => "/dashboard/reports/purchases",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

import { Toast } from "@/components/Toast";
import { ReportFilters } from "../interface";
import { CLIENT_FACTORY_PURCHASES_QUERY } from "./gql";
import { usePurchasesReport } from "./usePurchasesReport";

const money = (value: string) => value.replace(/\u00a0/g, " ");

const FILTERS: ReportFilters = {
  from: "2026-09-01",
  to: "2026-09-30",
  sellerId: null,
  factoryId: null,
};

const par = (
  clientId: string,
  factoryId: string,
  situation: string,
  factoryName = "HERC"
) => ({
  __typename: "ClientFactoryPurchaseRow",
  clientId,
  companyClientId: `cc-${clientId}`,
  clientName: `Cliente ${clientId}`,
  city: "Salvador",
  state: "BA",
  factoryId,
  factoryName,
  sellerName: "Rafael",
  isLinked: true,
  situation,
  lastOrderId: "o1",
  lastOrderDate: "2026-08-01",
  lastOrderAmount: "1000.00",
  lastOrderStatus: "INVOICED",
  lastInvoicedAt: "2026-08-10",
  daysSinceLastOrder: 42,
  avgIntervalDays: 30,
  riskRatio: "1.4",
  orderCount: 3,
  historyAmount: "9000.00",
  periodOrderCount: 1,
  periodAmount: "1000.00",
});

const REPORT = {
  __typename: "ClientFactoryPurchasesReportType",
  rows: [
    par("c1", "f1", "ACTIVE"),
    par("c1", "f2", "AT_RISK", "Silvana"),
    par("c2", "f1", "INACTIVE"),
    par("c3", "f2", "NEVER_BOUGHT", "Silvana"),
  ],
  totalRows: 4,
  clientCount: 3,
  factoryCount: 2,
  neverBoughtRows: 1,
  atRiskRows: 1,
  inactiveRows: 1,
  periodOrderCount: 2,
  periodAmount: "2000.00",
};

const reportMock = (report: unknown = REPORT) => ({
  request: {
    query: CLIENT_FACTORY_PURCHASES_QUERY,
    variables: { from: FILTERS.from, to: FILTERS.to, sellerId: null },
  },
  maxUsageCount: 5,
  result: { data: { clientFactoryPurchasesReport: report } },
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
  const { result } = renderHook(() => usePurchasesReport(FILTERS), {
    wrapper: wrapper(mocks),
  });
  await waitFor(() => expect(result.current.loading).toBe(false));
  return result;
};

beforeEach(() => {
  state.sp = new URLSearchParams();
  vi.spyOn(window.history, "replaceState").mockImplementation(() => {});
});

describe("usePurchasesReport", () => {
  it("conta pares cliente × fábrica, não clientes", async () => {
    // Um cliente em dia com uma fábrica pode estar parado há meses em outra —
    // é essa segunda conversa que a reunião com a fábrica cobra.
    const result = await run();

    expect(result.current.kpis[0].value).toBe("4");
    expect(result.current.kpis[0].hint).toBe("3 cliente(s) em 2 fábrica(s)");
    expect(result.current.rows).toHaveLength(4);
  });

  it("junta atrasado e parado na mesma fila de trabalho", async () => {
    const result = await run();
    const fila = result.current.kpis[1];

    expect(fila.value).toBe("2");
    expect(fila.hint).toBe("1 atrasado(s) · 1 parado(s)");
    expect(fila.status).toBe("urgente");
  });

  it("separa quem nunca comprou daquela fábrica", async () => {
    // Vinculado sem nenhum pedido é outra conversa: não é abandono, é um
    // vínculo que nunca começou.
    const result = await run();

    expect(result.current.kpis[2].value).toBe("1");
    expect(result.current.kpis[2].status).toBe("atencao");
  });

  it("o topo fala do todo mesmo com a tabela filtrada", async () => {
    const result = await run();

    act(() => result.current.setFilter("situation", "INACTIVE"));

    await waitFor(() => expect(result.current.rows).toHaveLength(1));
    expect(result.current.kpis[0].value).toBe("4");
    expect(money(result.current.kpis[3].value)).toBe("R$ 2.000,00");
  });

  it("filtrar por fábrica é a leitura da reunião com a representada", async () => {
    const result = await run();

    act(() => result.current.setFilter("factoryId", "f2"));

    await waitFor(() => expect(result.current.rows).toHaveLength(2));
    const exported = await result.current.fetchAllRows();
    expect(exported.every((row) => row.factoryName === "Silvana")).toBe(true);
  });

  it("sem par nenhum, os cartões ficam em zero e o gráfico não aparece", async () => {
    const result = await run([reportMock(null)]);

    expect(result.current.kpis[1].status).toBe("ok");
    expect(result.current.kpis[2].status).toBe("ok");
    expect(result.current.chart.hasData).toBe(false);
    expect(result.current.hasRows).toBe(false);
  });
});
