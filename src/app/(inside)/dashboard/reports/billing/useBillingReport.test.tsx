import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// A tabela local guarda filtro, ordenação e página na URL (o link leva ao
// mesmo papel), então o App Router entra mockado.
const { state } = vi.hoisted(() => ({ state: { sp: new URLSearchParams() } }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => state.sp,
  usePathname: () => "/dashboard/reports/billing",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

import { Toast } from "@/components/Toast";
import { ReportFilters } from "../interface";
import { BILLING_REPORT_QUERY } from "./gql";
import { useBillingReport } from "./useBillingReport";

const money = (value: string) => value.replace(/\u00a0/g, " ");

const FILTERS: ReportFilters = {
  from: "2026-09-01",
  to: "2026-09-30",
  sellerId: null,
  factoryId: null,
};

const row = (
  installmentId: string,
  situation: "DUE" | "OVERDUE" | "PAID",
  amount: string,
  factory = "HERC"
) => ({
  __typename: "BillingReportRow",
  installmentId,
  orderId: `o-${installmentId}`,
  sequence: 1,
  clientId: "c1",
  clientName: "Alto Construção",
  factoryId: `f-${factory}`,
  factoryName: factory,
  sellerId: "s1",
  sellerName: "Rafael",
  invoicedAt: "2026-09-01",
  dueDate: "2026-09-20",
  amount,
  commissionAmount: "30.00",
  situation,
  paidAt: situation === "PAID" ? "2026-09-18" : null,
  daysOverdue: situation === "OVERDUE" ? 5 : 0,
  isCommissionReceived: false,
});

const REPORT = {
  __typename: "BillingReportType",
  rows: [
    row("i1", "OVERDUE", "1000.00"),
    row("i2", "DUE", "2000.00", "Silvana"),
    row("i3", "PAID", "1000.00"),
  ],
  installmentCount: 3,
  orderCount: 2,
  totalAmount: "4000.00",
  paidAmount: "1000.00",
  dueAmount: "2000.00",
  overdueAmount: "1000.00",
  overdueCount: 1,
  commissionAmount: "120.00",
};

const reportMock = (report: unknown = REPORT) => ({
  request: {
    query: BILLING_REPORT_QUERY,
    variables: { from: FILTERS.from, to: FILTERS.to, sellerId: null },
  },
  maxUsageCount: 5,
  result: { data: { billingReport: report } },
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
  const { result } = renderHook(() => useBillingReport(FILTERS), {
    wrapper: wrapper(mocks),
  });
  await waitFor(() => expect(result.current.loading).toBe(false));
  return result;
};

beforeEach(() => {
  state.sp = new URLSearchParams();
  vi.spyOn(window.history, "replaceState").mockImplementation(() => {});
});

describe("useBillingReport", () => {
  it("traz a agenda inteira do período, sem paginar no servidor", async () => {
    // Esconder metade das parcelas num documento de conferência é esconder
    // justamente o boleto que se foi procurar.
    const result = await run();

    expect(result.current.rows).toHaveLength(3);
    expect(result.current.hasRows).toBe(true);
  });

  it("o topo é o fechamento do período, não a soma do que está à vista", async () => {
    // Filtrar "só as vencidas" muda a tabela; se o topo mudasse junto, trocar
    // de visão pareceria mudar o mês.
    const result = await run();

    act(() => result.current.setFilter("situation", "OVERDUE"));

    await waitFor(() => expect(result.current.rows).toHaveLength(1));
    expect(money(result.current.kpis[0].value)).toBe("R$ 4.000,00");
    expect(money(result.current.kpis[3].value)).toBe("R$ 1.000,00");
  });

  it("diz quanto do período está vencido, em dinheiro e em fatia", async () => {
    const result = await run();
    const vencido = result.current.kpis[1];

    expect(money(vencido.value)).toBe("R$ 1.000,00");
    expect(vencido.hint).toContain("1 parcela(s)");
    expect(vencido.hint).toContain("25");
    expect(vencido.status).toBe("urgente");
  });

  it("período sem atraso não acende alarme", async () => {
    const result = await run([
      reportMock({
        ...REPORT,
        rows: [row("i2", "DUE", "2000.00")],
        overdueAmount: "0",
        overdueCount: 0,
      }),
    ]);
    const vencido = result.current.kpis[1];

    // Com dinheiro no período e nada atrasado, o KPI fica verde e escreve a
    // fatia zerada; "nada vencido" é a frase do período sem parcela nenhuma.
    expect(vencido.status).toBe("ok");
    expect(vencido.hint).toContain("0 parcela(s)");
  });

  it("período sem parcela nenhuma mostra zeros, e não tela quebrada", async () => {
    const result = await run([reportMock(null)]);

    expect(result.current.rows).toEqual([]);
    expect(result.current.hasRows).toBe(false);
    expect(money(result.current.kpis[0].value)).toBe("R$ 0,00");
    expect(result.current.kpis[1].hint).toBe("nada vencido");
    expect(result.current.chart.hasData).toBe(false);
  });

  it("exporta o recorte à vista, e não a agenda inteira", async () => {
    // O arquivo tem de contar a mesma coisa que a tela: quem filtrou por
    // fábrica não quer o PDF das outras.
    const result = await run();

    act(() => result.current.setFilter("factoryId", "f-Silvana"));
    await waitFor(() => expect(result.current.rows).toHaveLength(1));

    const exported = await result.current.fetchAllRows();
    expect(exported.map((r) => r.installmentId)).toEqual(["i2"]);
  });
});
