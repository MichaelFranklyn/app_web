"use client";

import { useApolloClient } from "@apollo/client/react";
import { DocumentNode } from "graphql";
import { useRef } from "react";

interface SeedEntry {
  query: DocumentNode;
  variables?: Record<string, unknown>;
  /** Resposta CRUA do servidor (shape da própria query, com __typename). */
  data: unknown;
}

/**
 * Semeia o cache do Apollo com respostas trazidas pelo SSR, antes que qualquer
 * `useQuery` da árvore subscreva.
 *
 * Existe para páginas de DETALHE, onde o `initialData` do `useTableData` não
 * serve: lá o seed é de um connection paginado; aqui são queries quaisquer,
 * inclusive as de shape `DataResponse`.
 *
 * O ganho é o waterfall. Sem seed, o navegador só descobre que precisa dos dados
 * depois de baixar e executar o JS da rota, e uma query aninhada só sai depois
 * que a do pai volta. Com o cache quente, o `cache-first` acerta no 1º render e
 * a página pinta sem ida à rede.
 *
 * Semeia DURANTE o render, não em `useEffect`: no efeito seria tarde — as
 * queries já teriam saído para a rede, que é exatamente o que se quer evitar.
 *
 * `seedKey` refaz o seed quando a página troca de registro (ex.: navegar de um
 * pedido para outro). Sem ela, o React reaproveitaria a instância do componente
 * — mesma rota, só o parâmetro muda — e o segundo registro nunca seria semeado.
 *
 * Entrada `data` nula (SSR falhou, backend fora, sessão expirada) é ignorada: o
 * cliente busca normalmente. Semear vazio seria pior que não semear — o
 * `cache-first` acertaria um "hit" vazio e a tela ficaria parada sem tentar de novo.
 */
export function useSeedQuery(entries: SeedEntry[], seedKey?: string): void {
  const apollo = useApolloClient();
  const seededKey = useRef<string | null>(null);

  const key = seedKey ?? "__once__";

  if (seededKey.current !== key) {
    seededKey.current = key;

    for (const { query, variables, data } of entries) {
      if (!data) continue;
      try {
        apollo.writeQuery({ query, variables, data });
      } catch {
        // Shape divergente do documento: ignora e deixa o fetch client resolver.
      }
    }
  }
}
