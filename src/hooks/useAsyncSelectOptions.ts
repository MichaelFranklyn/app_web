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
    /**
     * Com `pageInfo { hasNextPage endCursor }` na query, a lista vira busca
     * paginada: rolar até o fim traz a próxima página (`onLoadMore`).
     */
    pageInfo?: { hasNextPage: boolean; endCursor?: string | null };
  };
  /** Converte um nó em opção do select. */
  toOption: (node: TNode) => SelectOption;
  /** Campo do backend para o filtro `like` (ex.: "name"; nas listas de cliente, "search" busca nome e CNPJ). */
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

  const baseVariables = useMemo(() => {
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

  // A "busca" atual (termo + escopo). Trocou, a paginação recomeça do zero.
  const searchKey = JSON.stringify(baseVariables);

  // Cursor da página pedida pela rolagem — só vale para a busca em que nasceu.
  const [cursor, setCursor] = useState<{ key: string; after: string } | null>(
    null
  );
  const after = cursor?.key === searchKey ? cursor.after : null;

  const variables = useMemo(
    () =>
      after ? { input: { ...baseVariables.input, after } } : baseVariables,
    [baseVariables, after]
  );

  const { data, loading } = useAsyncQuery<TData>(query, { variables, skip });

  // Encadeamento opcional de propósito: com `errorPolicy: "all"`, uma query que
  // falha em parte entrega `data` sem a chave da connection. Sem isso, um
  // select de apoio quebrava a PÁGINA inteira que o hospeda.
  const connection = data ? getConnection(data) : undefined;
  const pageNodes = useMemo<TNode[]>(
    () => connection?.edges?.map((e) => e.node) ?? [],
    [connection]
  );

  // Páginas já carregadas desta busca, na ordem. A página nova se soma às
  // anteriores; uma busca nova começa a lista de novo.
  const [loaded, setLoaded] = useState<{
    key: string;
    after: string | null;
    nodes: TNode[];
    endCursor: string | null;
    hasNextPage: boolean;
  } | null>(null);

  useEffect(() => {
    if (!connection || loading) return;
    const endCursor = connection.pageInfo?.endCursor ?? null;
    const hasNextPage = connection.pageInfo?.hasNextPage ?? false;
    setLoaded((prev) => {
      if (prev && prev.key === searchKey && prev.after === after) return prev;
      const base = after && prev && prev.key === searchKey ? prev.nodes : [];
      return {
        key: searchKey,
        after,
        nodes: after ? [...base, ...pageNodes] : pageNodes,
        endCursor,
        hasNextPage,
      };
    });
  }, [connection, loading, pageNodes, searchKey, after]);

  const current = loaded?.key === searchKey ? loaded : null;
  // Enquanto a 2ª página chega, a lista mostra as já carregadas.
  const nodes = current ? current.nodes : pageNodes;
  const hasMore = current
    ? current.hasNextPage
    : (connection?.pageInfo?.hasNextPage ?? false);
  const endCursor = current
    ? current.endCursor
    : (connection?.pageInfo?.endCursor ?? null);

  const onLoadMore = useCallback(() => {
    if (!hasMore || !endCursor || loading) return;
    setCursor({ key: searchKey, after: endCursor });
  }, [hasMore, endCursor, loading, searchKey]);

  const options = useMemo<SelectOption[]>(
    () => nodes.map(toOption),
    [nodes, toOption]
  );

  const onSearch = useCallback((t: string) => setTerm(t), []);

  // Catálogo pequeno não precisa de ida ao servidor a cada tecla: se a primeira
  // página (a que vem SEM termo) já trouxe tudo, o select filtra em memória.
  // A decisão é tomada uma vez e mantida — trocar de modo no meio da digitação
  // faria a lista piscar entre dois comportamentos.
  // A decisão vale para o ESCOPO (filtros-base): trocou a fábrica do catálogo,
  // decide de novo — a fábrica anterior podia ser pequena e esta, grande.
  const completeRef = useRef<{ scope: string; complete: boolean } | null>(null);
  const total = connection?.totalCount;
  if (completeRef.current?.scope !== baseFiltersKey) completeRef.current = null;
  if (
    completeRef.current === null &&
    !debounced.trim() &&
    !after &&
    total !== undefined &&
    !loading
  ) {
    completeRef.current = {
      scope: baseFiltersKey,
      complete: pageNodes.length >= total,
    };
  }
  const isComplete = completeRef.current?.complete === true;

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
    /** Há mais páginas desta busca no servidor (pede `pageInfo` na query). */
    hasMore: !isComplete && hasMore,
    /** Traz a próxima página — o select chama ao rolar até o fim. */
    onLoadMore,
  };
}
