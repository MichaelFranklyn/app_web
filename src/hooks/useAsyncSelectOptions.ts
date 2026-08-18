"use client";

import { SelectOption } from "@/components/Input";
import { DocumentNode } from "@apollo/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAsyncQuery } from "./useAsyncQuery";

interface UseAsyncSelectOptionsArgs<TData, TNode> {
  query: DocumentNode;
  /** Extrai a connection (edges) da resposta da query. */
  getConnection: (data: TData) => { edges: { node: TNode }[] };
  /** Converte um nó em opção do select. */
  toOption: (node: TNode) => SelectOption;
  /** Campo do backend para o filtro `like` (ex.: "name", "razao_social,nome_fantasia"). */
  searchField: string;
  /**
   * Filtros que valem sempre, somados ao `like` da busca — o escopo do catálogo
   * (ex.: os produtos DESTA fábrica). Sem eles, um select escopado teria de
   * escolher entre paginar e filtrar.
   */
  baseFilters?: readonly { field: string; operator: string; value: string }[];
  /** Quantos itens buscar por vez (página server-side). */
  first?: number;
  /**
   * Ordem da página vinda do backend (`{ by: "name", dir: "asc" }`). Sem ela o
   * banco devolve as linhas na ordem que quiser — o que numa lista de escolha
   * significa a mesma busca sair em ordens diferentes.
   */
  order?: { by: string; dir: "asc" | "desc" };
  /** Pula o fetch (ex.: modal fechado). */
  skip?: boolean;
  /** Debounce da digitação antes de bater no backend. */
  debounceMs?: number;
}

/**
 * Opções de select buscadas no servidor: substitui o padrão `first: 200` (que
 * puxa tudo e pode até truncar listas grandes) por uma busca `like` paginada e
 * com debounce. Devolve `{ options, loading, onSearch }` prontos para o
 * `InputSelect` no modo assíncrono (props `onSearch`/`loading`).
 *
 * Enquanto o usuário não digita, traz a 1ª página (`first`); a cada termo,
 * refaz o fetch filtrado. O cache-first do Apollo evita rebuscar o mesmo termo.
 */
export function useAsyncSelectOptions<TData, TNode>({
  query,
  getConnection,
  toOption,
  searchField,
  baseFilters,
  first = 20,
  order,
  skip = false,
  debounceMs = 300,
}: UseAsyncSelectOptionsArgs<TData, TNode>) {
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebounced(term), debounceMs);
    return () => clearTimeout(id);
  }, [term, debounceMs]);

  // Serializado na dep list de propósito: o chamador quase sempre monta o array
  // de escopo inline, e comparar por referência refaria o fetch a cada render.
  const baseFiltersKey = JSON.stringify(baseFilters ?? []);

  // Mesmo motivo do `baseFiltersKey`: o chamador monta o objeto inline.
  const orderKey = JSON.stringify(order ?? null);

  const variables = useMemo(() => {
    const value = debounced.trim();
    const filters = [
      ...(JSON.parse(baseFiltersKey) as {
        field: string;
        operator: string;
        value: string;
      }[]),
      ...(value ? [{ field: searchField, operator: "like", value }] : []),
    ];
    const parsedOrder = JSON.parse(orderKey) as {
      by: string;
      dir: string;
    } | null;
    return {
      input: {
        first,
        ...(filters.length ? { filters } : {}),
        ...(parsedOrder ? { order: parsedOrder } : {}),
      },
    };
  }, [first, debounced, searchField, baseFiltersKey, orderKey]);

  const { data, loading } = useAsyncQuery<TData>(query, { variables, skip });

  // Encadeamento opcional de propósito: com `errorPolicy: "all"`, uma query que
  // falha em parte entrega `data` sem a chave da connection. Sem isso, um
  // select de apoio quebrava a PÁGINA inteira que o hospeda.
  const nodes = useMemo<TNode[]>(
    () => (data ? (getConnection(data)?.edges?.map((e) => e.node) ?? []) : []),
    [data, getConnection]
  );

  const options = useMemo<SelectOption[]>(
    () => nodes.map(toOption),
    [nodes, toOption]
  );

  const onSearch = useCallback((t: string) => setTerm(t), []);

  // `nodes` são os mesmos itens de `options`, ainda inteiros: quem precisa de um
  // atributo que não cabe no par value/label (o rótulo da embalagem do produto,
  // por exemplo) lê daqui em vez de refazer a consulta.
  return { options, nodes, loading, onSearch };
}
