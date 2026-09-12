import { MockedProvider } from "@apollo/client/testing/react";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import {
  CLIENT_PRODUCT_INSIGHTS_QUERY,
  CLIENT_VISIT_SCORES_QUERY,
} from "../../../gql";
import { useFactoryScoreDetail } from "./useFactoryScoreDetail";

const SCF = "scf1";

const scoresMock = (dates: string[]) => ({
  request: {
    query: CLIENT_VISIT_SCORES_QUERY,
    variables: {
      sellerClientFactoryId: SCF,
      input: { order: { by: "score_date", dir: "desc" }, first: 10 },
    },
  },
  maxUsageCount: 5,
  result: {
    data: {
      clientVisitScores: {
        __typename: "VisitScoreConnection",
        edges: dates.map((scoreDate, index) => ({
          __typename: "VisitScoreEdge",
          node: {
            __typename: "VisitScoreType",
            id: `sc${index}`,
            scoreDate,
            scoreTotal: 50,
            scoreUrgency: 20,
            scorePriority: 10,
            scoreFrequency: 8,
            scorePotential: 7,
            scoreRecency: 5,
            stockConfidence: "historico",
          },
        })),
        totalCount: dates.length,
      },
    },
  },
});

const insightsMock = (products: string[]) => ({
  request: {
    query: CLIENT_PRODUCT_INSIGHTS_QUERY,
    variables: {
      sellerClientFactoryId: SCF,
      input: {
        order: { by: "estimated_stockout_date", dir: "asc" },
        first: 20,
      },
    },
  },
  maxUsageCount: 5,
  result: {
    data: {
      clientProductInsights: {
        __typename: "ProductInsightConnection",
        edges: products.map((name, index) => ({
          __typename: "ProductInsightEdge",
          node: {
            __typename: "ClientProductInsightType",
            id: `pi${index}`,
            lastPurchaseDate: "2026-08-01",
            lastQuantity: "10",
            avgQuantity: "12",
            avgShelfDays: 30,
            avgIntervalDays: 35,
            estimatedStockoutDate: "2026-09-01",
            daysSinceStockout: 11,
            nextPurchaseEstimate: "2026-09-05",
            churnRisk: "MEDIUM",
            shelfDaysObservedAt: null,
            product: {
              __typename: "ProductType",
              id: `p${index}`,
              name,
              unit: { __typename: "UnitType", label: "Saco" },
            },
            recentPurchases: [],
          },
        })),
        totalCount: products.length,
      },
    },
  },
});

const wrapper = (mocks: unknown[]) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any -- mocks do MockLink */
    <MockedProvider mocks={mocks as any}>{children}</MockedProvider>
  );
  return Wrapper;
};

const run = (mocks: unknown[], scf: string | null = SCF) =>
  renderHook(() => useFactoryScoreDetail(scf), { wrapper: wrapper(mocks) })
    .result;

describe("useFactoryScoreDetail", () => {
  it("traz o histórico do vínculo e os produtos a repor", async () => {
    const result = run([
      scoresMock(["2026-09-10", "2026-09-03"]),
      insightsMock(["Cimento", "Argamassa"]),
    ]);

    await waitFor(() => expect(result.current.history).toHaveLength(2));
    await waitFor(() => expect(result.current.insights).toHaveLength(2));
  });

  it("modal fechado não busca nada", () => {
    // Um cliente tem dezenas de fábricas: carregar todas ao abrir a aba seria
    // desperdício. Sem mocks aqui — qualquer query faria o teste falhar.
    const result = run([], null);

    expect(result.current.history).toEqual([]);
    expect(result.current.insights).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("vínculo sem histórico ainda abre a tela", async () => {
    const result = run([scoresMock([]), insightsMock([])]);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.history).toEqual([]);
    expect(result.current.insights).toEqual([]);
  });
});
