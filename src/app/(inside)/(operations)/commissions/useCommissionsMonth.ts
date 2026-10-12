"use client";

import { getTodayIso } from "@/utils/format/date";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CommissionRow } from "./interface";
import {
  addMonths,
  isBeforeMonth,
  isInMonth,
  type YearMonth,
  yearMonthFromIso,
} from "./utils";

/**
 * Navegador de mês global (pela data em que a comissão cai).
 *
 * Abre no MÊS CORRENTE — é o mês que a pessoa veio ver — e só recua quando
 * ele está vazio (ver `useMonthFallback`). Depois disso respeita a navegação:
 * ao trocar de vendedor, mantém o mês para comparar "agosto de um" vs "agosto
 * de outro".
 */
export const useCommissionsMonth = () => {
  const [month, setMonth] = useState(() => yearMonthFromIso(getTodayIso()));
  const [isPinned, setIsPinned] = useState(false);

  const isCurrentMonth = useMemo(() => {
    const now = yearMonthFromIso(getTodayIso());
    return now.year === month.year && now.month === month.month;
  }, [month]);

  // Toda navegação FIXA o mês: a partir dela quem manda é a pessoa, e o recuo
  // automático não volta a mexer.
  const goPrevious = useCallback(() => {
    setIsPinned(true);
    setMonth((m) => addMonths(m, -1));
  }, []);
  const goNext = useCallback(() => {
    setIsPinned(true);
    setMonth((m) => addMonths(m, 1));
  }, []);
  const goToday = useCallback(() => {
    setIsPinned(true);
    setMonth(yearMonthFromIso(getTodayIso()));
  }, []);

  /** O recuo automático decide UMA vez; chamado por `useMonthFallback`. */
  const settle = useCallback((fallback: YearMonth | null) => {
    setIsPinned(true);
    if (fallback) setMonth(fallback);
  }, []);

  return {
    month,
    isPinned,
    isCurrentMonth,
    goPrevious,
    goNext,
    goToday,
    settle,
  };
};

export type CommissionsMonth = ReturnType<typeof useCommissionsMonth>;

/**
 * O recuo para o último mês com movimento, quando o mês corrente não tem
 * nenhum. `latestReceiveDate` vem do servidor medida antes do recorte, então
 * descobri-la não custa baixar o histórico.
 *
 * Ela é a data mais DISTANTE, e comissão nasce com data de recebimento no
 * faturamento: há sempre um mês à frente já lançado. Saltar para ela abria a
 * tela em novembro para quem veio ver setembro — por isso o movimento é só
 * para TRÁS, e só quando não há o que ver no mês de hoje. Uma vez decidido,
 * quem manda é a navegação.
 */
export const useMonthFallback = (
  nav: CommissionsMonth,
  rows: CommissionRow[],
  latestReceiveDate: string | null
) => {
  const { isPinned, month, settle } = nav;
  useEffect(() => {
    if (isPinned || !latestReceiveDate) return;

    // As linhas da resposta trazem também o que foge do recorte (estorno do
    // vendedor, boleto travado): quem diz se o mês tem movimento é a data de
    // recebimento, a mesma régua do resto da tela.
    const hasMovement = rows.some((row) => isInMonth(row.receiveDate, month));
    const latest = yearMonthFromIso(latestReceiveDate);
    settle(!hasMovement && isBeforeMonth(latest, month) ? latest : null);
  }, [isPinned, latestReceiveDate, rows, month, settle]);
};
