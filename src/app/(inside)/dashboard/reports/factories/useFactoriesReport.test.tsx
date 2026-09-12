import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { state } = vi.hoisted(() => ({ state: { sp: new URLSearchParams() } }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => state.sp,
  usePathname: () => "/dashboard/reports/factories",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

import { Toast } from "@/components/Toast";
import { ReportFilters } from "../interface";
import { FACTORY_ORDERS_REPORT_QUERY } from "./gql";
import { useFactoriesReport } from "./useFactoriesReport";

const money = (value: string) => value.replace(/\u00a0/g, " ");

const FILTERS: ReportFilters = {
  from: "2026-09-01",
  to: "2026-09-30",
  sellerId: null,
  factoryId: null,
};

const factory = (
  entityId: string,
  entityName: string,
  totalAmount: string,
  share: string,
  invoicedAmount = "0"
) => ({
  __typename: "FactoryOrdersRow",
  entityId,
  entityName,
  orderCount: 2,
  totalAmount,
  avgTicket: "500.00",
  clientCount: 2,
  invoicedCount: 1,
  invoicedAmount,
  commissionAmount: "30.00",
  lastOrderDate: "2026-09-20",
  share,
});

const ROWS = [
  factory("f1", "HERC", "6000.00", "0.6", "3000.00"),
  factory("f2", "Silvana", "4000.00", "0.4"),
];

const reportMock = (rows: unknown[] | null = ROWS) => ({
  request: {
    query: FACTORY_ORDERS_REPORT_QUERY,
    variables: { from: FILTERS.from, to: FILTERS.to, sellerId: null },
  },
  maxUsageCount: 5,
  result: { data: { factoryOrdersReport: rows } },
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
  const { result } = renderHook(() => useFactoriesReport(FILTERS), {
    wrapper: wrapper(mocks),
  });
  await waitFor(() => expect(result.current.loading).toBe(false));
  return result;
};

beforeEach(() => {
  state.sp = new URLSearchParams();
  vi.spyOn(window.history, "replaceState").mockImplementation(() => {});
});

describe("useFactoriesReport", () => {
  it("soma o período a partir das linhas, sem uma segunda conta no servidor", async () => {
    // Somar de novo no servidor abriria a porta para os dois números divergirem.
    const result = await run();

    expect(result.current.kpis[0].value).toBe("2");
    expect(money(result.current.kpis[1].value)).toBe("R$ 10.000,00");
    expect(result.current.kpis[0].hint).toContain("4 pedido(s)");
  });

  it("mostra quanto do colocado já virou faturamento", async () => {
    const result = await run();
    const faturado = result.current.kpis[2];

    expect(money(faturado.value)).toBe("R$ 3.000,00");
    expect(faturado.hint).toContain("30");
  });

  it("acende o alerta quando uma fábrica passa de metade da receita", async () => {
    // Uma fábrica com metade da receita é meia empresa dependendo de um
    // contrato: é o risco da representação.
    const result = await run();
    const maior = result.current.kpis[3];

    expect(maior.hint).toBe("HERC");
    expect(maior.status).toBe("urgente");
  });

  it("carteira de representadas equilibrada não é alarme", async () => {
    const result = await run([
      reportMock([
        factory("f1", "HERC", "3000.00", "0.3"),
        factory("f2", "Silvana", "3000.00", "0.3"),
      ]),
    ]);

    expect(result.current.kpis[3].status).toBe("neutral");
  });

  it("período sem pedido diz isso com todas as letras", async () => {
    const result = await run([reportMock(null)]);

    expect(result.current.kpis[3].value).toBe("—");
    expect(result.current.kpis[3].hint).toBe("sem pedidos no período");
    expect(result.current.kpis[2].hint).toBe("nada faturado ainda");
    expect(result.current.chart.hasData).toBe(false);
  });

  it("filtrar uma fábrica muda a tabela, não o tamanho do mês", async () => {
    const result = await run();

    act(() => result.current.setFilter("factoryId", "f2"));

    await waitFor(() => expect(result.current.rows).toHaveLength(1));
    expect(money(result.current.kpis[1].value)).toBe("R$ 10.000,00");
    expect(await result.current.fetchAllRows()).toHaveLength(1);
  });

  it("separa quem já faturou de quem não faturou nada", async () => {
    const result = await run();

    act(() => result.current.setFilter("invoiced", "no"));

    await waitFor(() =>
      expect(result.current.rows.map((row) => row.entityName)).toEqual([
        "Silvana",
      ])
    );
  });
});
