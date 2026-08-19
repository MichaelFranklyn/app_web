import { gql } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing/react";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { useCompleteList } from "./useCompleteList";

const QUERY = gql`
  query Things($input: BaseListInput!) {
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

interface Node {
  id: string;
  name: string;
}
interface Data {
  things: { edges: { node: Node }[]; totalCount: number };
}

const nodes = (n: number, offset = 0): Node[] =>
  Array.from({ length: n }, (_, i) => ({
    id: String(offset + i),
    name: `Item ${offset + i}`,
  }));

const mock = (first: number, devolvidos: Node[], total: number) => ({
  request: { query: QUERY, variables: { input: { first } } },
  result: {
    data: {
      things: {
        edges: devolvidos.map((node) => ({ node })),
        totalCount: total,
      },
    },
  },
});

const getConnection = (d: Data) => d.things;

const render = (mocks: ReturnType<typeof mock>[]) =>
  renderHook(
    () =>
      useCompleteList<Data, Node>(QUERY, {}, getConnection, {
        initialFirst: 200,
      }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MockedProvider mocks={mocks}>{children}</MockedProvider>
      ),
    }
  );

describe("useCompleteList", () => {
  it("uma requisição só quando o catálogo cabe", async () => {
    const { result } = render([mock(200, nodes(4), 4)]);

    await waitFor(() =>
      expect(result.current.data?.things.edges).toHaveLength(4)
    );
    expect(result.current.isComplete).toBe(true);
  });

  it("rebusca pelo total quando a primeira página truncou", async () => {
    // O caso que estourou em produção: o teto escondeu o resto do catálogo.
    const { result } = render([
      mock(200, nodes(200), 621),
      mock(621, nodes(621), 621),
    ]);

    await waitFor(() =>
      expect(result.current.data?.things.edges).toHaveLength(621)
    );
    expect(result.current.isComplete).toBe(true);
  });

  it("enquanto a segunda busca não volta, não se diz completo", async () => {
    const { result } = render([mock(200, nodes(200), 621)]);

    await waitFor(() =>
      expect(result.current.data?.things.edges).toHaveLength(200)
    );
    // Sem o mock da segunda página, a lista fica parcial — e admite isso.
    expect(result.current.isComplete).toBe(false);
  });
});
