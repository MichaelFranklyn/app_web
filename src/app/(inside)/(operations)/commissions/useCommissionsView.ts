"use client";

import { useMemo } from "react";
import { CommissionMonthData } from "./interface";
import {
  factoryGroupFromServer,
  monthSummaryFromServer,
  officeSplitFromServer,
} from "./utils";

const NO_ROWS: CommissionMonthData["chargebacks"] = [];

/**
 * Os números e os recortes que a tela exibe, lidos da resposta do servidor.
 *
 * Nada aqui busca, guarda estado nem faz conta: as somas são do SERVIDOR, sobre
 * o resultado completo do recorte (mês, situação, ótica e filtros). Aqui os
 * decimais viram número uma vez só e os grupos ganham a forma que os cartões
 * leem. Fica separado para que mudar a apresentação não toque na consulta, e
 * vice-versa.
 */
export const useCommissionsView = (summary?: CommissionMonthData) => {
  const monthTotals = useMemo(
    () => monthSummaryFromServer(summary?.monthTotals),
    [summary]
  );
  const split = useMemo(() => officeSplitFromServer(summary?.split), [summary]);

  // Agrupado por fábrica trabalhada — é assim que a fábrica manda a planilha.
  const groups = useMemo(
    () => (summary?.groups ?? []).map(factoryGroupFromServer),
    [summary]
  );

  // A comissão de cada vendedor no mês: a referência do aviso de calote.
  const monthBySeller = useMemo(() => {
    const out: Record<string, number> = {};
    for (const item of summary?.sellerMonthCommissions ?? [])
      out[item.sellerId] = Number(item.amount);
    return out;
  }, [summary]);

  return {
    monthTotals,
    split,
    groups,
    monthBySeller,
    /** Estornos do vendedor em qualquer fase — não seguem mês nem aba. */
    chargebacks: summary?.chargebacks ?? NO_ROWS,
    /** Parcelas que a lista mostra, depois de mês, situação e filtros. */
    shown: summary?.totalCount ?? 0,
    /** O mesmo, ANTES do painel de filtros: com o que a frase de escopo compara. */
    scopeTotal: summary?.scopeTotal ?? 0,
    isFiltered: summary?.isFiltered ?? false,
    hasAnyCommission: summary?.hasAnyCommission ?? false,
  };
};
