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

const mkMock = (variables: object, nodes: Node[]) => ({
  request: { query: QUERY, variables },
  result: { data: { things: { edges: nodes.map((node) => ({ node })) } } },
});

const render = (mocks: ReturnType<typeof mkMock>[], debounceMs = 10) =>
  renderHook(
    () =>
      useAsyncSelectOptions<Data, Node>({
        query: QUERY,
        getConnection: (d) => d.things,
        toOption: (n) => ({ value: n.id, label: n.name }),
        searchField: "name",
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

    act(() => result.current.onSearch("an"));

    await waitFor(() => expect(result.current.options).toHaveLength(1));
    expect(result.current.options[0].label).toBe("Ana");
  });
});
