"use client";

import { DocumentNode } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

/** Conexão com a contagem total — é o `totalCount` que denuncia o truncamento. */
export interface CountedConnection<TNode> {
  edges: { node: TNode }[];
  totalCount: number;
}

interface Options {
  skip?: boolean;
  /** Tamanho da primeira busca. Uma só requisição enquanto couber tudo nela. */
  initialFirst?: number;
}

/**
 * Lista curta carregada por INTEIRO, sem teto escondido.
 *
 * O padrão `first: 200` é uma aposta: enquanto o catálogo couber, funciona; no
 * dia em que passar, o select some com o registro e não avisa ninguém — foi
 * assim que um produto cadastrado "não existia" para a tela.
 *
 * Aqui a primeira busca traz `totalCount` junto. Se ele for maior do que o que
 * veio, o hook refaz a consulta pedindo exatamente o total. O caso comum
 * (níveis, vendedores, unidades, regras de imposto) resolve em UMA requisição,
 * igual a antes; o caso que cresceu resolve em duas, em vez de mentir.
 *
 * Devolve o mesmo formato do `useQuery` — quem já lia `data`/`error`/`refetch`
 * continua lendo. Para catálogo realmente grande (produtos, clientes), o certo
 * continua sendo `useAsyncSelectOptions`: baixar 800 itens para escolher um é
 * desperdício, mesmo sem truncar.
 *
 * `input` (sem `first`) e `getConnection` devem ser estáveis.
 */
export function useCompleteList<TData, TNode = unknown>(
  query: DocumentNode,
  input: Record<string, unknown>,
  getConnection: (data: TData) => CountedConnection<TNode> | undefined,
  { skip = false, initialFirst = 200 }: Options = {}
) {
  const [first, setFirst] = useState(initialFirst);

  // Serializado de propósito: o chamador quase sempre monta o objeto inline, e
  // comparar por referência refaria o fetch a cada render.
  const inputKey = JSON.stringify(input ?? {});
  const variables = useMemo(
    () => ({ input: { ...(JSON.parse(inputKey) as object), first } }),
    [inputKey, first]
  );

  const result = useQuery<TData>(query, { variables, skip });

  // A rebusca pelo total pode falhar (rede, timeout). Cair para `previousData`
  // devolve a página que já estava na mão: ficar sem lista nenhuma seria pior do
  // que ficar com uma lista parcial — que `isComplete` denuncia logo abaixo.
  const data = result.data ?? result.previousData;
  const connection = data ? getConnection(data) : undefined;
  const total = connection?.totalCount;
  const carregados = connection?.edges.length ?? 0;

  useEffect(() => {
    if (total !== undefined && total > carregados && first < total) {
      setFirst(total);
    }
  }, [total, carregados, first]);

  // Enquanto a segunda busca não volta, a lista ainda está incompleta: quem
  // desenha um "nenhum resultado" precisa saber que não é resposta final.
  const isComplete = total === undefined || carregados >= total;

  return { ...result, data, isComplete };
}
