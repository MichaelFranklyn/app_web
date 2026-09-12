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
import { COMMISSIONS_REPORT_QUERY } from "./gql";
import { useCommissionsReport } from "./useCommissionsReport";

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
  __typename: "CommissionRow",
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

/** Duas parcelas do mês e uma que cai no mês seguinte. */
const ROWS = [
  parcela("i1", "receivable", "300.00", "2026-09-10"),
  parcela("i2", "received", "200.00", "2026-09-20", {
    sellerAmount: "80.00",
    factoryId: "f2",
  }),
  parcela("i3", "receivable", "999.00", "2026-10-05"),
];

const reportMock = (rows: unknown[] = ROWS) => ({
  request: {
    query: COMMISSIONS_REPORT_QUERY,
    variables: { sellerId: null },
  },
  maxUsageCount: 5,
  result: {
    data: {
      commissions_report: {
        __typename: "CommissionsReportType",
        totalReceivable: "300.00",
        totalReceived: "200.00",
        totalPending: "0",
        countReceivable: 1,
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
  await waitFor(() => expect(result.current.loading).toBe(false));
  return result;
};

beforeEach(() => {
  state.sp = new URLSearchParams();
  vi.spyOn(window.history, "replaceState").mockImplementation(() => {});
});

describe("useCommissionsReport", () => {
  it("recorta pela data em que a comissão CAI, não pela do pedido", async () => {
    // A query traz todas as parcelas do vendedor; o mês é decidido aqui, pela
    // `receiveDate` — é ela que responde "quanto entra em setembro".
    const result = await run();

    expect(result.current.rows.map((row) => row.installmentId)).toEqual([
      "i1",
      "i2",
    ]);
  });

  it("o topo fecha o período: a receber, recebido e o total", async () => {
    const result = await run();

    expect(money(result.current.kpis[0].value)).toBe("R$ 300,00");
    expect(money(result.current.kpis[1].value)).toBe("R$ 200,00");
    expect(money(result.current.kpis[3].value)).toBe("R$ 500,00");
    expect(result.current.kpis[0].hint).toContain("1 parcela(s)");
  });

  it("para quem gerencia, mostra o que fica e o que é repassado", async () => {
    // A comissão tem dois níveis: a fábrica paga o escritório, o escritório
    // repassa o vendedor. A diferença é o que sobra para a empresa.
    const result = await run(true);
    const labels = result.current.kpis.map((kpi) => kpi.label);

    expect(labels).toContain("Comissão da empresa");
    expect(labels).toContain("Repasse aos vendedores");
    expect(money(result.current.kpis[4].value)).toBe("R$ 180,00");
    expect(money(result.current.kpis[5].value)).toBe("R$ 320,00");
    expect(result.current.split.margin).toBeCloseTo(0.64);
  });

  it("para o vendedor, não existe repartição — o valor já é o dele", async () => {
    // Mostrar "repasse" no extrato dele daria zero e confundiria.
    const result = await run(false);
    const labels = result.current.kpis.map((kpi) => kpi.label);

    expect(labels).toContain("Total do período");
    expect(labels).not.toContain("Repasse aos vendedores");
    expect(result.current.kpis).toHaveLength(4);
  });

  it("o estorno entra negativo no a receber — o papel mostra o líquido", async () => {
    // Senão o relatório promete um valor que a fábrica desconta no mesmo
    // fechamento.
    const result = await run(true, [
      reportMock([
        parcela("i1", "receivable", "300.00", "2026-09-10"),
        parcela("i2", "chargeback", "-100.00", "2026-09-15"),
      ]),
    ]);

    expect(money(result.current.kpis[0].value)).toBe("R$ 200,00");
  });

  it("filtrar uma fábrica muda a tabela, não o fechamento do mês", async () => {
    const result = await run();

    act(() => result.current.setFilter("factoryId", "f2"));

    await waitFor(() => expect(result.current.rows).toHaveLength(1));
    expect(money(result.current.kpis[3].value)).toBe("R$ 500,00");
  });

  it("sem repasse configurado, o gráfico da repartição não aparece", async () => {
    // Uma barra de cor só repetiria o gráfico de cima.
    const result = await run(true, [
      reportMock([
        parcela("i1", "receivable", "300.00", "2026-09-10", {
          sellerAmount: "0",
        }),
      ]),
    ]);

    expect(result.current.chart.hasData).toBe(true);
    expect(result.current.splitChart.hasData).toBe(false);
  });

  it("exportar não volta à rede: o conjunto já está em memória", async () => {
    const result = await run();

    const exported = await result.current.fetchAllRows();

    expect(exported.map((row) => row.installmentId)).toEqual(["i1", "i2"]);
  });
});
