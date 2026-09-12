import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { state } = vi.hoisted(() => ({ state: { sp: new URLSearchParams() } }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => state.sp,
  usePathname: () => "/dashboard/reports/wallet",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

import { Toast } from "@/components/Toast";
import { ReportFilters } from "../interface";
import { WALLET_STATUS_REPORT_QUERY } from "./gql";
import { useWalletReport } from "./useWalletReport";

const money = (value: string) => value.replace(/\u00a0/g, " ");

const FILTERS: ReportFilters = {
  from: "2026-09-01",
  to: "2026-09-30",
  sellerId: null,
  factoryId: null,
};

const client = (
  clientId: string,
  situation: string,
  state_: string,
  periodAmount = "1000.00"
) => ({
  __typename: "WalletStatusRow",
  clientId,
  companyClientId: `cc-${clientId}`,
  clientName: `Cliente ${clientId}`,
  city: "Salvador",
  state: state_,
  situation,
  lastOrderDate: "2026-08-01",
  daysSinceLastOrder: 42,
  avgIntervalDays: 30,
  riskRatio: "1.4",
  orderCount: 5,
  periodOrderCount: 1,
  periodAmount,
});

const REPORT = {
  __typename: "WalletStatusReportType",
  rows: [
    client("c1", "ACTIVE", "BA"),
    client("c2", "AT_RISK", "BA"),
    client("c3", "INACTIVE", "SE"),
    client("c4", "NEVER_BOUGHT", "BA", "0"),
  ],
  totalClients: 4,
  activeClients: 1,
  atRiskClients: 1,
  inactiveClients: 1,
  neverBoughtClients: 1,
  newClients: 1,
  periodAmount: "3000.00",
};

const reportMock = (report: unknown = REPORT) => ({
  request: {
    query: WALLET_STATUS_REPORT_QUERY,
    variables: { from: FILTERS.from, to: FILTERS.to, sellerId: null },
  },
  maxUsageCount: 5,
  result: { data: { walletStatusReport: report } },
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
  const { result } = renderHook(() => useWalletReport(FILTERS), {
    wrapper: wrapper(mocks),
  });
  await waitFor(() => expect(result.current.loading).toBe(false));
  return result;
};

beforeEach(() => {
  state.sp = new URLSearchParams();
  vi.spyOn(window.history, "replaceState").mockImplementation(() => {});
});

describe("useWalletReport", () => {
  it("traz a carteira inteira — quem sumiu é quem cairia fora de um top-N", async () => {
    const result = await run();

    expect(result.current.rows).toHaveLength(4);
    expect(result.current.kpis[0].value).toBe("4");
    expect(result.current.kpis[0].hint).toContain("1 novo(s)");
    expect(result.current.kpis[0].hint).toContain("1 sem nenhuma compra");
  });

  it("junta atrasado e parado: é uma fila de trabalho só", async () => {
    // Separar em dois cartões esconderia o tamanho do problema.
    const result = await run();
    const contato = result.current.kpis[2];

    expect(contato.value).toBe("2");
    expect(contato.hint).toBe("1 atrasado(s) · 1 parado(s)");
    expect(contato.status).toBe("urgente");
  });

  it("carteira toda em dia não pede contato", async () => {
    const result = await run([
      reportMock({
        ...REPORT,
        rows: [client("c1", "ACTIVE", "BA")],
        totalClients: 1,
        activeClients: 1,
        atRiskClients: 0,
        inactiveClients: 0,
        neverBoughtClients: 0,
      }),
    ]);

    expect(result.current.kpis[2].value).toBe("0");
    expect(result.current.kpis[2].status).toBe("ok");
    expect(result.current.kpis[1].hint).toContain("100");
  });

  it("o topo continua falando da carteira inteira ao filtrar uma situação", async () => {
    // Filtrar "atrasados" muda a tabela; o topo tem de continuar dizendo de que
    // tamanho é a carteira.
    const result = await run();

    act(() => result.current.setFilter("situation", "AT_RISK"));

    await waitFor(() => expect(result.current.rows).toHaveLength(1));
    expect(result.current.kpis[0].value).toBe("4");
    expect(money(result.current.kpis[3].value)).toBe("R$ 3.000,00");
  });

  it("filtra por UF sem mexer no fechamento", async () => {
    const result = await run();

    act(() => result.current.setFilter("state", "SE"));

    await waitFor(() =>
      expect(result.current.rows.map((row) => row.clientId)).toEqual(["c3"])
    );
    const exported = await result.current.fetchAllRows();
    expect(exported).toHaveLength(1);
  });

  it("carteira vazia não divide por zero", async () => {
    const result = await run([reportMock(null)]);

    expect(result.current.kpis[1].hint).toBe("carteira vazia");
    expect(result.current.chart.hasData).toBe(false);
    expect(result.current.hasRows).toBe(false);
  });
});
