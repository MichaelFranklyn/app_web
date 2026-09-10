import type { QueryFilter } from "@/hooks/useTableData";
import { MAX_SCAN_PAGES } from "@/utils/pagination";
import type { ReportOrder } from "@/utils/pdf/context";
import type { ApolloClient, DocumentNode } from "@apollo/client";

/** Página do backend na varredura. O teto de páginas é o do app inteiro
 * (`MAX_SCAN_PAGES`): dois valores diferentes fariam a mesma lista sair
 * completa numa aba e cortada na outra. */
const PAGE_SIZE = 100;

interface Connection<TItem> {
  edges: { node: TItem }[];
  pageInfo?: { hasNextPage: boolean; endCursor: string | null };
}

/**
 * Baixa TODAS as páginas de uma listagem com os filtros dados.
 *
 * A tela pagina de 20 em 20; exportar o que está em memória daria um arquivo de
 * vinte linhas. Aqui a query é refeita sob demanda, com o MESMO recorte que o
 * usuário está vendo — filtros E ordenação — é o que faz o arquivo e a tela
 * contarem a mesma coisa.
 *
 * `network-only` de propósito: o arquivo não pode sair de um cache antigo.
 *
 * A varredura para no teto de páginas se o recorte for grande demais, e o
 * arquivo sai com o que deu. Quem exporta compara o que veio com o total da
 * tela (`totalRows` em `useReportExport`) e avisa — arquivo cortado em silêncio
 * é pior do que arquivo nenhum, porque parece completo.
 */
export const fetchAllPages = async <TData, TItem>(
  apollo: ApolloClient,
  query: DocumentNode,
  filters: QueryFilter[],
  getConnection: (data: TData) => Connection<TItem> | undefined,
  /** A ordenação à vista na tabela; ausente = a ordem padrão do backend. */
  order?: ReportOrder | null
): Promise<TItem[]> => {
  const all: TItem[] = [];
  let after: string | null = null;

  for (let page = 0; page < MAX_SCAN_PAGES; page += 1) {
    const result: { data?: TData } = await apollo.query<TData>({
      query,
      variables: {
        input: {
          first: PAGE_SIZE,
          after,
          ...(filters.length > 0 && { filters }),
          ...(order && { order }),
        },
      },
      fetchPolicy: "network-only",
    });

    const connection = result.data ? getConnection(result.data) : undefined;
    if (!connection) break;
    all.push(...connection.edges.map((edge) => edge.node));

    const { hasNextPage, endCursor } = connection.pageInfo ?? {};
    if (!hasNextPage || !endCursor) break;
    after = endCursor;
  }

  return all;
};
