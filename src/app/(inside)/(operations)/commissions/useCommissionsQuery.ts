"use client";

import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { COMMISSION_CACHE_FIELDS } from "@/utils/cacheFields";
import { useQuery } from "@apollo/client/react";
import { useCallback, useMemo } from "react";
import { COMMISSIONS_QUERY } from "./gql";
import { CommissionMonthInput, CommissionsResponse } from "./interface";
import {
  type CommissionAudience,
  type CommissionTab,
  monthEndIso,
  monthStartIso,
  type YearMonth,
} from "./utils";

/** Parcelas por página em cada cartão de fábrica. */
export const COMMISSIONS_PAGE_SIZE = 50;

interface Params {
  /** De quem pedir as comissões; `null` = a empresa inteira (ou o dono da sessão). */
  sellerId: string | null;
  audience: CommissionAudience;
  month: YearMonth;
  tab: CommissionTab;
  /** Filtros do painel e ordenação, já nos nomes do servidor. */
  panelInput: Record<string, string>;
  skip: boolean;
}

/**
 * A consulta da tela: o mês aberto, somado no SERVIDOR.
 *
 * Mês, situação, ótica, filtros e ordenação vão na consulta; de volta vêm os
 * números prontos e a primeira página do primeiro cartão. Antes a tela baixava
 * todas as parcelas do recorte e fazia as contas aqui — num mês com uma baixa
 * em lote eram milhares de linhas e megabytes para mostrar três cartões.
 */
export const useCommissionsQuery = ({
  sellerId,
  audience,
  month,
  tab,
  panelInput,
  skip,
}: Params) => {
  const invalidateClient = useInvalidateQueriesClient();

  // O recorte inteiro, sem a página: é o MESMO para o resumo e para as páginas
  // de cada fábrica (ver `useFactoryRows`).
  const input = useMemo<CommissionMonthInput>(
    () => ({
      from: monthStartIso(month),
      to: monthEndIso(month),
      sellerId,
      audience,
      tab,
      ...panelInput,
    }),
    [month, sellerId, audience, tab, panelInput]
  );

  const { data, previousData, loading, error, refetch } =
    useQuery<CommissionsResponse>(COMMISSIONS_QUERY, {
      variables: { input, first: COMMISSIONS_PAGE_SIZE },
      fetchPolicy: "cache-and-network",
      skip,
    });

  // Trocar de aba, de filtro ou de ordem agora é uma ida ao servidor: a
  // resposta anterior fica na tela até a nova chegar, em vez de piscar o
  // esqueleto a cada clique. `fresh` é só a resposta do recorte PEDIDO — quem
  // decide com ela (o recuo de mês) não pode ler a de outro mês.
  const fresh = data?.commission_month;
  const shown = data ?? previousData;

  /**
   * Toda escrita desta tela (receber, pagar, conferir, estornar, dar baixa no
   * período, marcar inadimplente) passa por aqui. O refetch cuida do resumo; o
   * invalidate derruba as páginas das fábricas (os cartões abertos refazem a
   * busca), o relatório de comissões e o detalhe do pedido, onde a parcela
   * também aparece.
   */
  const handleChanged = useCallback(() => {
    refetch();
    void invalidateClient(COMMISSION_CACHE_FIELDS);
  }, [refetch, invalidateClient]);

  return {
    input,
    summary: shown?.commission_month,
    firstCard: shown?.first_card,
    /** A resposta já é a do recorte pedido (e não a anterior, ainda na tela). */
    isCurrent: Boolean(data),
    latestReceiveDate: fresh?.latestReceiveDate ?? null,
    hasMovement: fresh?.hasMovement ?? null,
    /** Erro sem nada para mostrar: a tela troca o conteúdo pelo aviso. */
    hasFailed: Boolean(error) && !shown,
    showSkeleton: loading && !shown,
    /** Buscando de novo com a resposta anterior ainda na tela. */
    isRefreshing: loading && Boolean(shown),
    retry: refetch,
    handleChanged,
  };
};
