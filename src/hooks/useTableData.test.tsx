import { gql } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// useTableData/useTableFilters dependem do router do App Router.
const { state } = vi.hoisted(() => ({ state: { sp: new URLSearchParams() } }));
const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useSearchParams: () => state.sp,
  useRouter: () => ({ replace }),
  usePathname: () => "/test",
}));

import { SortState, useTableData } from "./useTableData";

interface Item {
  id: string;
  name: string;
  priority: string;
  factory: { name: string };
}

const QUERY = gql`
  query Items($input: BaseListInput!) {
    items(input: $input) {
      edges {
        node {
          id
          name
          priority
          factory {
            name
          }
        }
      }
      totalCount
    }
  }
`;

interface ItemsData {
  items: { edges: { node: Item }[]; totalCount: number };
}

const DATA: Item[] = [
  { id: "3", name: "Charlie", priority: "low", factory: { name: "Zeta" } },
  { id: "1", name: "Alpha", priority: "high", factory: { name: "Beta" } },
  { id: "2", name: "Bravo", priority: "medium", factory: { name: "Alfa" } },
  { id: "4", name: "Aaa", priority: "high", factory: { name: "Xis" } },
];

// Sort é client-side → as variables não mudam; um mock só serve todos os casos.
const makeWrapper = (data: Item[], filters?: object) => {
  const input = {
    first: 10,
    after: null,
    ...(filters ? { filters } : {}),
  };
  const mocks = [
    {
      request: { query: QUERY, variables: { input } },
      result: {
        data: {
          items: {
            edges: data.map((node) => ({ node })),
            totalCount: data.length,
          },
        },
      },
    },
  ];
  // eslint-disable-next-line react/display-name -- wrapper de teste
  return ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  );
};

const run = async (opts: { sp?: string; initialSort?: SortState }) => {
  if (opts.sp) state.sp = new URLSearchParams(opts.sp);
  const { result } = renderHook(
    () =>
      useTableData<ItemsData, Item>({
        query: QUERY,
        fields: {},
        getConnection: (d) => d.items,
        itemsPerPage: 10,
        initialSort: opts.initialSort,
      }),
    { wrapper: makeWrapper(DATA) }
  );
  await waitFor(() => expect(result.current.loading).toBe(false));
  return result;
};

const ids = (items: Item[]) => items.map((i) => i.id);

beforeEach(() => {
  state.sp = new URLSearchParams();
  replace.mockClear();
});

describe("useTableData — baseFilters", () => {
  it("inclui o filtro fixo nas variables e expõe os dados", async () => {
    const base = [{ field: "factory_id", operator: "eq", value: "f1" }];
    const { result } = renderHook(
      () =>
        useTableData<ItemsData, Item>({
          query: QUERY,
          fields: {},
          getConnection: (d) => d.items,
          baseFilters: base,
          itemsPerPage: 10,
        }),
      {
        wrapper: makeWrapper(
          [DATA[1]],
          [{ field: "factory_id", operator: "eq", value: "f1" }]
        ),
      }
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.totalItems).toBe(1);
    expect(result.current.displayedData[0].id).toBe("1");
  });
});

describe("useTableData — ordenação", () => {
  it("sem sort retorna na ordem original", async () => {
    const r = await run({});
    expect(ids(r.current.displayedData)).toEqual(["3", "1", "2", "4"]);
  });

  it("direção 'none' não ordena mesmo com sortKey", async () => {
    const r = await run({ sp: "sortKey=name&sortDir=none" });
    expect(ids(r.current.displayedData)).toEqual(["3", "1", "2", "4"]);
  });

  it("byKey asc/desc por nome (via URL)", async () => {
    const asc = await run({ sp: "sortKey=name&sortDir=asc" });
    expect(ids(asc.current.displayedData)).toEqual(["4", "1", "2", "3"]); // Aaa,Alpha,Bravo,Charlie
    const desc = await run({ sp: "sortKey=name&sortDir=desc" });
    expect(ids(desc.current.displayedData)).toEqual(["3", "2", "1", "4"]);
  });

  it("byKey com chave aninhada (factory.name)", async () => {
    const r = await run({ sp: "sortKey=factory.name&sortDir=asc" });
    // Alfa(2), Beta(1), Xis(4), Zeta(3)
    expect(ids(r.current.displayedData)).toEqual(["2", "1", "4", "3"]);
  });

  it("customOrder primário asc/desc", async () => {
    const asc = await run({
      initialSort: {
        key: "priority",
        direction: "asc",
        customOrder: ["high", "medium", "low"],
      },
    });
    // high: 1,4 (ordem estável) → medium:2 → low:3
    expect(ids(asc.current.displayedData)).toEqual(["1", "4", "2", "3"]);
    const desc = await run({
      initialSort: {
        key: "priority",
        direction: "desc",
        customOrder: ["high", "medium", "low"],
      },
    });
    expect(ids(desc.current.displayedData)).toEqual(["3", "2", "1", "4"]);
  });

  it("customOrder primário + secundário por collator (name)", async () => {
    const r = await run({
      initialSort: {
        key: "priority",
        direction: "asc",
        customOrder: ["high", "medium", "low"],
        secondaryKey: "name",
        secondaryDirection: "asc",
      },
    });
    // high desempata por name: Aaa(4), Alpha(1) → depois medium(2), low(3)
    expect(ids(r.current.displayedData)).toEqual(["4", "1", "2", "3"]);
  });

  it("customOrder primário + secondaryCustomOrder", async () => {
    const r = await run({
      initialSort: {
        key: "priority",
        direction: "asc",
        customOrder: ["high", "medium", "low"],
        secondaryKey: "factory.name",
        secondaryDirection: "asc",
        secondaryCustomOrder: ["Xis", "Beta"],
      },
    });
    // high desempata por factory custom [Xis,Beta]: Xis(4) antes de Beta(1)
    expect(ids(r.current.displayedData)).toEqual(["4", "1", "2", "3"]);
  });

  it("handleSort dispara atualização de filtro (URL)", async () => {
    const r = await run({});
    replace.mockClear();
    act(() => r.current.handleSort("name"));
    expect(replace).toHaveBeenCalled();
  });

  it("handleSort alterna asc→desc quando já ordenado pela mesma chave", async () => {
    const r = await run({ sp: "sortKey=name&sortDir=asc" });
    replace.mockClear();
    act(() => r.current.handleSort("name"));
    // setFilter("_sort", {key:name,direction:desc}) → URL contém o valor desc.
    const url = decodeURIComponent(replace.mock.calls[0][0]);
    expect(url).toContain('"direction":"desc"');
  });

  it("customOrder trata valores ausentes como 'indefinido'", async () => {
    const data: Item[] = [
      { id: "1", name: "A", priority: "high", factory: { name: "x" } },
      {
        id: "2",
        name: "B",
        priority: undefined as unknown as string,
        factory: { name: "y" },
      },
    ];
    const { result } = renderHook(
      () =>
        useTableData<ItemsData, Item>({
          query: QUERY,
          fields: {},
          getConnection: (d) => d.items,
          itemsPerPage: 10,
          initialSort: {
            key: "priority",
            direction: "asc",
            customOrder: ["high", "indefinido"],
          },
        }),
      { wrapper: makeWrapper(data) }
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    // high(0) antes de undefined→"indefinido"(1).
    expect(ids(result.current.displayedData)).toEqual(["1", "2"]);
  });

  it("secondaryCustomOrder com direção desc e empate (retorna 0)", async () => {
    const data: Item[] = [
      { id: "1", name: "A", priority: "high", factory: { name: "Beta" } },
      { id: "2", name: "B", priority: "high", factory: { name: "Xis" } },
      { id: "3", name: "C", priority: "high", factory: { name: "Outro" } },
      { id: "4", name: "D", priority: "high", factory: { name: "Outro" } },
    ];
    const { result } = renderHook(
      () =>
        useTableData<ItemsData, Item>({
          query: QUERY,
          fields: {},
          getConnection: (d) => d.items,
          itemsPerPage: 10,
          initialSort: {
            key: "priority",
            direction: "asc",
            customOrder: ["high"],
            secondaryKey: "factory.name",
            secondaryDirection: "desc",
            secondaryCustomOrder: ["Xis", "Beta"],
          },
        }),
      { wrapper: makeWrapper(data) }
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    // desc → posições maiores primeiro: Outro(9999, empatam→estável) → Beta(1) → Xis(0).
    expect(ids(result.current.displayedData)).toEqual(["3", "4", "1", "2"]);
  });

  it("secundário por collator com direção desc", async () => {
    const r = await run({
      initialSort: {
        key: "priority",
        direction: "asc",
        customOrder: ["high", "medium", "low"],
        secondaryKey: "name",
        secondaryDirection: "desc",
      },
    });
    // high desempata por name DESC: Alpha(1) antes de Aaa(4).
    expect(ids(r.current.displayedData)).toEqual(["1", "4", "2", "3"]);
  });
});

describe("useTableData — filtros de busca", () => {
  it("constrói filtros a partir dos fields e ignora campos sem valor", async () => {
    state.sp = new URLSearchParams("name=alp");
    const { result } = renderHook(
      () =>
        useTableData<ItemsData, Item>({
          query: QUERY,
          fields: {
            name: { type: "text", queryField: "product_name" },
            status: { type: "select", queryField: "status" },
          },
          getConnection: (d) => d.items,
          itemsPerPage: 10,
        }),
      {
        wrapper: makeWrapper(
          [DATA[1]],
          [{ field: "product_name", operator: "like", value: "alp" }]
        ),
      }
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    // 'name' vira filtro like; 'status' (sem valor) é descartado.
    expect(result.current.inputValues.name).toBe("alp");
    expect(result.current.totalItems).toBe(1);
  });
});
