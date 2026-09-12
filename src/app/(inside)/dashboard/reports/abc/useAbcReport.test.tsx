import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { state } = vi.hoisted(() => ({ state: { sp: new URLSearchParams() } }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => state.sp,
  usePathname: () => "/dashboard/reports/abc",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

import { Toast } from "@/components/Toast";
import { ReportFilters } from "../interface";
import { CLIENT_ABC_CURVE_QUERY } from "./gql";
import { useAbcReport } from "./useAbcReport";

const FILTERS: ReportFilters = {
  from: "2026-09-01",
  to: "2026-09-30",
  sellerId: null,
  factoryId: null,
};

const client = (
  clientId: string,
  rank: number,
  totalAmount: string,
  abcClass: "A" | "B" | "C"
) => ({
  __typename: "AbcCurveRow",
  clientId,
  clientName: `Cliente ${clientId}`,
  rank,
  totalAmount,
  orderCount: 2,
  commissionAmount: "100.00",
  share: "0.1",
  cumulativeShare: "0.5",
  abcClass,
  lastOrderDate: "2026-09-20",
});

/** Dez clientes: 1 classe A que faz 80% do faturamento — a leitura de risco. */
const CURVE = [
  client("c1", 1, "80000.00", "A"),
  client("c2", 2, "6000.00", "B"),
  client("c3", 3, "4000.00", "B"),
  ...Array.from({ length: 7 }, (_, i) =>
    client(`c${i + 4}`, i + 4, "1428.57", "C")
  ),
];

const curveMock = (rows: unknown[] | null = CURVE, filters = FILTERS) => ({
  request: {
    query: CLIENT_ABC_CURVE_QUERY,
    variables: {
      from: filters.from,
      to: filters.to,
      sellerId: filters.sellerId,
      factoryId: filters.factoryId,
    },
  },
  maxUsageCount: 5,
  result: { data: { clientAbcCurve: rows } },
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

const run = async (mocks: unknown[] = [curveMock()], filters = FILTERS) => {
  const { result } = renderHook(() => useAbcReport(filters), {
    wrapper: wrapper(mocks),
  });
  await waitFor(() => expect(result.current.loading).toBe(false));
  return result;
};

beforeEach(() => {
  state.sp = new URLSearchParams();
  vi.spyOn(window.history, "replaceState").mockImplementation(() => {});
});

describe("useAbcReport", () => {
  it("traz a curva inteira, cauda incluída", async () => {
    // Um ranking dos 10 maiores responderia outra pergunta: a curva existe
    // justamente para olhar a classe C.
    const result = await run();

    expect(result.current.allRows).toHaveLength(10);
    expect(result.current.chart.hasData).toBe(true);
  });

  it("mede a concentração e acende o alerta quando poucos seguram tudo", async () => {
    // 1 cliente em 10 (10%) fazendo 80% do faturamento é risco, não mérito: se
    // ele sai, sai o mês junto.
    const result = await run();
    const classeA = result.current.kpis[1];

    expect(classeA.value).toBe("1");
    expect(classeA.hint).toContain("10");
    expect(classeA.hint).toContain("80");
    expect(classeA.status).toBe("urgente");
  });

  it("carteira distribuída não vira alarme", async () => {
    const distribuida = Array.from({ length: 4 }, (_, i) =>
      client(`c${i + 1}`, i + 1, "1000.00", "A")
    );
    const result = await run([curveMock(distribuida)]);

    expect(result.current.kpis[1].status).toBe("ok");
  });

  it("os KPIs continuam falando da curva inteira ao filtrar uma classe", async () => {
    // A pergunta do relatório é de concentração e se responde com o todo; o
    // filtro por classe serve para trabalhar a lista DEPOIS da leitura.
    const result = await run();

    act(() => result.current.setFilter("abcClass", "C"));

    await waitFor(() => expect(result.current.rows).toHaveLength(7));
    expect(result.current.kpis[0].value).toBe("10");
    expect(result.current.kpis[1].value).toBe("1");
  });

  it("período sem faturamento não quebra a conta de concentração", async () => {
    const result = await run([curveMock(null)]);

    expect(result.current.kpis[0].value).toBe("0");
    expect(result.current.kpis[1].hint).toContain("0");
    expect(result.current.hasRows).toBe(false);
  });

  it("com fábrica escolhida, as classes são recalculadas só sobre ela", async () => {
    // O cliente grande numa representada pode ser pequeno na outra — é essa a
    // pergunta que o filtro de fábrica responde, e por isso ele vai ao backend.
    const comFabrica = { ...FILTERS, factoryId: "f-1" };
    const result = await run(
      [curveMock([client("c1", 1, "500.00", "A")], comFabrica)],
      comFabrica
    );

    expect(result.current.allRows).toHaveLength(1);
  });

  it("exporta o que está à vista, filtro aplicado", async () => {
    const result = await run();

    act(() => result.current.setFilter("abcClass", "B"));
    await waitFor(() => expect(result.current.rows).toHaveLength(2));

    const exported = await result.current.fetchAllRows();
    expect(exported.map((row) => row.clientId)).toEqual(["c2", "c3"]);
  });
});
