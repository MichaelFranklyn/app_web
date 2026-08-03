import { gql } from "@apollo/client";
import { MockLink } from "@apollo/client/testing";
import { MockedProvider } from "@apollo/client/testing/react";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { useAllPages } from "./useAllPages";

const QUERY = gql`
  query Things($input: BaseListInput!) {
    things(input: $input) {
      edges {
        node {
          id
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

interface ThingsData {
  things: {
    edges: { node: { id: string } }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

const select = (data: ThingsData) => data?.things;

const page = (
  ids: string[],
  after: string | null,
  next: string | null
): MockLink.MockedResponse => ({
  request: { query: QUERY, variables: { input: { first: 2, after } } },
  result: {
    data: {
      things: {
        edges: ids.map((id) => ({ node: { id } })),
        pageInfo: { hasNextPage: next !== null, endCursor: next },
      },
    },
  },
});

const wrap = (mocks: MockLink.MockedResponse[]) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  );
  Wrapper.displayName = "AllPagesWrapper";
  return Wrapper;
};

const INPUT = { first: 2 };

describe("useAllPages", () => {
  it("concatena todas as páginas até o fim", async () => {
    // 3 páginas: o bug de produção era parar (ou estourar) depois da primeira.
    const { result } = renderHook(
      () => useAllPages<{ id: string }, ThingsData>(QUERY, INPUT, select),
      {
        wrapper: wrap([
          page(["a", "b"], null, "c1"),
          page(["c", "d"], "c1", "c2"),
          page(["e"], "c2", null),
        ]),
      }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.nodes.map((n) => n.id)).toEqual([
      "a",
      "b",
      "c",
      "d",
      "e",
    ]);
  });

  it("uma página só encerra sem pedir a próxima", async () => {
    const { result } = renderHook(
      () => useAllPages<{ id: string }, ThingsData>(QUERY, INPUT, select),
      { wrapper: wrap([page(["a"], null, null)]) }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.nodes.map((n) => n.id)).toEqual(["a"]);
  });

  it("input null não busca nada", async () => {
    const { result } = renderHook(
      () => useAllPages<{ id: string }, ThingsData>(QUERY, null, select),
      { wrapper: wrap([]) }
    );

    expect(result.current.nodes).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("erro no meio da varredura devolve lista vazia em vez de estourar", async () => {
    // Sem catálogo o vendedor ainda digita o preço na mão; derrubar a tela por
    // causa da sugestão seria pior.
    const { result } = renderHook(
      () => useAllPages<{ id: string }, ThingsData>(QUERY, INPUT, select),
      {
        wrapper: wrap([
          page(["a", "b"], null, "c1"),
          {
            request: {
              query: QUERY,
              variables: { input: { first: 2, after: "c1" } },
            },
            error: new Error("rede caiu"),
          },
        ]),
      }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.nodes).toEqual([]);
  });
});
