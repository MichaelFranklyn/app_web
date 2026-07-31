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
  /** Quantos itens buscar por vez (página server-side). */
  first?: number;
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
  first = 20,
  skip = false,
  debounceMs = 300,
}: UseAsyncSelectOptionsArgs<TData, TNode>) {
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebounced(term), debounceMs);
    return () => clearTimeout(id);
  }, [term, debounceMs]);

  const variables = useMemo(() => {
    const value = debounced.trim();
    return {
      input: {
        first,
        ...(value
          ? { filters: [{ field: searchField, operator: "like", value }] }
          : {}),
      },
    };
  }, [first, debounced, searchField]);

  const { data, loading } = useAsyncQuery<TData>(query, { variables, skip });

  // Encadeamento opcional de propósito: com `errorPolicy: "all"`, uma query que
  // falha em parte entrega `data` sem a chave da connection. Sem isso, um
  // select de apoio quebrava a PÁGINA inteira que o hospeda.
  const options = useMemo<SelectOption[]>(
    () =>
      data
        ? (getConnection(data)?.edges?.map((e) => toOption(e.node)) ?? [])
        : [],
    [data, getConnection, toOption]
  );

  const onSearch = useCallback((t: string) => setTerm(t), []);

  return { options, loading, onSearch };
}
