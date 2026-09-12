import type { ApolloClient } from "@apollo/client";
import { gql } from "@apollo/client";
import { describe, expect, it, vi } from "vitest";

import { MAX_SCAN_PAGES } from "@/utils/pagination";
import { fetchAllPages } from "./fetchAllPages";

const QUERY = gql`
  query Rows($input: ListInput) {
    rows(input: $input) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

interface Data {
  rows: {
    edges: { node: { id: string } }[];
    pageInfo?: { hasNextPage: boolean; endCursor: string | null };
  };
}

/** Um backend de mentira que devolve as páginas na ordem em que foram pedidas. */
interface QueryCall {
  variables: { input: Record<string, unknown> };
  fetchPolicy: string;
}

const clientWith = (pages: Data["rows"][]) => {
  const query = vi.fn<(options: QueryCall) => Promise<{ data?: Data }>>(
    async () => ({ data: { rows: pages.shift()! } })
  );
  return { apollo: { query } as unknown as ApolloClient, query };
};

/** Os argumentos da n-ésima chamada, já tipados. */
const callArgs = (
  query: ReturnType<typeof clientWith>["query"],
  index: number
): QueryCall => query.mock.calls[index]![0];

const page = (ids: string[], next: string | null): Data["rows"] => ({
  edges: ids.map((id) => ({ node: { id } })),
  pageInfo: { hasNextPage: next !== null, endCursor: next },
});

const rowsOf = (result: { id: string }[]) => result.map((row) => row.id);

describe("fetchAllPages", () => {
  it("segue o cursor até a última página e junta tudo", () => {
    // A tela pagina de 20 em 20: exportar o que está em memória daria um
    // arquivo de vinte linhas.
    const { apollo, query } = clientWith([
      page(["1", "2"], "cursor-1"),
      page(["3"], null),
    ]);

    return fetchAllPages<Data, { id: string }>(
      apollo,
      QUERY,
      [],
      (data) => data.rows
    ).then((rows) => {
      expect(rowsOf(rows)).toEqual(["1", "2", "3"]);
      expect(query).toHaveBeenCalledTimes(2);
      expect(callArgs(query, 1).variables.input.after).toBe("cursor-1");
    });
  });

  it("leva o MESMO recorte da tela — filtros e ordenação", async () => {
    // Sem isso, o arquivo conta uma coisa e a tela conta outra.
    const { apollo, query } = clientWith([page(["1"], null)]);
    const filters = [{ field: "status", operator: "eq", value: "INVOICED" }];

    await fetchAllPages<Data, { id: string }>(
      apollo,
      QUERY,
      filters,
      (data) => data.rows,
      { by: "total", dir: "desc" }
    );

    expect(callArgs(query, 0).variables.input).toMatchObject({
      first: 100,
      filters,
      order: { by: "total", dir: "desc" },
    });
  });

  it("não manda filtro nem ordenação vazios", async () => {
    const { apollo, query } = clientWith([page(["1"], null)]);

    await fetchAllPages<Data, { id: string }>(
      apollo,
      QUERY,
      [],
      (data) => data.rows,
      null
    );

    const input = callArgs(query, 0).variables.input;
    expect(input).not.toHaveProperty("filters");
    expect(input).not.toHaveProperty("order");
  });

  it("busca na rede: o arquivo não pode sair de um cache antigo", async () => {
    const { apollo, query } = clientWith([page(["1"], null)]);

    await fetchAllPages<Data, { id: string }>(
      apollo,
      QUERY,
      [],
      (data) => data.rows
    );

    expect(callArgs(query, 0).fetchPolicy).toBe("network-only");
  });

  it("para no teto de páginas do app, e não varre o banco inteiro", async () => {
    // Quem exporta compara o que veio com o total da tela e avisa: arquivo
    // cortado em silêncio parece completo, e é pior do que arquivo nenhum.
    const infinitas = Array.from({ length: MAX_SCAN_PAGES + 5 }, (_, i) =>
      page([String(i)], `cursor-${i}`)
    );
    const { apollo, query } = clientWith(infinitas);

    const rows = await fetchAllPages<Data, { id: string }>(
      apollo,
      QUERY,
      [],
      (data) => data.rows
    );

    expect(query).toHaveBeenCalledTimes(MAX_SCAN_PAGES);
    expect(rows).toHaveLength(MAX_SCAN_PAGES);
  });

  it("resposta sem a conexão encerra a varredura em vez de estourar", async () => {
    const query = vi.fn<(options: QueryCall) => Promise<{ data?: Data }>>(
      async () => ({ data: undefined })
    );
    const apollo = { query } as unknown as ApolloClient;

    await expect(
      fetchAllPages<Data, { id: string }>(
        apollo,
        QUERY,
        [],
        (data) => data.rows
      )
    ).resolves.toEqual([]);
    expect(query).toHaveBeenCalledOnce();
  });

  it("página final sem cursor encerra mesmo dizendo que há próxima", async () => {
    // Defesa contra backend inconsistente: `hasNextPage` true com `endCursor`
    // nulo faria a varredura repetir a mesma página até o teto.
    const { apollo, query } = clientWith([
      {
        edges: [{ node: { id: "1" } }],
        pageInfo: { hasNextPage: true, endCursor: null },
      },
    ]);

    const rows = await fetchAllPages<Data, { id: string }>(
      apollo,
      QUERY,
      [],
      (data) => data.rows
    );

    expect(rowsOf(rows)).toEqual(["1"]);
    expect(query).toHaveBeenCalledOnce();
  });
});
