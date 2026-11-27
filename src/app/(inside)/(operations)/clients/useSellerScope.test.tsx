import { ApolloClient } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";
import { MockedProvider } from "@apollo/client/testing/react";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/** A espera pela ociosidade da página tem hook próprio. */
const { idle, sellers } = vi.hoisted(() => ({
  idle: { ready: true },
  sellers: {
    nodes: [] as { id: string; name: string }[],
    loading: false,
    missing: false,
  },
}));

vi.mock("@/hooks/useIdleReady", () => ({ useIdleReady: () => idle.ready }));
vi.mock("@/hooks/useCompleteList", () => ({
  useCompleteList: () => ({
    data: {
      clients_sellers: sellers.missing
        ? null
        : { edges: sellers.nodes.map((node) => ({ node })) },
    },
    loading: sellers.loading,
    error: undefined,
  }),
}));

import { CLIENT_STATS_QUERY } from "./gql";
import { ClientsStats } from "./interface";
import { useSellerScope } from "./useSellerScope";

const SSR_STATS: ClientsStats = {
  clientStats: {
    __typename: "ClientStatsType",
    totalClients: 100,
    activeClients: 60,
    atRiskClients: 30,
    noVisit30d: 10,
  },
} as ClientsStats;

const statsMock = (sellerId: string | null, totalClients: number) => ({
  request: { query: CLIENT_STATS_QUERY, variables: { sellerId } },
  maxUsageCount: 5,
  result: {
    data: {
      clientStats: {
        __typename: "ClientStatsType",
        totalClients,
        activeClients: 5,
        atRiskClients: 2,
        noVisit30d: 1,
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

const run = (
  mocks: unknown[],
  params: { canFilterBySeller?: boolean; selectedSellerId?: string | null } = {}
) =>
  renderHook(
    () =>
      useSellerScope({
        canFilterBySeller: params.canFilterBySeller ?? true,
        selectedSellerId: params.selectedSellerId ?? null,
        fallbackStats: SSR_STATS,
      }),
    { wrapper: wrapper(mocks) }
  ).result;

beforeEach(() => {
  vi.clearAllMocks();
  idle.ready = true;
  sellers.nodes = [{ id: "s1", name: "Rafael" }];
  sellers.loading = false;
  sellers.missing = false;
});

describe("useSellerScope", () => {
  it("sem vendedor escolhido, os KPIs do SSR pintam o topo de cara", () => {
    // Semeados no cache: o 1º render já mostra o número, sem ida à rede.
    const result = run([]);

    expect(result.current.stats.clientStats.totalClients).toBe(100);
  });

  it("invalidar clientStats (ex.: importar clientes) refaz o topo", async () => {
    // O bug: o topo lia o prop do SSR direto e ficava parado até o F5.
    let client: ApolloClient | undefined;
    const { result } = renderHook(
      () => {
        client = useApolloClient();
        return useSellerScope({
          canFilterBySeller: true,
          selectedSellerId: null,
          fallbackStats: SSR_STATS,
        });
      },
      { wrapper: wrapper([statsMock(null, 140)]) }
    );
    expect(result.current.stats.clientStats.totalClients).toBe(100);

    client!.cache.evict({ id: "ROOT_QUERY", fieldName: "clientStats" });
    client!.cache.gc();

    await waitFor(() =>
      expect(result.current.stats.clientStats.totalClients).toBe(140)
    );
  });

  it("escolhido o vendedor, o topo passa a contar a carteira dele", async () => {
    // Senão a tabela filtra e o topo continua somando a empresa inteira.
    const result = run([statsMock("s1", 12)], { selectedSellerId: "s1" });

    await waitFor(() =>
      expect(result.current.stats.clientStats.totalClients).toBe(12)
    );
  });

  it("o seletor mostra os vendedores da empresa", () => {
    const result = run([]);

    expect(result.current.sellerOptions).toEqual([
      { value: "s1", label: "Rafael" },
    ]);
  });

  it("resposta sem a lista de vendedores deixa o seletor vazio, sem derrubar a tela", () => {
    // Erro parcial do GraphQL (ou operação sem mock no E2E) devolve `data` com
    // o campo nulo: estourar aqui, dentro do render, levava /clients inteira
    // para o error boundary.
    sellers.missing = true;
    const result = run([]);

    expect(result.current.sellerOptions).toEqual([]);
  });

  it("enquanto a busca espera a página carregar, o seletor diz 'carregando'", () => {
    // Skipada, a query do Apollo reporta `loading: false` — e o seletor
    // pareceria "sem vendedores" em vez de "ainda buscando".
    idle.ready = false;
    const result = run([]);

    expect(result.current.sellersLoading).toBe(true);
  });

  it("vendedor logado não tem seletor para carregar", () => {
    const result = run([], { canFilterBySeller: false });

    expect(result.current.sellersLoading).toBe(false);
  });
});
