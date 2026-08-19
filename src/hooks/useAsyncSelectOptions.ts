"use client";

import { SelectOption } from "@/components/Input";
import { DocumentNode } from "@apollo/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAsyncQuery } from "./useAsyncQuery";

interface UseAsyncSelectOptionsArgs<TData, TNode> {
  query: DocumentNode;
  /**
   * Extrai a connection da resposta da query.
   *
   * Peça `totalCount` na query sempre que puder: é com ele que o hook sabe se a
   * primeira página já trouxe o catálogo INTEIRO — e, nesse caso, devolve
   * `onSearch: undefined` para o select filtrar em memória, instantâneo. Sem
   * `totalCount` o hook assume catálogo grande e busca sempre no servidor.
   */
  getConnection: (data: TData) => {
    edges: { node: TNode }[];
    totalCount?: number;
  };
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
 *
 * **Adapta-se ao tamanho do catálogo.** Com `totalCount` na query, uma lista que
 * coube inteira na primeira página devolve `onSearch: undefined` — o select
 * volta a filtrar em memória, sem latência, e nada muda para o usuário. Se um
 * dia essa mesma lista passar do `first`, o hook liga a busca no servidor
 * sozinho. É o que impede um catálogo pequeno de virar, com o tempo, um select
 * que esconde registro.
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

  // Catálogo pequeno não precisa de ida ao servidor a cada tecla: se a primeira
  // página (a que vem SEM termo) já trouxe tudo, o select filtra em memória.
  // A decisão é tomada uma vez e mantida — trocar de modo no meio da digitação
  // faria a lista piscar entre dois comportamentos.
  const completeRef = useRef<boolean | null>(null);
  const connection = data ? getConnection(data) : undefined;
  const total = connection?.totalCount;
  if (
    completeRef.current === null &&
    !debounced.trim() &&
    total !== undefined &&
    !loading
  ) {
    completeRef.current = nodes.length >= total;
  }
  const isComplete = completeRef.current === true;

  // `nodes` são os mesmos itens de `options`, ainda inteiros: quem precisa de um
  // atributo que não cabe no par value/label (o rótulo da embalagem do produto,
  // por exemplo) lê daqui em vez de refazer a consulta.
  return {
    options,
    nodes,
    loading,
    /** `undefined` quando a lista inteira já está na mão (filtro local). */
    onSearch: isComplete ? undefined : onSearch,
    isComplete,
  };
}
