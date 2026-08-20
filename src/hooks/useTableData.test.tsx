import { gql, InMemoryCache } from "@apollo/client";
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

import { pageToAfter } from "@/utils/pagination";
import { ActiveSort, useTableData } from "./useTableData";

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

// O sort agora vai NAS VARIABLES: cada ordenação é uma consulta diferente, e o
// mock só casa se o `order` esperado for exatamente o que o hook montou.
const makeWrapper = (
  data: Item[],
  filters?: object,
  order?: object,
  after: string | null = null
) => {
  const input = {
    first: 10,
    after,
    ...(filters ? { filters } : {}),
    ...(order ? { order } : {}),
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

const SORTABLE = ["name", "created_at"];

const run = async (opts: {
  sp?: string;
  sortableFields?: string[];
  backendDefaultSort?: ActiveSort;
  order?: object;
  /** Cursor da página pedida — só quando `sp` traz `page`. */
  after?: string;
}) => {
  if (opts.sp) state.sp = new URLSearchParams(opts.sp);
  const { result } = renderHook(
    () =>
      useTableData<ItemsData, Item>({
        query: QUERY,
        fields: {},
        getConnection: (d) => d.items,
        itemsPerPage: 10,
        sortableFields: opts.sortableFields ?? SORTABLE,
        backendDefaultSort: opts.backendDefaultSort,
      }),
    { wrapper: makeWrapper(DATA, undefined, opts.order, opts.after ?? null) }
  );
  await waitFor(() => expect(result.current.loading).toBe(false));
  return result;
};

/** Parâmetros da última URL escrita pelo router. */
const lastUrlParams = () =>
  new URLSearchParams(
    decodeURIComponent(replace.mock.calls.at(-1)![0] as string).split("?")[1]
  );

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

describe("useTableData — ordenação (servidor)", () => {
  it("sem sort na URL não manda `order` — preserva o default do backend", async () => {
    // O mock é montado SEM `order`; se o hook mandasse um, a operação não
    // casaria e o teste travaria em loading.
    const r = await run({});
    expect(r.current.sort.key).toBeNull();
    expect(r.current.displayedData).toHaveLength(DATA.length);
  });

  it("sort na URL vira `order: {by, dir}` nas variables", async () => {
    const r = await run({
      sp: "sortBy=name&sortDir=asc",
      order: { by: "name", dir: "asc" },
    });
    expect(r.current.sort).toMatchObject({ key: "name", direction: "asc" });
    expect(r.current.displayedData).toHaveLength(DATA.length);
  });

  it("a lista chega na ordem do servidor — o hook não reordena nada", async () => {
    // O backend devolve o que quiser; reordenar aqui só bagunçaria a paginação
    // (a página 2 viria ordenada por outro critério que a 1).
    const r = await run({
      sp: "sortBy=name&sortDir=asc",
      order: { by: "name", dir: "asc" },
    });
    expect(ids(r.current.displayedData)).toEqual(ids(DATA));
  });

  it("coluna fora de sortableFields é ignorada (URL editada não derruba a consulta)", async () => {
    // `?sortBy=DROP TABLE` chegaria no `getattr(model, campo)` do backend.
    const r = await run({ sp: "sortBy=coluna_inventada&sortDir=asc" });
    expect(r.current.sort.key).toBeNull();
    expect(r.current.displayedData).toHaveLength(DATA.length);
  });

  it("sortDir inválido cai em desc", async () => {
    const r = await run({
      sp: "sortBy=name&sortDir=lixo",
      order: { by: "name", dir: "desc" },
    });
    expect(r.current.sort.direction).toBe("desc");
  });

  it("clicar numa coluna nova grava a direção do primeiro clique", async () => {
    const r = await run({});
    replace.mockClear();
    act(() => r.current.sort.onSort("name", "desc"));

    const params = lastUrlParams();
    expect(params.get("sortBy")).toBe("name");
    expect(params.get("sortDir")).toBe("desc");
  });

  it("clicar na coluna já ordenada inverte a direção", async () => {
    const r = await run({
      sp: "sortBy=name&sortDir=asc",
      order: { by: "name", dir: "asc" },
    });
    replace.mockClear();
    act(() => r.current.sort.onSort("name", "asc"));

    expect(lastUrlParams().get("sortDir")).toBe("desc");
  });

  it("ordenar volta para a página 1", async () => {
    // Página 3 de uma ordem que acabou de mudar não mostra as mesmas linhas.
    const r = await run({ sp: "page=3", after: pageToAfter(3, 10)! });
    replace.mockClear();
    act(() => r.current.sort.onSort("name", "asc"));

    expect(lastUrlParams().has("page")).toBe(false);
  });

  it("ordenar preserva os filtros que já estavam na URL", async () => {
    const r = await run({ sp: "search=alpha" });
    replace.mockClear();
    act(() => r.current.sort.onSort("name", "asc"));

    expect(lastUrlParams().get("search")).toBe("alpha");
  });
});

describe("useTableData — backendDefaultSort", () => {
  const DEFAULT_SORT: ActiveSort = { key: "created_at", direction: "desc" };

  it("aparece no cabeçalho sem ir para as variables", async () => {
    // Sem isto a lista apareceria como "sem ordenação" enquanto o backend já a
    // devolve ordenada. E mandar o `order` explícito furaria o cache do SSR.
    const r = await run({ backendDefaultSort: DEFAULT_SORT });
    expect(r.current.sort).toMatchObject({
      key: "created_at",
      direction: "desc",
    });
  });

  it("clicar na coluna do default inverte (e aí sim manda `order`)", async () => {
    const r = await run({ backendDefaultSort: DEFAULT_SORT });
    replace.mockClear();
    act(() => r.current.sort.onSort("created_at", "desc"));

    const params = lastUrlParams();
    expect(params.get("sortBy")).toBe("created_at");
    expect(params.get("sortDir")).toBe("asc");
  });

  it("voltar para a direção do default LIMPA a URL em vez de repeti-la", async () => {
    // Repetir o default nas variables daria o mesmo resultado, mas erraria o
    // cache semeado pelo SSR — que só existe para as variáveis sem `order`.
    const r = await run({
      sp: "sortBy=created_at&sortDir=asc",
      backendDefaultSort: DEFAULT_SORT,
      order: { by: "created_at", dir: "asc" },
    });
    replace.mockClear();
    act(() => r.current.sort.onSort("created_at", "desc"));

    const params = lastUrlParams();
    expect(params.has("sortBy")).toBe(false);
    expect(params.has("sortDir")).toBe(false);
  });

  it("a URL vence o default quando as duas existem", async () => {
    const r = await run({
      sp: "sortBy=name&sortDir=asc",
      backendDefaultSort: DEFAULT_SORT,
      order: { by: "name", dir: "asc" },
    });
    expect(r.current.sort).toMatchObject({ key: "name", direction: "asc" });
  });
});

describe("useTableData — initialData (SSR seed)", () => {
  it("semeia o cache e pinta no 1º render sem disparar rede", async () => {
    state.sp = new URLSearchParams();
    const seeded: Item[] = [
      { id: "9", name: "Seed", priority: "high", factory: { name: "S" } },
    ];
    // Mesmo shape que gqlFetch(withTypename) devolve no SSR: __typename em todo
    // objeto → a leitura cache-first do Apollo encontra tudo e não busca na rede.
    const initialData = {
      items: {
        __typename: "ItemConnection",
        totalCount: 1,
        edges: seeded.map((node) => ({
          __typename: "ItemEdge",
          node: {
            __typename: "Item",
            ...node,
            factory: { __typename: "Factory", ...node.factory },
          },
        })),
      },
    } as unknown as ItemsData;

    const { result } = renderHook(
      () =>
        useTableData<ItemsData, Item>({
          query: QUERY,
          fields: {},
          getConnection: (d) => d.items,
          itemsPerPage: 10,
          initialData,
        }),
      {
        // Sem mocks de propósito: se houvesse waterfall de rede, o MockedProvider
        // erraria por operação não-mockada. Passar aqui = pintou do cache semeado.
        wrapper: ({ children }: { children: ReactNode }) => (
          <MockedProvider mocks={[]}>{children}</MockedProvider>
        ),
      }
    );

    expect(result.current.loading).toBe(false);
    expect(ids(result.current.displayedData)).toEqual(["9"]);
    expect(result.current.totalItems).toBe(1);
  });

  // A guarda que faltava. O `initialData` vem do payload RSC, que numa volta de
  // navegação o Next serve do router cache — podendo ser anterior à mutation que
  // já atualizou o cache do Apollo. Escrever por cima ressuscitava a linha
  // apagada (ou sumia com a recém-criada) até o próximo reload.
  it("com o cache já quente, o seed do SSR não sobrescreve", async () => {
    state.sp = new URLSearchParams();
    const node = (id: string, name: string) => ({
      __typename: "Item",
      id,
      name,
      priority: "high",
      factory: { __typename: "Factory", name: "F" },
    });
    const connection = (id: string, name: string) => ({
      items: {
        __typename: "ItemConnection",
        totalCount: 1,
        edges: [{ __typename: "ItemEdge", node: node(id, name) }],
      },
    });

    // Estado "pós-mutation": o cliente já tem a versão nova destas variables.
    const cache = new InMemoryCache();
    cache.writeQuery({
      query: QUERY,
      variables: { input: { first: 10, after: pageToAfter(1, 10) } },
      data: connection("9", "Novo"),
    });

    const { result } = renderHook(
      () =>
        useTableData<ItemsData, Item>({
          query: QUERY,
          fields: {},
          getConnection: (d) => d.items,
          itemsPerPage: 10,
          initialData: connection("9", "Velho") as unknown as ItemsData,
        }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <MockedProvider cache={cache} mocks={[]}>
            {children}
          </MockedProvider>
        ),
      }
    );

    expect(result.current.displayedData[0]?.name).toBe("Novo");
  });

  it("com initialData de connection VAZIO, não semeia — busca no cliente", async () => {
    state.sp = new URLSearchParams();
    // SSR degradado/vazio (ex.: stub do E2E): semear o vazio faria o cache-first
    // acertar um hit vazio e nunca buscar. O guard deve pular o seed → o cliente
    // busca e traz os dados (aqui, o mock DATA).
    const emptyInitial = {
      items: { edges: [], totalCount: 0 },
    } as unknown as ItemsData;

    const { result } = renderHook(
      () =>
        useTableData<ItemsData, Item>({
          query: QUERY,
          fields: {},
          getConnection: (d) => d.items,
          itemsPerPage: 10,
          initialData: emptyInitial,
        }),
      { wrapper: makeWrapper(DATA) }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    // Veio da REDE (mock), não do seed vazio.
    expect(result.current.displayedData).toHaveLength(DATA.length);
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
