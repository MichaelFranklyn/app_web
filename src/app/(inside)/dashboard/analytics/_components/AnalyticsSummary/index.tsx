"use client";

import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { QueryError } from "@/components/QueryError";
import { useAsyncQuery } from "@/hooks/useAsyncQuery";
import { formatMoney, formatNumber } from "@/utils/format/masks";
import {
  BarChart3,
  CircleDollarSign,
  Receipt,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useEffect } from "react";

import { useAnalyticsPrint } from "../../analyticsPrintContext";
import { ChartFilters } from "../../interface";
import { DASHBOARD_SUMMARY_QUERY } from "./gql";
import { DashboardSummaryResponse } from "./interface";

interface Props {
  filters: ChartFilters;
  /** Gestor filtra por vendedor; o texto do vazio diz o que dá para ajustar. */
  canSelectSeller: boolean;
  /**
   * Avisa a página quando o recorte não tem pedido nenhum: aí ela troca as sete
   * partes (trinta cartões "Sem dados") por este único aviso.
   */
  onEmptyChange: (empty: boolean) => void;
}

const LABELS = {
  orders: "Pedidos no período",
  amount: "Faturamento",
  ticket: "Ticket médio",
  clients: "Clientes que compraram",
} as const;

/**
 * Faixa de bignumbers (KPIs) no topo da aba: pedidos, faturamento, ticket médio
 * e clientes que compraram — todos escopados pelo período/vendedor/fábrica do
 * filtro. Leitura rápida antes de descer para os gráficos.
 *
 * "Clientes que compraram", e não "Clientes ativos": no resto do sistema
 * "ativo" é o cadastro (o oposto de inativado), e aqui o número é outro — quem
 * fez ao menos um pedido no período.
 */
export function AnalyticsSummary({
  filters,
  canSelectSeller,
  onEmptyChange,
}: Props) {
  const { setKpis } = useAnalyticsPrint();
  const { data, loading, error, refetch } =
    useAsyncQuery<DashboardSummaryResponse>(DASHBOARD_SUMMARY_QUERY, {
      // Leitura derivada: ninguém invalida este campo ao lançar pedido/visita.
      revalidate: true,
      variables: filters,
      skip: false,
      autoFetch: true,
    });

  const summary = data?.dashboardSummary;
  const totalOrders = summary?.totalOrders ?? 0;
  const totalAmount = Number(summary?.totalAmount ?? 0);
  const avgTicket = Number(summary?.avgTicket ?? 0);
  const activeClients = summary?.activeClients ?? 0;
  // Saldo de faturamento parcial soma valor sem contar pedido: só é vazio
  // quando não há nem um nem outro.
  const isEmpty = !!summary && totalOrders === 0 && totalAmount === 0;

  useEffect(() => {
    onEmptyChange(isEmpty);
  }, [isEmpty, onEmptyChange]);

  // Publica os KPIs para o PDF da página (cabeçalho).
  useEffect(() => {
    if (!summary) return;
    setKpis([
      { label: LABELS.orders, value: formatNumber(totalOrders) },
      { label: LABELS.amount, value: formatMoney(totalAmount) },
      { label: LABELS.ticket, value: formatMoney(avgTicket) },
      { label: LABELS.clients, value: formatNumber(activeClients) },
    ]);
  }, [summary, totalOrders, totalAmount, avgTicket, activeClients, setKpis]);

  if (loading && !summary) {
    return (
      <Grid.Root cols={{ base: 2, tablet: 2, "desktop-xl": 4 }} gap={12}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid.Item key={i}>
            <Loading.Skeleton className="h-[104px] w-full" />
          </Grid.Item>
        ))}
      </Grid.Root>
    );
  }

  if (error && !summary) {
    return <QueryError onRetry={() => refetch()} />;
  }

  if (isEmpty) {
    return (
      <EmptyState.Root>
        <EmptyState.Icon>
          <BarChart3 size={32} />
        </EmptyState.Icon>
        <EmptyState.Title>
          {canSelectSeller
            ? "Nenhum pedido neste período"
            : "Você não tem pedidos neste período"}
        </EmptyState.Title>
        <EmptyState.Description>
          {canSelectSeller
            ? "Escolha outro período, vendedor ou fábrica no filtro acima para ver os gráficos."
            : "Escolha outro período ou fábrica no filtro acima para ver os gráficos."}
        </EmptyState.Description>
      </EmptyState.Root>
    );
  }

  return (
    <Grid.Root
      cols={{ base: 2, tablet: 2, "desktop-xl": 4 }}
      gap={12}
      data-tour="analytics-summary"
    >
      <Grid.Item>
        <Card.Kpi>
          <Card.Kpi.Label icon={ShoppingCart}>{LABELS.orders}</Card.Kpi.Label>
          <Card.Kpi.Value>{formatNumber(totalOrders)}</Card.Kpi.Value>
          <Card.Kpi.Delta>vendas fechadas no período</Card.Kpi.Delta>
        </Card.Kpi>
      </Grid.Item>

      <Grid.Item>
        <Card.Kpi>
          <Card.Kpi.Label icon={CircleDollarSign}>
            {LABELS.amount}
          </Card.Kpi.Label>
          <Card.Kpi.Value>{formatMoney(totalAmount)}</Card.Kpi.Value>
          <Card.Kpi.Delta>soma dos pedidos do período</Card.Kpi.Delta>
        </Card.Kpi>
      </Grid.Item>

      <Grid.Item>
        <Card.Kpi>
          <Card.Kpi.Label icon={Receipt}>{LABELS.ticket}</Card.Kpi.Label>
          <Card.Kpi.Value>{formatMoney(avgTicket)}</Card.Kpi.Value>
          <Card.Kpi.Delta>valor médio por pedido</Card.Kpi.Delta>
        </Card.Kpi>
      </Grid.Item>

      <Grid.Item>
        <Card.Kpi>
          <Card.Kpi.Label icon={Users}>{LABELS.clients}</Card.Kpi.Label>
          <Card.Kpi.Value status={activeClients > 0 ? "neutral" : "urgente"}>
            {formatNumber(activeClients)}
          </Card.Kpi.Value>
          <Card.Kpi.Delta>ao menos um pedido no período</Card.Kpi.Delta>
        </Card.Kpi>
      </Grid.Item>
    </Grid.Root>
  );
}
