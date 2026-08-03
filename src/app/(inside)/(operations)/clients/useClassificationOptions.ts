"use client";

import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";

import { SelectOption } from "@/components/Input";
import { useIdleReady } from "@/hooks/useIdleReady";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";

import { CLIENT_NETWORKS_QUERY, CLIENT_SEGMENTS_QUERY } from "./gql";
import { ClassificationData } from "./interface";

const listInput = { first: 200, order: { by: "name", dir: "asc" } };

/**
 * Redes e segmentos da empresa, para os filtros da carteira e para a ficha do
 * cliente.
 *
 * São catálogos curtos (dezenas de itens): uma página basta e não vale paginar.
 * Falha de carregamento vira aviso, não tela de erro — o resto dos filtros
 * continua servindo.
 */
export function useClassificationOptions() {
  // Catálogos de filtro, não conteúdo da página: saem depois que a tela pintou,
  // para não disputar rede e thread principal com a tabela da carteira.
  const idleReady = useIdleReady();

  const { data, loading, error } = useQuery<ClassificationData>(
    CLIENT_NETWORKS_QUERY,
    { variables: { input: listInput }, skip: !idleReady }
  );
  const segments = useQuery<ClassificationData>(CLIENT_SEGMENTS_QUERY, {
    variables: { input: listInput },
    skip: !idleReady,
  });

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
