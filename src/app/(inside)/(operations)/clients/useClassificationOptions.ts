"use client";

import { useMemo } from "react";

import { SelectOption } from "@/components/Input";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useIdleReady } from "@/hooks/useIdleReady";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";

import { CLIENT_NETWORKS_QUERY, CLIENT_SEGMENTS_QUERY } from "./gql";
import { ClassificationData } from "./interface";

const listInput = { order: { by: "name", dir: "asc" } };
// A conexão é opcional no tipo (erro parcial entrega `data` sem a chave); o
// hook aceita `undefined` e trata como "ainda não sei o total".
const getNetworks = (d: ClassificationData) => d.clientNetworks;
const getSegments = (d: ClassificationData) => d.clientSegments;

/**
 * Redes e segmentos da empresa, para os filtros da carteira e para a ficha do
 * cliente.
 *
 * São catálogos curtos (dezenas de itens): uma requisição basta — e, se um dia
 * passarem do teto da primeira página, o `useCompleteList` rebusca pelo total em
 * vez de esconder o resto.
 * Falha de carregamento vira aviso, não tela de erro — o resto dos filtros
 * continua servindo.
 */
export function useClassificationOptions() {
  // Catálogos de filtro, não conteúdo da página: saem depois que a tela pintou,
  // para não disputar rede e thread principal com a tabela da carteira.
  const idleReady = useIdleReady();

  const { data, loading, error } = useCompleteList<ClassificationData>(
    CLIENT_NETWORKS_QUERY,
    listInput,
    getNetworks,
    { skip: !idleReady }
  );
  const segments = useCompleteList<ClassificationData>(
    CLIENT_SEGMENTS_QUERY,
    listInput,
    getSegments,
    { skip: !idleReady }
  );

  useQueryErrorToast(error, "Não foi possível carregar as redes.");
  useQueryErrorToast(segments.error, "Não foi possível carregar os segmentos.");

  const networkOptions = useMemo<SelectOption[]>(
    () =>
      data?.clientNetworks?.edges.map(({ node }) => ({
        value: node.id,
        label: node.name,
      })) ?? [],
    [data]
  );

  const segmentOptions = useMemo<SelectOption[]>(
    () =>
      segments.data?.clientSegments?.edges.map(({ node }) => ({
        value: node.id,
        label: node.name,
      })) ?? [],
    [segments.data]
  );

  return {
    networkOptions,
    segmentOptions,
    // Inclui a espera: com `skip`, o `loading` do Apollo é false e os campos
    // apareceriam vazios como se a empresa não tivesse redes nem segmentos.
    loading: !idleReady || loading || segments.loading,
  };
}
