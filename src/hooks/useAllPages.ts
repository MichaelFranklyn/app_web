import { DocumentNode } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";
import { useEffect, useRef, useState } from "react";

export interface ConnectionPageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface Connection<TNode> {
  edges: { node: TNode }[];
  pageInfo: ConnectionPageInfo;
}

/** Teto de segurança: 50 páginas × first = muito além de qualquer catálogo real.
 * Cursor quebrado (hasNextPage sempre true) trava o browser em vez de avisar. */
const MAX_PAGES = 50;

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
): { nodes: TNode[]; loading: boolean } {
  const client = useApolloClient();
  const [nodes, setNodes] = useState<TNode[]>([]);
  const [loading, setLoading] = useState(false);

  // O input entra na dep list serializado: assim o efeito reage ao CONTEÚDO do
  // filtro, e um chamador que esqueça de memoizar não vira laço infinito.
  const key = input ? JSON.stringify(input) : null;
  const inputRef = useRef(input);
  inputRef.current = input;

  useEffect(() => {
    const baseInput = inputRef.current;
    if (!key || !baseInput) {
      setNodes([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      const all: TNode[] = [];
      let after: string | null = null;

      try {
        for (let page = 0; page < MAX_PAGES; page++) {
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

          const { hasNextPage, endCursor } = connection.pageInfo ?? {};
          if (!hasNextPage || !endCursor) break;
          after = endCursor;
        }
        if (!cancelled) setNodes(all);
      } catch {
        // Lista vazia em vez de exceção: quem usa o hook decide como avisar.
        // Derrubar a tela por uma varredura incompleta seria pior.
        if (!cancelled) setNodes([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key, client, query, select]);

  return { nodes, loading };
}
