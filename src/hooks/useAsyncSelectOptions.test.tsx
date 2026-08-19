import { gql } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { useAsyncSelectOptions } from "./useAsyncSelectOptions";

const QUERY = gql`
  query Things($input: BaseListInput!) {
    things(input: $input) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

interface Node {
  id: string;
  name: string;
}
interface Data {
  things: { edges: { node: Node }[] };
}

const QUERY_COM_TOTAL = gql`
  query ThingsComTotal($input: BaseListInput!) {
    things(input: $input) {
      edges {
        node {
          id
          name
        }
      }
      totalCount
    }
  }
`;

interface DataComTotal {
  things: { edges: { node: Node }[]; totalCount: number };
}

const mkMock = (variables: object, nodes: Node[]) => ({
  request: { query: QUERY, variables },
  result: { data: { things: { edges: nodes.map((node) => ({ node })) } } },
});

const render = (
  mocks: ReturnType<typeof mkMock>[],
  debounceMs = 10,
  baseFilters?: { field: string; operator: string; value: string }[],
  order?: { by: string; dir: "asc" | "desc" }
) =>
  renderHook(
    () =>
      useAsyncSelectOptions<Data, Node>({
        query: QUERY,
        getConnection: (d) => d.things,
        toOption: (n) => ({ value: n.id, label: n.name }),
        searchField: "name",
        baseFilters,
        order,
        debounceMs,
      }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MockedProvider mocks={mocks}>{children}</MockedProvider>
      ),
    }
  );

describe("useAsyncSelectOptions", () => {
  it("busca a 1ª página sem filtro e mapeia as opções", async () => {
    const { result } = render([
      mkMock({ input: { first: 20 } }, [{ id: "1", name: "Ana" }]),
    ]);

    await waitFor(() => expect(result.current.options).toHaveLength(1));
    expect(result.current.options[0]).toEqual({ value: "1", label: "Ana" });
  });

  it("aplica filtro like após o debounce e remapeia", async () => {
    const { result } = render([
      mkMock({ input: { first: 20 } }, [
        { id: "1", name: "Ana" },
        { id: "2", name: "Bob" },
      ]),
      mkMock(
        {
          input: {
            first: 20,
            filters: [{ field: "name", operator: "like", value: "an" }],
          },
        },
        [{ id: "1", name: "Ana" }]
      ),
    ]);

    await waitFor(() => expect(result.current.options).toHaveLength(2));

    act(() => result.current.onSearch?.("an"));

    await waitFor(() => expect(result.current.options).toHaveLength(1));
    expect(result.current.options[0].label).toBe("Ana");
  });

  it("mantém o filtro de escopo com e sem termo de busca", async () => {
    // Catálogo escopado (os produtos DESTA fábrica) não pode escolher entre
    // paginar e filtrar: o escopo entra junto do `like`.
    const scope = [
      { field: "company_factory_id", operator: "eq", value: "cf-1" },
    ];
    const { result } = render(
      [
        mkMock({ input: { first: 20, filters: scope } }, [
          { id: "1", name: "Ana" },
        ]),
        mkMock(
          {
            input: {
              first: 20,
              filters: [
                ...scope,
                { field: "name", operator: "like", value: "bru" },
              ],
            },
          },
          [{ id: "2", name: "Bruno" }]
        ),
      ],
      10,
      scope
    );

    await waitFor(() => expect(result.current.options).toHaveLength(1));
    expect(result.current.options[0].label).toBe("Ana");

    act(() => result.current.onSearch?.("bru"));
    await waitFor(() => expect(result.current.options[0]?.label).toBe("Bruno"));
  });

  it("manda a ordem pedida e devolve os nós inteiros", async () => {
    // `nodes` existe para quem precisa de um atributo que não cabe no par
    // value/label — sem refazer a consulta só para lê-lo.
    const order = { by: "name", dir: "asc" } as const;
    const { result } = render(
      [mkMock({ input: { first: 20, order } }, [{ id: "1", name: "Ana" }])],
      10,
      undefined,
      order
    );

    await waitFor(() => expect(result.current.nodes).toHaveLength(1));
    expect(result.current.nodes[0]).toEqual({ id: "1", name: "Ana" });
  });

  it("catálogo que coube inteiro filtra em memória (sem onSearch)", async () => {
    // `totalCount` igual ao que veio = a lista toda está na mão. Devolver
    // `onSearch` aqui faria o select ir ao servidor a cada tecla para filtrar 2
    // itens que já estão no navegador.
    const mock = {
      request: { query: QUERY_COM_TOTAL, variables: { input: { first: 20 } } },
      result: {
        data: {
          things: {
            edges: [{ node: { id: "1", name: "Ana" } }],
            totalCount: 1,
          },
        },
      },
    };
    const { result } = renderHook(
      () =>
        useAsyncSelectOptions<DataComTotal, Node>({
          query: QUERY_COM_TOTAL,
          getConnection: (d) => d.things,
          toOption: (n) => ({ value: n.id, label: n.name }),
          searchField: "name",
          debounceMs: 10,
        }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <MockedProvider mocks={[mock]}>{children}</MockedProvider>
        ),
      }
    );

    await waitFor(() => expect(result.current.options).toHaveLength(1));
    await waitFor(() => expect(result.current.isComplete).toBe(true));
    expect(result.current.onSearch).toBeUndefined();
  });

  it("catálogo maior que a página segue buscando no servidor", async () => {
    const mock = {
      request: { query: QUERY_COM_TOTAL, variables: { input: { first: 20 } } },
      result: {
        data: {
          things: {
            edges: [{ node: { id: "1", name: "Ana" } }],
            // Uma linha veio, o banco tem 900: filtrar em memória esconderia 899.
            totalCount: 900,
          },
        },
      },
    };
    const { result } = renderHook(
      () =>
        useAsyncSelectOptions<DataComTotal, Node>({
          query: QUERY_COM_TOTAL,
          getConnection: (d) => d.things,
          toOption: (n) => ({ value: n.id, label: n.name }),
          searchField: "name",
          debounceMs: 10,
        }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <MockedProvider mocks={[mock]}>{children}</MockedProvider>
        ),
      }
    );

    await waitFor(() => expect(result.current.options).toHaveLength(1));
    expect(result.current.isComplete).toBe(false);
    expect(typeof result.current.onSearch).toBe("function");
  });
});
