import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { Toast } from "@/components/Toast";
import {
  SAVE_VISIT_STOCK_OBSERVATIONS_MUTATION,
  VISIT_STOCK_CANDIDATES_QUERY,
  VISIT_STOCK_OBSERVATIONS_QUERY,
} from "./gql";
import { useStockObservation } from "./useStockObservation";

const ITEM = "item-1";

const product = (
  id: string,
  isDecisive = false,
  daysSinceStockout: number | null = 3
) => ({
  __typename: "StockCandidateProduct",
  id,
  name: `Produto ${id}`,
  sku: `SKU-${id}`,
  daysSinceStockout,
  signalConfidence: "historico",
  isDecisive,
});

const group = (
  factoryId: string,
  products: ReturnType<typeof product>[],
  source = "LAST_ORDER"
) => ({
  __typename: "StockCandidateGroup",
  sellerClientFactoryId: `scf-${factoryId}`,
  sellerId: "s1",
  clientId: "c1",
  isFocus: factoryId === "f1",
  source,
  lastOrderDate: "2026-08-01",
  factory: {
    __typename: "FactoryType",
    id: factoryId,
    nomeFantasia: factoryId === "f1" ? "HERC" : "Silvana",
    nickname: null,
    razaoSocial: "Fábrica SA",
  },
  products,
});

const candidatesMock = (groups: unknown[]) => ({
  request: { query: VISIT_STOCK_CANDIDATES_QUERY, variables: { itemId: ITEM } },
  maxUsageCount: 5,
  result: { data: { visitStockCandidates: groups } },
});

const observationsMock = (
  observations: { productId: string; daysRemaining: number | null }[]
) => ({
  request: {
    query: VISIT_STOCK_OBSERVATIONS_QUERY,
    variables: { itemId: ITEM, input: { first: 100 } },
  },
  maxUsageCount: 5,
  result: {
    data: {
      visitStockObservations: {
        __typename: "StockObservationConnection",
        edges: observations.map((obs, index) => ({
          __typename: "StockObservationEdge",
          node: {
            __typename: "StockObservationType",
            id: `obs-${index}`,
            productId: obs.productId,
            daysRemaining: obs.daysRemaining,
            observation: "ANSWERED",
            notes: null,
          },
        })),
      },
    },
  },
});

const saveMock = (
  observations: { productId: string; daysRemaining: number | null }[],
  ok = true
) => ({
  request: {
    query: SAVE_VISIT_STOCK_OBSERVATIONS_MUTATION,
    variables: { itemId: ITEM, observations },
  },
  result: {
    data: {
      saveVisitStockObservations: {
        __typename: "StockObservationResponse",
        status: ok,
        message: ok ? "Estoque registrado" : "Visita já encerrada",
        data: ok ? { __typename: "StockObservationType", id: "obs-1" } : null,
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

const run = (mocks: unknown[]) => {
  const onSaved = vi.fn();
  const { result } = renderHook(() => useStockObservation(ITEM, onSaved), {
    wrapper: wrapper(mocks),
  });
  return { result, onSaved };
};

describe("useStockObservation", () => {
  it("pergunta pelo estoque de TODAS as fábricas do cliente", async () => {
    // O vendedor foi por causa de uma fábrica, mas aproveita a ida para
    // levantar o resto do que o cliente tem na prateleira.
    const { result } = run([
      candidatesMock([
        group("f1", [product("p1", true), product("p2")]),
        group("f2", [product("p3")]),
      ]),
      observationsMock([]),
    ]);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.groups).toHaveLength(2);
    expect(result.current.totalProducts).toBe(3);
  });

  it("reabre com o que já foi respondido nesta visita", async () => {
    const { result } = run([
      candidatesMock([group("f1", [product("p1"), product("p2")])]),
      observationsMock([{ productId: "p1", daysRemaining: 7 }]),
    ]);

    await waitFor(() => expect(result.current.daysMap.p1).toBe(7));
    expect(result.current.selectedCount).toBe(1);
  });

  it("observação antiga sem o número entra como não respondida", async () => {
    const { result } = run([
      candidatesMock([group("f1", [product("p1")])]),
      observationsMock([{ productId: "p1", daysRemaining: null }]),
    ]);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.selectedCount).toBe(0);
  });

  it("tocar de novo no mesmo atalho desmarca o produto", async () => {
    const { result } = run([
      candidatesMock([group("f1", [product("p1")])]),
      observationsMock([]),
    ]);
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setDays("p1", 15));
    expect(result.current.selectedCount).toBe(1);

    act(() => result.current.setDays("p1", 15));
    expect(result.current.daysMap.p1).toBeNull();
    expect(result.current.selectedCount).toBe(0);
  });

  it("salva só o que o cliente respondeu", async () => {
    // O produto não perguntado não vira uma resposta inventada — é ele que
    // corrige a previsão de esgotamento no backend.
    const { result, onSaved } = run([
      candidatesMock([group("f1", [product("p1"), product("p2")])]),
      observationsMock([]),
      saveMock([{ productId: "p1", daysRemaining: 15 }]),
    ]);
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setDays("p1", 15));
    await act(() => result.current.handleSave());

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  });

  it("fábrica sem nada a observar ainda aparece — ela serve para lançar pedido", async () => {
    const { result } = run([
      candidatesMock([group("f2", [], "NO_PRODUCTS")]),
      observationsMock([]),
    ]);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.groups).toHaveLength(1);
    expect(result.current.totalProducts).toBe(0);
  });

  it("recusa do backend não fecha a visita como se tivesse salvado", async () => {
    const { result, onSaved } = run([
      candidatesMock([group("f1", [product("p1")])]),
      observationsMock([]),
      saveMock([{ productId: "p1", daysRemaining: 15 }], false),
    ]);
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setDays("p1", 15));
    await act(() => result.current.handleSave());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(onSaved).not.toHaveBeenCalled();
  });
});
