"use client";

import { getBrtTodayIso } from "@/utils/format/date";
import { monthStartIso, yearMonthFromIso } from "@/utils/format/month";
import {
  GOAL_METRICS,
  isBehindPace,
  monthProgress,
  overallPercent,
  sumRows,
} from "@/utils/goals";
import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";

import { DASHBOARD_GOALS_QUERY } from "../../gql";
import { DashboardGoalsResponse } from "../../interface";

/**
 * O mês corrente das metas, somado no recorte do dashboard (o vendedor
 * escolhido, ou o próprio vendedor — o backend prende quem não é gestor).
 *
 * "Atrás do ritmo" usa a mesma régua do antigo cartão de /insights: o realizado
 * contra o que o calendário já consumiu, com folga — nunca contra a meta cheia.
 */
export function useDashboardGoals(sellerId: string | null) {
  const today = getBrtTodayIso();
  const month = useMemo(() => yearMonthFromIso(today), [today]);

  const { data, loading, error, refetch } = useQuery<DashboardGoalsResponse>(
    DASHBOARD_GOALS_QUERY,
    {
      variables: { periodMonth: monthStartIso(month), sellerId },
      fetchPolicy: "cache-and-network",
    }
  );

  return useMemo(() => {
    const rows = data?.dashboard_goals?.rows ?? [];
    const totals = sumRows(rows);
    const progress = monthProgress(today);
    const metrics = GOAL_METRICS.map((metric) => ({
      ...metric,
      values: totals[metric.id],
      behind: isBehindPace(totals[metric.id], progress),
    })).filter((metric) => metric.values.target !== null);

    return {
      month,
      metrics,
      overall: overallPercent(totals),
      /** Quanto do mês já passou, em % — a marca do "ritmo" ao lado da barra. */
      pacePercent: Math.round(progress * 100),
      behindCount: metrics.filter((metric) => metric.behind).length,
      loading: loading && !data,
      failed: !!error && !data,
      refetch,
    };
  }, [data, loading, error, refetch, today, month]);
}
