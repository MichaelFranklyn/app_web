"use client";

import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { COMMISSION_CACHE_FIELDS } from "@/utils/cacheFields";
import { useQuery } from "@apollo/client/react";
import { useCallback, useMemo } from "react";
import { COMMISSIONS_QUERY } from "./gql";
import { ignoresMonth } from "./help";
import { CommissionsResponse } from "./interface";
import {
  type CommissionTab,
  monthEndIso,
  monthStartIso,
  type YearMonth,
} from "./utils";

interface Params {
  /** De quem pedir as comissões; `null` = a empresa inteira (ou o dono da sessão). */
  sellerId: string | null;
  month: YearMonth;
  tab: CommissionTab;
  skip: boolean;
}

/**
 * A consulta da tela: as linhas de comissão do mês aberto.
 *
 * O período recorta no SERVIDOR: a tela mostra um mês por vez, e baixar a
 * carteira inteira para exibir cinquenta linhas piorava a cada mês de
 * histórico. `includeOverdue` é o pedido da aba que junta todos os
 * vencimentos — só ela precisa das linhas de fora do mês.
 */
export const useCommissionsQuery = ({ sellerId, month, tab, skip }: Params) => {
  const invalidateClient = useInvalidateQueriesClient();
  const { data, loading, error, refetch } = useQuery<CommissionsResponse>(
    COMMISSIONS_QUERY,
    {
      variables: {
        sellerId,
        from: monthStartIso(month),
        to: monthEndIso(month),
        includeOverdue: ignoresMonth(tab),
      },
      fetchPolicy: "cache-and-network",
      skip,
    }
  );

  const rows = useMemo(() => data?.commissions?.rows ?? [], [data]);
  const summary = data?.commissions;

  /**
   * Toda escrita desta tela (receber, pagar, conferir, estornar, dar baixa no
   * período, marcar inadimplente) passa por aqui. O refetch cuida da tela; o
   * invalidate cuida do relatório de comissões — que lê o MESMO campo com
   * outras variáveis — e do detalhe do pedido, onde a parcela também aparece.
   */
  const handleChanged = useCallback(() => {
    refetch();
    void invalidateClient(COMMISSION_CACHE_FIELDS);
  }, [refetch, invalidateClient]);

  return {
    rows,
    latestReceiveDate: summary?.latestReceiveDate ?? null,
    /** Erro sem nada para mostrar: a tela troca o conteúdo pelo aviso. */
    hasFailed: Boolean(error) && !summary,
    showSkeleton: loading && !summary,
    retry: refetch,
    handleChanged,
  };
};
