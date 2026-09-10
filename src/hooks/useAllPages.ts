import { isTruncated, MAX_SCAN_PAGES } from "@/utils/pagination";
import { DocumentNode } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";
import { useCallback, useEffect, useRef, useState } from "react";

export interface ConnectionPageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface Connection<TNode> {
  edges: { node: TNode }[];
  pageInfo: ConnectionPageInfo;
}

export interface UseAllPagesResult<TNode> {
  nodes: TNode[];
  loading: boolean;
  /**
   * A varredura falhou. `nodes` volta VAZIO quando isto está preenchido, e
   * lista vazia é indistinguível de "não há registro" — quem usa o hook tem de
   * olhar para cá antes de afirmar qualquer coisa na tela.
   */
  error: Error | null;
  /** Bateu no teto de páginas com o backend ainda oferecendo mais. */
  truncated: boolean;
  /** Refaz a varredura do zero (para o botão "tentar novamente"). */
  reload: () => void;
}

/**
 * Carrega TODAS as páginas de uma conexão e devolve os nós concatenados.
 *
 * Alguns usos precisam da lista inteira em memória (o preço de qualquer produto
 * tem de estar no mapa do pedido; a foto enviada em massa tem de achar o SKU
 * dela), que é uma operação diferente da paginação incremental do Apollo: aqui
 * não existe "carregar mais", existe "carregar tudo". Fazer isso com
 * `fetchMore` + `updateQuery` quebrava — sem `typePolicies`
 * cada `after` é uma entrada de cache própria, o `updateQuery` do Apollo 4
 * recebia `prev = null` e o merge estourava, derrubando o mapa de preços inteiro
 * (uma tabela real tem 1728 linhas, ou seja, sempre mais de uma página).
 *
 * `input` deve ser memoizado pelo chamador; `select` deve ser estável (definido
 * fora do componente).
 */
export function useAllPages<TNode, TData>(
  query: DocumentNode,
  input: Record<string, unknown> | null,
  select: (data: TData) => Connection<TNode> | undefined
): UseAllPagesResult<TNode> {
  const client = useApolloClient();
  const [nodes, setNodes] = useState<TNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [truncated, setTruncated] = useState(false);
  // Muda para refazer a varredura sem que o input tenha mudado.
  const [attempt, setAttempt] = useState(0);
  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  // O input entra na dep list serializado: assim o efeito reage ao CONTEÚDO do
  // filtro, e um chamador que esqueça de memoizar não vira laço infinito.
  const key = input ? JSON.stringify(input) : null;
  const inputRef = useRef(input);
  inputRef.current = input;

  useEffect(() => {
    const baseInput = inputRef.current;
    if (!key || !baseInput) {
      setNodes([]);
      setError(null);
      setTruncated(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setTruncated(false);

    (async () => {
      const all: TNode[] = [];
      let after: string | null = null;
      let pagesRead = 0;
      let hasMore = false;

      try {
        for (let page = 0; page < MAX_SCAN_PAGES; page++) {
          // Anotação explícita: sem ela o TS vê `after` alimentando as variables
          // e voltando de `data`, e desiste da inferência (TS7022).
          const result: { data?: TData } = await client.query<TData>({
            query,
            variables: { input: { ...baseInput, after } },
            fetchPolicy: "network-only",
          });
          const data = result.data;
          // Filtro trocou (outra fábrica, outra tabela) no meio da varredura:
          // descartar, senão sobrescreveria o resultado da busca nova.
          if (cancelled) return;

          const connection = data ? select(data) : undefined;
          if (!connection) break;
          all.push(...connection.edges.map((edge) => edge.node));
          pagesRead += 1;

          const { hasNextPage, endCursor } = connection.pageInfo ?? {};
          hasMore = Boolean(hasNextPage && endCursor);
          if (!hasMore) break;
          after = endCursor!;
        }
        if (!cancelled) {
          setNodes(all);
          setTruncated(isTruncated(pagesRead, hasMore));
        }
      } catch (err) {
        // Lista vazia em vez de exceção: derrubar a tela por uma varredura
        // incompleta seria pior. Mas o erro SAI daqui junto — a lista vazia
        // sozinha faria a tela dizer "não existe" por causa de uma queda de
        // rede, e quem chama não tinha como saber a diferença.
        if (!cancelled) {
          setNodes([]);
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key, client, query, select, attempt]);

  return { nodes, loading, error, truncated, reload };
}
