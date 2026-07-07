"use client";

import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { useAsyncQuery } from "@/hooks/useAsyncQuery";
import { formatMoney, formatNumber } from "@/utils/format/masks";
import { useEffect, useMemo } from "react";

import { useAnalyticsPrint } from "../../analyticsPrintContext";
import { ChartFilters } from "../../interface";
import { DASHBOARD_SUMMARY_QUERY } from "./gql";
import { DashboardSummaryResponse } from "./interface";

/**
 * Faixa de bignumbers (KPIs) no topo da aba: total de pedidos, faturamento,
 * ticket médio e clientes ativos — todos escopados pelo período/vendedor do
 * filtro. Leitura rápida antes de descer para os gráficos.
 */
export function AnalyticsSummary({ filters }: { filters: ChartFilters }) {
  const { setKpis } = useAnalyticsPrint();
  const { data, loading } = useAsyncQuery<DashboardSummaryResponse>(
    DASHBOARD_SUMMARY_QUERY,
    { variables: filters, skip: false, autoFetch: true }
  );

  const summary = data?.dashboardSummary;
  const hasOrders = useMemo(() => (summary?.totalOrders ?? 0) > 0, [summary]);

  const totalOrders = summary?.totalOrders ?? 0;
  const totalAmount = Number(summary?.totalAmount ?? 0);
  const avgTicket = Number(summary?.avgTicket ?? 0);
  const activeClients = summary?.activeClients ?? 0;

  // Publica os KPIs para o PDF da página (cabeçalho).
  useEffect(() => {
    if (!summary) return;
    setKpis([
      { label: "Pedidos no período", value: formatNumber(totalOrders) },
      { label: "Faturamento", value: formatMoney(totalAmount) },
      { label: "Ticket médio", value: formatMoney(avgTicket) },
      { label: "Clientes ativos", value: formatNumber(activeClients) },
    ]);
  }, [summary, totalOrders, totalAmount, avgTicket, activeClients, setKpis]);

  if (loading && !summary) {
    return (
      <Grid.Root cols={{ base: 1, tablet: 2, "desktop-xl": 4 }} gap={12}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid.Item key={i}>
            <Loading.Skeleton className="h-[104px] w-full" />
          </Grid.Item>
        ))}
      </Grid.Root>
    );
  }

  return (
    <Grid.Root cols={{ base: 1, tablet: 2, "desktop-xl": 4 }} gap={12}>
      <Grid.Item>
        <Card.Kpi>
          <Card.Kpi.Label>Pedidos no período</Card.Kpi.Label>
          <Card.Kpi.Value status="atencao">
            {formatNumber(totalOrders)}
          </Card.Kpi.Value>
          <Card.Kpi.Delta>
            {hasOrders ? "pedidos faturados" : "nenhum pedido no período"}
          </Card.Kpi.Delta>
        </Card.Kpi>
      </Grid.Item>

      <Grid.Item>
        <Card.Kpi>
          <Card.Kpi.Label>Faturamento</Card.Kpi.Label>
          <Card.Kpi.Value status="ok">
            {formatMoney(totalAmount)}
          </Card.Kpi.Value>
          <Card.Kpi.Delta>soma dos pedidos do período</Card.Kpi.Delta>
        </Card.Kpi>
      </Grid.Item>

      <Grid.Item>
        <Card.Kpi>
          <Card.Kpi.Label>Ticket médio</Card.Kpi.Label>
          <Card.Kpi.Value status="neutral" className="text-(--blue)!">
            {formatMoney(avgTicket)}
          </Card.Kpi.Value>
          <Card.Kpi.Delta>valor médio por pedido</Card.Kpi.Delta>
        </Card.Kpi>
      </Grid.Item>

      <Grid.Item>
        <Card.Kpi>
          <Card.Kpi.Label>Clientes ativos</Card.Kpi.Label>
          <Card.Kpi.Value status={activeClients > 0 ? "ok" : "urgente"}>
            {formatNumber(activeClients)}
          </Card.Kpi.Value>
          <Card.Kpi.Delta>fizeram ao menos um pedido</Card.Kpi.Delta>
        </Card.Kpi>
      </Grid.Item>
    </Grid.Root>
  );
}
