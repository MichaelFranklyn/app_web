import { MockedProvider } from "@apollo/client/testing/react";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/** A busca de clientes vai ao servidor por um hook próprio. */
const { clients } = vi.hoisted(() => ({
  clients: {
    options: [{ value: "c1", label: "ALTO" }],
    loading: false,
    onSearch: vi.fn(),
  },
}));

vi.mock("@/hooks/useAsyncSelectOptions", () => ({
  useAsyncSelectOptions: () => clients,
}));

import {
  ORDER_FILTER_FACTORIES_QUERY,
  ORDER_FILTER_SELLERS_QUERY,
} from "./gql";
import { useOrderFilters } from "./useOrderFilters";

const PAGE = { input: { first: 200 } };

const sellersMock = (sellers: { id: string; name: string }[]) => ({
  request: { query: ORDER_FILTER_SELLERS_QUERY, variables: PAGE },
  maxUsageCount: 5,
  result: {
    data: {
      order_filter_sellers: {
        __typename: "UserTypeConnection",
        edges: sellers.map((seller) => ({
          __typename: "UserTypeEdge",
          node: { __typename: "UserType", ...seller },
        })),
      },
    },
  },
});

const factoriesMock = (
  links: { id: string; factory: Record<string, unknown> | null }[]
) => ({
  request: { query: ORDER_FILTER_FACTORIES_QUERY, variables: PAGE },
  maxUsageCount: 5,
  result: {
    data: {
      order_filter_factories: {
        __typename: "CompanyFactoryConnection",
        edges: links.map(({ id, factory }) => ({
          __typename: "CompanyFactoryEdge",
          node: {
            __typename: "CompanyFactoryType",
            id,
            factory: factory ? { __typename: "FactoryType", ...factory } : null,
          },
        })),
      },
    },
  },
});

const FACTORY = {
  id: "f1",
  nomeFantasia: "HERC",
  nickname: null,
  razaoSocial: "HERC SA",
};

const wrapper = (mocks: unknown[]) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any -- mocks do MockLink */
    <MockedProvider mocks={mocks as any}>{children}</MockedProvider>
  );
  return Wrapper;
};

const run = (
  mocks: unknown[],
  params: { canFilterBySeller?: boolean; hideStatus?: boolean } = {}
) =>
  renderHook(
    () =>
      useOrderFilters({
        canFilterBySeller: params.canFilterBySeller ?? true,
        hideStatus: params.hideStatus,
      }),
    { wrapper: wrapper(mocks) }
  ).result;

const field = (
  result: ReturnType<typeof run>,
  key: string
): Record<string, unknown> =>
  result.current.find((f) => f.key === key)! as unknown as Record<
    string,
    unknown
  >;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useOrderFilters", () => {
  it("o filtro de fábrica casa pelo id da FÁBRICA, não pelo do vínculo", async () => {
    // O pedido guarda `factory_id`: mandar o id do vínculo devolveria vazio.
    const result = run([
      sellersMock([]),
      factoriesMock([{ id: "cf1", factory: FACTORY }]),
    ]);

    await waitFor(() =>
      expect(field(result, "factoryId").options).toEqual([
        { value: "f1", label: "HERC" },
      ])
    );
  });

  it("vínculo sem fábrica carregada fica de fora", async () => {
    const result = run([
      sellersMock([]),
      factoriesMock([
        { id: "cf1", factory: FACTORY },
        { id: "cf2", factory: null },
      ]),
    ]);

    await waitFor(() =>
      expect(field(result, "factoryId").options).toHaveLength(1)
    );
  });

  it("o vendedor logado não vê o filtro de vendedor", () => {
    // Ele já só enxerga os próprios pedidos.
    const result = run([factoriesMock([])], { canFilterBySeller: false });

    expect(field(result, "sellerId").hidden).toBe(true);
  });

  it("o gestor escolhe o vendedor", async () => {
    const result = run([
      sellersMock([{ id: "s1", name: "Rafael" }]),
      factoriesMock([]),
    ]);

    await waitFor(() =>
      expect(field(result, "sellerId").options).toEqual([
        { value: "s1", label: "Rafael" },
      ])
    );
    expect(field(result, "sellerId").hidden).toBe(false);
  });

  it("na aba 'ainda não faturados', o filtro de situação some", async () => {
    // A aba já É um recorte por situação: o campo ali só permitiria pedir
    // "entregues que ainda não foram faturados" e receber vazio.
    const result = run([sellersMock([]), factoriesMock([])], {
      hideStatus: true,
    });

    expect(field(result, "status").hidden).toBe(true);
  });

  it("o cliente é buscado no servidor — a carteira não cabe num select", async () => {
    const result = run([sellersMock([]), factoriesMock([])]);

    expect(field(result, "clientId").onSearch).toBe(clients.onSearch);
    expect(field(result, "clientId").options).toEqual([
      { value: "c1", label: "ALTO" },
    ]);
  });

  it("oferece os dois períodos que a tela usa: pedido e faturamento", () => {
    const result = run([sellersMock([]), factoriesMock([])]);

    expect(field(result, "orderDateFrom").toKey).toBe("orderDateTo");
    expect(field(result, "invoicedFrom").toKey).toBe("invoicedTo");
  });
});
