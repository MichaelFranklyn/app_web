import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { state } = vi.hoisted(() => ({ state: { sp: new URLSearchParams() } }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => state.sp,
  usePathname: () => "/dashboard/reports/commissions",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

import { Toast } from "@/components/Toast";
import { ReportFilters } from "../interface";
import {
  COMMISSIONS_REPORT_EXPORT_QUERY,
  COMMISSIONS_REPORT_QUERY,
} from "./gql";
import {
  COMMISSIONS_EXPORT_PAGE,
  useCommissionsReport,
} from "./useCommissionsReport";

const money = (value: string) => value.replace(/\u00a0/g, " ");

const FILTERS: ReportFilters = {
  from: "2026-09-01",
  to: "2026-09-30",
  sellerId: null,
  factoryId: null,
};

const parcela = (
  installmentId: string,
  status: string,
  amount: string,
  receiveDate: string | null,
  extra: Partial<{ sellerAmount: string; factoryId: string }> = {}
) => ({
  __typename: "CommissionRowType",
  orderId: `o-${installmentId}`,
  installmentId,
  sequence: 1,
  orderDate: "2026-08-20",
  invoicedAt: "2026-09-01",
  invoiceNumber: "12345",
  dueDate: "2026-09-30",
  paidAt: null,
  installmentAmount: "10000.00",
  amount,
  status,
  receiveDate,
  isReceivable: status === "receivable",
  isReceived: status === "received",
  isReconciled: false,
  reconciledAt: null,
  isOverdue: false,
  defaultedAt: null,
  sellerAmount: extra.sellerAmount ?? "100.00",
  sellerStatus: status,
  sellerReceiveDate: receiveDate,
  isSellerPaid: false,
  client: {
    __typename: "ClientType",
    id: "c1",
    razaoSocial: "ALTO LTDA",
    nomeFantasia: "Alto",
  },
  factory: {
    __typename: "FactoryType",
    id: extra.factoryId ?? "f1",
    nomeFantasia: "HERC",
    nickname: null,
    razaoSocial: "HERC SA",
  },
  seller: { __typename: "UserType", id: "s1", name: "Rafael" },
});

const totals = (over: Record<string, unknown> = {}) => ({
  __typename: "CommissionReportTotalsType",
  receivable: "300.00",
  received: "200.00",
  pending: "0",
  count: 2,
  countReceivable: 1,
  chargeback: "0",
  countOverdue: 0,
  company: "500.00",
  seller: "180.00",
  office: "320.00",
  margin: 0.64,
  ...over,
});

const PAGE = [
  parcela("i1", "receivable", "300.00", "2026-09-10"),
  parcela("i2", "received", "200.00", "2026-09-20", {
    sellerAmount: "80.00",
    factoryId: "f2",
  }),
];

const BASE_INPUT = { from: "2026-09-01", to: "2026-09-30", sellerId: null };

const reportMock = ({
  input = {},
  rows = PAGE,
  totalCount = 2,
  period = totals(),
  filtered = totals(),
  byFactory = [
    {
      __typename: "CommissionReportFactoryType",
      factoryId: "f1",
      name: "HERC",
      receivable: "300.00",
      received: "0",
      pending: "0",
      count: 1,
      company: "300.00",
      seller: "100.00",
      office: "200.00",
      margin: 0.66,
    },
  ],
}: {
  input?: Record<string, unknown>;
  rows?: unknown[];
  totalCount?: number;
  period?: unknown;
  filtered?: unknown;
  byFactory?: unknown[];
} = {}) => ({
  request: {
    query: COMMISSIONS_REPORT_QUERY,
    variables: {
      input: { ...BASE_INPUT, first: 20, offset: 0, ...input },
    },
  },
  maxUsageCount: 5,
  result: {
    data: {
      commissions_report: {
        __typename: "CommissionReportType",
        totalCount,
        periodCount: 2,
        periodTotals: period,
        filteredTotals: filtered,
        byFactory,
        factoryOptions: [
          {
            __typename: "CommissionReportOptionType",
            value: "f1",
            label: "HERC",
          },
        ],
        sellerOptions: [],
        statusOptions: [
          {
            __typename: "CommissionReportOptionType",
            value: "receivable",
            label: "A receber",
          },
        ],
        rows,
      },
    },
  },
});

const exportMock = (offset: number, rows: unknown[], totalCount: number) => ({
  request: {
    query: COMMISSIONS_REPORT_EXPORT_QUERY,
    variables: {
      input: { ...BASE_INPUT, first: COMMISSIONS_EXPORT_PAGE, offset },
    },
  },
  result: {
    data: {
      commissions_report_export: {
        __typename: "CommissionReportType",
        totalCount,
        rows,
      },
    },
  },
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

const run = async (withOffice = true, mocks: unknown[] = [reportMock()]) => {
  const { result } = renderHook(
    () => useCommissionsReport(FILTERS, withOffice),
    { wrapper: wrapper(mocks) }
  );
  await waitFor(() => expect(result.current.kpisLoading).toBe(false));
  return result;
};

beforeEach(() => {
  state.sp = new URLSearchParams();
  vi.spyOn(window.history, "replaceState").mockImplementation(() => {});
});

describe("useCommissionsReport — paginado no servidor", () => {
  it("pede ao servidor o período e a página, e mostra só a página", async () => {
    const result = await run();

    expect(result.current.pageRows.map((row) => row.installmentId)).toEqual([
      "i1",
      "i2",
    ]);
    expect(result.current.totalItems).toBe(2);
  });

  it("a página da URL vira o deslocamento da consulta", async () => {
    state.sp = new URLSearchParams("page=3");
    const result = await run(true, [
      reportMock({ input: { offset: 40 }, totalCount: 45 }),
    ]);

    expect(result.current.currentPage).toBe(3);
    expect(result.current.totalPages).toBe(3);
  });

  it("o topo fecha o período com os totais do servidor", async () => {
    const result = await run();

    expect(money(result.current.kpis[0].value)).toBe("R$ 300,00");
    expect(money(result.current.kpis[1].value)).toBe("R$ 200,00");
    expect(money(result.current.kpis[3].value)).toBe("R$ 500,00");
    expect(result.current.kpis[0].hint).toContain("1 parcela(s)");
  });

  it("para quem gerencia, mostra o que fica e o que é repassado", async () => {
    const result = await run(true);
    const labels = result.current.kpis.map((kpi) => kpi.label);

    expect(labels).toContain("Comissão da empresa");
    expect(money(result.current.kpis[4].value)).toBe("R$ 180,00");
    expect(money(result.current.kpis[5].value)).toBe("R$ 320,00");
    expect(result.current.split.margin).toBeCloseTo(0.64);
  });

  it("para o vendedor, não existe repartição — o valor já é o dele", async () => {
    const result = await run(false);
    const labels = result.current.kpis.map((kpi) => kpi.label);

    expect(labels).toContain("Total do período");
    expect(labels).not.toContain("Repasse aos vendedores");
    expect(result.current.kpis).toHaveLength(4);
  });

  it("filtrar vai ao servidor: muda a tabela e o rodapé, não o topo", async () => {
    const result = await run(true, [
      reportMock(),
      reportMock({
        input: { factoryId: "f2" },
        rows: [PAGE[1]],
        totalCount: 1,
        filtered: totals({ receivable: "0", received: "200.00" }),
      }),
    ]);

    act(() => result.current.setFilter("factoryId", "f2"));

    await waitFor(() => expect(result.current.pageRows).toHaveLength(1));
    expect(result.current.filteredTotals.received).toBe(200);
    expect(result.current.filteredTotals.receivable).toBe(0);
    expect(money(result.current.kpis[3].value)).toBe("R$ 500,00");
  });

  it("o rodapé soma TODAS as linhas filtradas, não a página", async () => {
    const result = await run(true, [
      reportMock({
        totalCount: 60,
        filtered: totals({ receivable: "9000.00" }),
      }),
    ]);

    expect(result.current.filteredTotals.receivable).toBe(9000);
  });

  it("sem repasse configurado, o gráfico da repartição não aparece", async () => {
    const result = await run(true, [
      reportMock({ period: totals({ seller: "0" }) }),
    ]);

    expect(result.current.chart.hasData).toBe(true);
    expect(result.current.splitChart.hasData).toBe(false);
  });

  it("exportar varre as páginas no servidor, qualquer que seja a página aberta", async () => {
    state.sp = new URLSearchParams("page=2");
    const full = Array.from({ length: COMMISSIONS_EXPORT_PAGE }, (_, i) =>
      parcela(`e${i}`, "received", "1.00", "2026-09-10")
    );
    const result = await run(true, [
      reportMock({ input: { offset: 20 }, totalCount: 501 }),
      exportMock(0, full, 501),
      exportMock(
        COMMISSIONS_EXPORT_PAGE,
        [parcela("ultima", "received", "1.00", "2026-09-30")],
        501
      ),
    ]);

    const exported = await result.current.fetchAllRows();

    expect(exported).toHaveLength(501);
    expect(exported.at(-1)?.installmentId).toBe("ultima");
  });
});
