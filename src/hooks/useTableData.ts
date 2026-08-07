"use client";

import { TableSort, TableSortDirection } from "@/components/Table";
import { pageToAfter } from "@/utils/pagination";
import { DocumentNode } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useAsyncQuery } from "./useAsyncQuery";
import { FieldConfig, useTableFilters } from "./useTableFilters";

/** Coluna e direção ativas na URL. `null` = a lista está na ordem padrão. */
export interface ActiveSort {
  key: string;
  direction: TableSortDirection;
}

export const SORT_KEY_PARAM = "sortBy";
export const SORT_DIR_PARAM = "sortDir";

export interface QueryFilter {
  field: string;
  operator?: string;
  value?: string | number | boolean;
  /**
   * Valores do operador `in` — o backend lê `values`, não `value` (ver
   * `FieldFilterInput`). É como um relatório pede várias situações de uma vez
   * ("confirmado, faturado ou entregue"): três filtros de igualdade se somariam
   * em E e não casariam com pedido nenhum.
   */
  values?: string[];
}

/** Normaliza um filtro fixo para o formato do `BaseListInput`. */
const toQueryFilter = (filter: QueryFilter) => ({
  field: filter.field,
  operator: filter.operator ?? (filter.values ? "in" : "eq"),
  ...(filter.values ? { values: filter.values } : { value: filter.value }),
});

export interface UseTableDataOptions<TData, TItem> {
  query: DocumentNode;
  fields: Record<string, FieldConfig>;
  getConnection: (data: TData) => {
    edges: { node: TItem }[];
    totalCount: number;
  };
  itemsPerPage?: number;
  /**
   * Colunas por onde a lista pode ser ordenada — nomes de COLUNA no backend
   * (`order_date`, `total_amount`), os mesmos que vão no `sortKey` de cada
   * `Table.Head`.
   *
   * Vale como lista de permissão: `?sortBy=` com qualquer outra coisa é
   * ignorado. Não é preciosismo — o backend resolve a coluna com
   * `getattr(model, campo)`, e um nome que não é coluna derruba a consulta
   * inteira. Sem esta lista, bastaria alguém colar uma URL editada.
   */
  sortableFields?: string[];
  /**
   * A ordenação que o BACKEND já aplica sozinho quando ninguém pede nada
   * (pedidos: `order_date desc`). Serve só para o cabeçalho mostrar por onde a
   * lista está ordenada antes do primeiro clique — NÃO entra nas variables,
   * justamente para as variáveis do estado inicial continuarem batendo, byte a
   * byte, com o fetch do SSR que semeia o cache.
   */
  backendDefaultSort?: ActiveSort;
  /**
   * Argumentos da query que ficam FORA do `input` (ex.: `companyClientId` em
   * `visitsByCompanyClient`). Entram nas variables ao lado dele, inclusive nas
   * do estado inicial — senão o cache semeado pelo SSR nunca acertaria.
   */
  extraVariables?: Record<string, unknown>;
  /**
   * Filtros fixos sempre aplicados, mesclados antes dos filtros de busca.
   * Use para listas escopadas a um pai (ex: `company_factory_id`, `product_id`).
   */
  baseFilters?: QueryFilter[];
  /**
   * Dados da 1ª página buscados no servidor (SSR), no shape da própria `query`
   * (ex.: `{ clients_list: connection }`). Quando presentes, semeiam o cache do
   * Apollo para as variáveis do estado default (página 1, sem busca) → o primeiro
   * render acerta o cache (`cache-first`) e pinta a lista sem waterfall de rede.
   * Busca/paginação/mutations seguem client normalmente.
   */
  initialData?: TData;
}

export interface UseTableDataReturn<TItem> {
  inputValues: Record<string, string>;
  setFilter: (key: string, value: string | undefined) => void;
  /** Aplica várias chaves numa tacada só (ex.: as duas pontas de um período). */
  setFilters: (patch: Record<string, string | undefined>) => void;
  clearFilters: () => void;
  displayedData: TItem[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  totalItems: number;
  loading: boolean;
  error?: Error;
  /** Entra inteiro no `Table.Root sort={...}`; cada `Table.Head` lê daí. */
  sort: TableSort;
  /**
   * A ordenação à vista no formato do `order` da query (`{ by, dir }`), ou
   * `null` quando a lista está na ordem crua do backend.
   *
   * Existe para quem precisa REFAZER a mesma consulta fora da tabela — a
   * exportação da lista, que varre todas as páginas. Sem isto o arquivo saía
   * sempre na ordem default: quem ordenou por valor e clicou em exportar
   * recebia uma planilha por data e conferia a lista errada.
   */
  order: { by: string; dir: TableSortDirection } | null;
  refetch: (variables?: Record<string, unknown>) => Promise<void>;
}

/**
 * Traduz os valores dos filtros da tela para o `filters` do BaseListInput.
 * Exportada para quem precisa refazer a MESMA busca fora da tabela — o export
 * da lista, que baixa todas as páginas do que está filtrado na tela.
 */
export function buildQueryFilters(
  fields: Record<string, FieldConfig>,
  values: Record<string, string>
) {
  return Object.entries(fields).flatMap(([key, config]) => {
    const value = values[key];
    if (!value) return [];
    return [
      {
        field: config.queryField,
        operator: config.operator ?? (config.type === "text" ? "like" : "eq"),
        value,
      },
    ];
  });
}

export const useTableData = <TData, TItem extends object>(
  options: UseTableDataOptions<TData, TItem>
): UseTableDataReturn<TItem> => {
  const {
    query,
    fields,
    getConnection,
    itemsPerPage = 10,
    sortableFields,
    backendDefaultSort,
    extraVariables,
    baseFilters,
    initialData,
  } = options;

  const searchParams = useSearchParams();
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

  const filters = useTableFilters(fields);

  const sortableFieldsString = JSON.stringify(sortableFields ?? []);

  /**
   * O que a URL pede. `null` quando ninguém clicou em nada — e é a AUSÊNCIA do
   * `order` nas variables que preserva o default do backend (e o acerto do
   * cache semeado pelo SSR).
   */
  const urlSort = useMemo((): ActiveSort | null => {
    const key = searchParams.get(SORT_KEY_PARAM);
    if (!key) return null;
    const allowed: string[] = JSON.parse(sortableFieldsString);
    if (!allowed.includes(key)) return null;
    return {
      key,
      direction: searchParams.get(SORT_DIR_PARAM) === "asc" ? "asc" : "desc",
    };
  }, [searchParams, sortableFieldsString]);

  const queryFilters = useMemo(
    () => buildQueryFilters(fields, filters.queryValues),
    [filters.queryValues, fields]
  );

  const queryFiltersString = useMemo(
    () => JSON.stringify(queryFilters),
    [queryFilters]
  );

  const baseFiltersString = JSON.stringify(baseFilters ?? []);

  // Filtros fixos (escopo) + filtros de busca. baseFilters tem `operator` opcional → default "eq".
  const allFilters = useMemo(
    () => [...(baseFilters ?? []).map(toQueryFilter), ...queryFilters],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseFiltersString, queryFiltersString]
  );

  const extraVariablesString = JSON.stringify(extraVariables ?? null);

  const variables = useMemo(
    () => ({
      ...extraVariables,
      input: {
        first: itemsPerPage,
        after: pageToAfter(currentPage, itemsPerPage),
        ...(allFilters.length > 0 && { filters: allFilters }),
        // Quem ordena é o banco: ordenar no cliente reordenaria só as 10 linhas
        // já baixadas, e "o maior pedido" seria o maior da página aberta.
        ...(urlSort && { order: { by: urlSort.key, dir: urlSort.direction } }),
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentPage, itemsPerPage, allFilters, urlSort, extraVariablesString]
  );

  // Variáveis do estado default (página 1, sem filtros de busca — só os fixos).
  // Precisa bater byte a byte com o fetch SSR do `page.tsx` para o cache acertar.
  const defaultVariables = useMemo(() => {
    const base = (baseFilters ?? []).map(toQueryFilter);
    return {
      ...extraVariables,
      input: {
        first: itemsPerPage,
        after: pageToAfter(1, itemsPerPage),
        ...(base.length > 0 && { filters: base }),
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsPerPage, baseFiltersString, extraVariablesString]);

  // Semeia o cache do Apollo uma única vez, antes de o `useAsyncQuery` abaixo
  // subscrever. Inicializador de `useState` → roda no 1º render, síncrono, antes
  // da leitura `cache-first`. Sem `initialData` (rotas ainda client), no-op.
  //
  // Só semeia se o SSR trouxe LINHAS de verdade: semear um connection vazio faria
  // o `cache-first` acertar um "hit" vazio e NÃO buscar no cliente — mostrando
  // lista vazia mesmo quando o servidor só falhou/degradou (e quebrando o E2E,
  // cujo stub devolve vazio). Vazio → deixa o cliente buscar normalmente.
  const apollo = useApolloClient();
  useState(() => {
    const seedEdges = initialData ? getConnection(initialData)?.edges : null;
    if (initialData && seedEdges && seedEdges.length > 0) {
      try {
        apollo.writeQuery({
          query,
          variables: defaultVariables,
          data: initialData,
        });
      } catch {
        // Shape divergente: ignora e deixa o fetch client resolver.
      }
    }
    return true;
  });

  const { data, loading, error, refetch } = useAsyncQuery<TData>(query, {
    variables,
    skip: false,
  });

  const connection = data ? getConnection(data) : null;

  const allItems = useMemo(
    () => connection?.edges?.map(({ node }) => node) ?? [],
    [connection]
  );

  const totalItems = useMemo(() => connection?.totalCount ?? 0, [connection]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / itemsPerPage)),
    [totalItems, itemsPerPage]
  );

  /**
   * O que o cabeçalho MOSTRA. Antes do primeiro clique é a ordem que o backend
   * já aplica sozinho — sem isto, a lista de pedidos apareceria como "sem
   * ordenação" enquanto está, de fato, da mais recente para a mais antiga.
   */
  // Desmontado em escalares: `backendDefaultSort` costuma ser um literal na
  // chamada, e um objeto novo a cada render remontaria `sort` a cada render.
  const defaultKey = backendDefaultSort?.key ?? null;
  const defaultDirection = backendDefaultSort?.direction ?? null;

  const activeSort = useMemo(
    (): ActiveSort | null =>
      urlSort ??
      (defaultKey && defaultDirection
        ? { key: defaultKey, direction: defaultDirection }
        : null),
    [urlSort, defaultKey, defaultDirection]
  );

  const onSort = useCallback(
    (key: string, firstDirection: TableSortDirection = "asc") => {
      const isActive = activeSort?.key === key;

      // Coluna já ordenada: inverte. Coluna nova: começa pela direção útil dela
      // (`sortFirst` no Table.Head) — quem clica em "Valor" quer o maior antes.
      const nextDirection: TableSortDirection = isActive
        ? activeSort!.direction === "asc"
          ? "desc"
          : "asc"
        : firstDirection;

      // Se a direção seguinte é justamente a que o backend já aplica por conta
      // própria, some com os parâmetros em vez de repeti-los: o resultado é o
      // mesmo e a URL volta a ser a da lista limpa — que é também a única que
      // acerta o cache semeado pelo SSR.
      const isBackendDefault =
        defaultKey === key && defaultDirection === nextDirection;

      filters.setParams(
        isBackendDefault
          ? { [SORT_KEY_PARAM]: undefined, [SORT_DIR_PARAM]: undefined }
          : { [SORT_KEY_PARAM]: key, [SORT_DIR_PARAM]: nextDirection }
      );
    },
    [filters, activeSort, defaultKey, defaultDirection]
  );

  const sort: TableSort = useMemo(
    () => ({
      key: activeSort?.key ?? null,
      direction: activeSort?.direction ?? "asc",
      onSort,
    }),
    [activeSort, onSort]
  );

  return {
    inputValues: filters.inputValues,
    setFilter: filters.setFilter,
    setFilters: filters.setFilters,
    clearFilters: filters.clearFilters,
    displayedData: allItems,
    currentPage: Math.min(currentPage, totalPages),
    setCurrentPage: filters.setPage,
    totalPages,
    totalItems,
    loading,
    error,
    sort,
    // O `activeSort`, e não o `urlSort`: quando a lista está na ordem que o
    // backend já aplica sozinho, o arquivo exportado tem de sair nela também —
    // e mandá-la explícita dá o mesmo resultado (ver `_apply_order`).
    order: activeSort
      ? { by: activeSort.key, dir: activeSort.direction }
      : null,
    refetch,
  };
};
