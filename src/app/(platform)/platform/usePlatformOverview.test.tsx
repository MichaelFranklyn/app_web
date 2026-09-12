import { MockedProvider } from "@apollo/client/testing/react";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

/** O seed do SSR tem teste próprio (useSeedQuery); aqui o cache começa frio. */
vi.mock("@/hooks/useSeedQuery", () => ({ useSeedQuery: () => {} }));

import {
  PLATFORM_ATTENTION_QUERY,
  PLATFORM_GROWTH_QUERY,
  PLATFORM_OVERVIEW_QUERY,
} from "./gql";
import { PlatformHomeProps } from "./interface";
import { usePlatformOverview } from "./usePlatformOverview";
import { GROWTH_MONTHS } from "./utils";

const overviewMock = {
  request: { query: PLATFORM_OVERVIEW_QUERY },
  maxUsageCount: 5,
  result: {
    data: {
      platformOverview: {
        __typename: "PlatformOverviewResponse",
        status: true,
        code: 200,
        message: "ok",
        data: {
          __typename: "PlatformOverviewType",
          totalCompanies: 12,
          activeCompanies: 10,
          suspendedCompanies: 1,
          trialCompanies: 1,
          newCompaniesInPeriod: 2,
          totalUsers: 40,
          activeUsersInPeriod: 22,
          neverLoggedUsers: 3,
          engagedCompanies: 8,
          totalSellers: 15,
          totalClients: 900,
          totalFactoryLinks: 60,
          totalOrders: 3000,
          ordersInPeriod: 120,
          gmvInPeriod: "450000.00",
        },
      },
    },
  },
};

const attentionMock = {
  request: { query: PLATFORM_ATTENTION_QUERY },
  maxUsageCount: 5,
  result: {
    data: {
      platformAttention: {
        __typename: "PlatformAttentionResponse",
        status: true,
        code: 200,
        message: "ok",
        data: [
          {
            __typename: "PlatformAttentionItem",
            kind: "NO_ORDERS",
            severity: "HIGH",
            companyId: "comp1",
            companyName: "Alto",
            detail: "Sem pedidos há 30 dias",
          },
        ],
      },
    },
  },
};

const growthErrorMock = {
  request: {
    query: PLATFORM_GROWTH_QUERY,
    variables: { months: GROWTH_MONTHS },
  },
  maxUsageCount: 5,
  error: new Error("timeout na série de 12 meses"),
};

const wrapper = (mocks: unknown[]) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any -- mocks do MockLink */
    <MockedProvider mocks={mocks as any}>{children}</MockedProvider>
  );
  return Wrapper;
};

const run = (mocks: unknown[]) =>
  renderHook(() => usePlatformOverview({} as PlatformHomeProps), {
    wrapper: wrapper(mocks),
  }).result;

describe("usePlatformOverview", () => {
  it("os oito recortes saem juntos: o que chega, pinta", async () => {
    // Encadeá-los seguraria os KPIs (baratos) atrás das séries longas.
    const result = run([overviewMock, attentionMock]);

    await waitFor(() =>
      expect(result.current.overview?.totalCompanies).toBe(12)
    );
    await waitFor(() => expect(result.current.attention).toHaveLength(1));
  });

  it("um bloco que falha não derruba os outros", async () => {
    // A série de 12 meses é a mais lenta: se ela cair, o painel continua.
    const result = run([overviewMock, attentionMock, growthErrorMock]);

    await waitFor(() => expect(result.current.growthError).toBeDefined());
    expect(result.current.growth).toEqual([]);
    await waitFor(() =>
      expect(result.current.overview?.totalCompanies).toBe(12)
    );
  });

  it("bloco sem resposta ainda não é bloco vazio — é lista vazia", async () => {
    // Nada de `undefined` vazando para a tela: cada recorte tem um default.
    const result = run([overviewMock]);

    expect(result.current.attention).toEqual([]);
    expect(result.current.health).toEqual([]);
    expect(result.current.adoption).toEqual([]);
    expect(result.current.retention).toBeNull();
    expect(result.current.engagement).toBeNull();
    expect(result.current.operation).toBeNull();
  });
});
