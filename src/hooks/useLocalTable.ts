"use client";

import { TableSort } from "@/components/Table";
import { useMemo } from "react";
import { FieldConfig, useTableFilters } from "./useTableFilters";
import { useUrlSort } from "./useUrlSort";

export { LOCAL_SORT_DIR_PARAM, LOCAL_SORT_KEY_PARAM } from "./useUrlSort";

/** O que dá para comparar numa coluna. `null`/`undefined` = célula vazia. */
export type SortableValue = string | number | Date | null | undefined;

export interface LocalField<TItem> {
  type: "text" | "select";
  /** Só para `text`: ms até o termo valer. Padrão do `useTableFilters`: 300. */
  debounce?: number;
  /** O item entra na lista com este valor escolhido? */
  match: (item: TItem, value: string) => boolean;
}

export interface UseLocalTableOptions<TItem> {
  items: TItem[];
  /**
   * Colunas ordenáveis: a chave é o `sortKey` do `Table.Head`, o valor diz o
   * que comparar. Aqui a chave é livre (não precisa ser coluna de banco), ao
   * contrário do `useTableData` — quem ordena é o navegador.
   */
  columns?: Record<string, (item: TItem) => SortableValue>;
  /** Filtros do painel: a chave é a `key` do `FilterField`. */
  fields?: Record<string, LocalField<TItem>>;
}

export interface UseLocalTableReturn<TItem> {
  /** Filtrado e ordenado, pronto para o `map` da tabela. */
  displayedData: TItem[];
  /** Entra inteiro no `Table.Root sort={...}`. */
  sort: TableSort;
  inputValues: Record<string, string>;
  setFilter: (key: string, value: string | undefined) => void;
  setFilters: (patch: Record<string, string | undefined>) => void;
  clearFilters: () => void;
  /** Quantas linhas sobraram do filtro (para o rodapé e o estado vazio). */
  totalItems: number;
  /** Quantas existiam antes do filtro — distingue "vazio" de "nada encontrado". */
  totalUnfiltered: number;
}

const collator = new Intl.Collator("pt-BR", {
  numeric: true,
  sensitivity: "base",
});

const toComparable = (value: SortableValue): string | number | null => {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return value.getTime();
  return value;
};

/** Compara duas células PREENCHIDAS. O vazio é decidido fora — ver `compareCells`. */
const compareFilled = (
  left: string | number,
  right: string | number
): number => {
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }
  return collator.compare(String(left), String(right));
};

/**
 * Compara duas células já com a direção aplicada.
 *
 * A direção multiplica SÓ a comparação entre valores preenchidos. Célula vazia
 * vai para o fim nas duas direções, e por isso é resolvida antes do fator: um
 * "—" não é o menor valor da coluna, é a ausência de valor. Deixá-lo entrar na
 * inversão faria a busca pelo "faturamento mais recente" começar por quem nunca
 * faturou, empurrando a resposta para baixo.
 */
const compareCells = (
  a: SortableValue,
  b: SortableValue,
  factor: 1 | -1
): number => {
  const left = toComparable(a);
  const right = toComparable(b);

  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;

  const result = compareFilled(left, right);
  // Empate não inverte: `sort` é estável, e manter o 0 preserva a ordem de
  // origem como critério de desempate.
  return result === 0 ? 0 : result * factor;
};

/**
 * Filtro e ordenação para tabelas cujos dados JÁ ESTÃO todos em memória — abas
 * de detalhe, itens de um pedido, listas curtas buscadas de uma vez.
 *
 * É o irmão do `useTableData`, que serve às listas paginadas no servidor. A
 * diferença não é de estilo: lá, ordenar no cliente mentiria (reordenaria as 10
 * linhas da página aberta e chamaria isso de "maior valor"); aqui a lista inteira
 * está na mão, então ordenar em memória é exato — e instantâneo, sem ida à rede.
 *
 * O recorte mora na URL, como no resto do app: a aba filtrada pode ser copiada
 * e mandada para outra pessoa.
 */
export const useLocalTable = <TItem>({
  items,
  columns,
  fields,
}: UseLocalTableOptions<TItem>): UseLocalTableReturn<TItem> => {
  const fieldKeys = Object.keys(fields ?? {});
  const fieldKeysString = JSON.stringify(fieldKeys);

  // O `useTableFilters` cuida da URL, do debounce do texto e do "limpar". Ele
  // pede `queryField` porque nasceu para montar filtro de GraphQL; aqui não há
  // consulta nenhuma, então a própria chave serve de nome.
  const filterConfig = useMemo(() => {
    const config: Record<string, FieldConfig> = {};
    Object.entries(fields ?? {}).forEach(([key, field]) => {
      config[key] =
        field.type === "text"
          ? { type: "text", queryField: key, debounce: field.debounce }
          : { type: "select", queryField: key };
    });
    return config;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldKeysString]);

  const filters = useTableFilters(filterConfig);
  const sort = useUrlSort(Object.keys(columns ?? {}), filters.setParams);
  const activeSort = useMemo(
    () => (sort.key ? { key: sort.key, direction: sort.direction } : null),
    [sort.key, sort.direction]
  );

  // Filtra pelos valores JÁ debounceados (`queryValues`): usar o que está sendo
  // digitado refaria a lista a cada tecla.
  const filtered = useMemo(() => {
    const active = Object.entries(filters.queryValues).filter(
      ([key, value]) => Boolean(value) && fields?.[key]
    );
    if (active.length === 0) return items;

    return items.filter((item) =>
      active.every(([key, value]) => fields![key].match(item, value))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, filters.queryValues, fieldKeysString, fields]);

  const displayedData = useMemo(() => {
    if (!activeSort || !columns?.[activeSort.key]) return filtered;

    const read = columns[activeSort.key];
    const factor: 1 | -1 = activeSort.direction === "asc" ? 1 : -1;

    // Cópia antes de ordenar: `sort` é in-place e `items` costuma vir de um
    // `useMemo` do chamador — reordenar ali embaralharia a lista de origem.
    return [...filtered].sort((a, b) => compareCells(read(a), read(b), factor));
  }, [filtered, activeSort, columns]);

  return {
    displayedData,
    sort,
    inputValues: filters.inputValues,
    setFilter: filters.setFilter,
    setFilters: filters.setFilters,
    clearFilters: filters.clearFilters,
    totalItems: filtered.length,
    totalUnfiltered: items.length,
  };
};
