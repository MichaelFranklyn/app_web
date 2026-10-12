"use client";

import { TableSort, TableSortDirection } from "@/components/Table";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export const LOCAL_SORT_KEY_PARAM = "sortBy";
export const LOCAL_SORT_DIR_PARAM = "sortDir";

type SetParams = (patch: Record<string, string | undefined>) => void;

/**
 * Ordenação por coluna guardada na URL (`sortBy`/`sortDir`), com chave livre.
 *
 * Mora fora do `useLocalTable` porque não depende de quem ordena: lá é o
 * navegador (a lista inteira em memória); no relatório de comissões é o
 * servidor, que recebe a chave pronta. O ciclo de cliques e a URL são os mesmos.
 */
export const useUrlSort = (
  sortKeys: string[],
  setParams: SetParams
): TableSort => {
  const searchParams = useSearchParams();
  const sortKeysString = JSON.stringify(sortKeys);

  const activeSort = useMemo(() => {
    const key = searchParams.get(LOCAL_SORT_KEY_PARAM);
    if (!key) return null;
    // Um `sortBy` desconhecido na URL não pode fazer a coluna sumir do
    // cabeçalho enquanto a lista finge estar ordenada.
    const allowed: string[] = JSON.parse(sortKeysString);
    if (!allowed.includes(key)) return null;
    return {
      key,
      direction: (searchParams.get(LOCAL_SORT_DIR_PARAM) === "desc"
        ? "desc"
        : "asc") as TableSortDirection,
    };
  }, [searchParams, sortKeysString]);

  /**
   * Ciclo de TRÊS estados: direção útil da coluna → inversa → sem ordenação.
   *
   * O `useTableData` para em dois porque lá a volta existe por outro caminho (a
   * coluna do `backendDefaultSort`). Aqui não há default para exibir, e a ordem
   * de origem costuma querer dizer alguma coisa — nos itens de um pedido ela é
   * a ordem da planilha importada. Sem o terceiro clique, ordenar por preço uma
   * vez apagaria essa leitura até recarregar a página.
   */
  const onSort = useCallback(
    (key: string, firstDirection: TableSortDirection = "asc") => {
      const isActive = activeSort?.key === key;

      if (isActive && activeSort!.direction !== firstDirection) {
        setParams({
          [LOCAL_SORT_KEY_PARAM]: undefined,
          [LOCAL_SORT_DIR_PARAM]: undefined,
        });
        return;
      }

      setParams({
        [LOCAL_SORT_KEY_PARAM]: key,
        [LOCAL_SORT_DIR_PARAM]: isActive
          ? activeSort!.direction === "asc"
            ? "desc"
            : "asc"
          : firstDirection,
      });
    },
    [setParams, activeSort]
  );

  return useMemo(
    () => ({
      key: activeSort?.key ?? null,
      direction: activeSort?.direction ?? "asc",
      onSort,
    }),
    [activeSort, onSort]
  );
};
