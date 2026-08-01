"use client";

import { SERIES_BLUE } from "@/components/Chart/chartTheme";
import { Grid } from "@/components/Grid";
import { formatMoney, formatNumber } from "@/utils/format/masks";

import { CHART_HELP } from "../../chartHelp";
import { ChartFilters } from "../../interface";
import { storyStep } from "../../storyParts";
import { AnalyticsSection } from "../AnalyticsSection";
import { EntityMonthSeriesChart } from "../EntityMonthSeriesChart";
import { REVENUE_BY_SELLER_MONTH_QUERY } from "../EntityMonthSeriesChart/gql";
import { EntityRankingChart } from "../EntityRankingChart";
import { AVG_TICKET_BY_SELLER_QUERY } from "../EntityRankingChart/gql";
import { LazyChartCard } from "../LazyChartCard";
import { OrderCountRankingChart } from "../OrderCountRankingChart";
import { ORDERS_BY_SELLER_QUERY } from "../OrderCountRankingChart/gql";
import { OrdersByWeekdayChart } from "../OrdersByWeekdayChart";
import { VisitConversionChart } from "../VisitConversionChart";
import { WalletCoverageChart } from "../WalletCoverageChart";

interface Props {
  filters: ChartFilters;
  /**
   * Gestor (enxerga mais de um vendedor). O vendedor comum só tem os próprios
   * dados: comparar "todos os vendedores" com um nome só na legenda repetiria as
   * partes 1 e 2, então para ele ficam apenas os gráficos do próprio trabalho.
   */
  canCompareSellers: boolean;
}

/**
 * Parte 5 — o trabalho que produziu tudo o que veio antes.
 *
 * Primeiro o campo (visita virou pedido? quanto da carteira foi trabalhada? em que
 * dia o pedido fecha?), depois a comparação entre vendedores. Nessa ordem porque a
 * comparação sem o campo vira ranking sem explicação — e o que dá para mudar na
 * semana seguinte é o campo.
 */
export function SalesTeamSection({ filters, canCompareSellers }: Props) {
  return (
    <AnalyticsSection
      id="vendas"
      step={storyStep("vendas")}
      title={canCompareSellers ? "Quem vende e como vende" : "Como você vende"}
      description="O trabalho de campo: visita que virou pedido, carteira trabalhada e tamanho da venda."
    >
      <Grid.Root cols={{ base: 1, desktop: 2 }} gap={12}>
        <Grid.Item>
          <LazyChartCard
            title="Visitas que viraram pedido"
            description="Quantas visitas foram feitas e quanto delas rendeu venda."
            help={CHART_HELP.visitConversion}
          >
            <VisitConversionChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>
        <Grid.Item>
          <LazyChartCard
            title="Quanto da carteira comprou"
            description="Fatia dos clientes de cada vendedor que fez pedido no período."
            help={CHART_HELP.walletCoverage}
          >
            <WalletCoverageChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>
        <Grid.Item>
          <LazyChartCard
            title="Em que dia da semana o pedido fecha"
            description="Pedidos por dia da semana, de segunda a domingo."
            help={CHART_HELP.ordersByWeekday}
          >
            <OrdersByWeekdayChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>

        {canCompareSellers && (
          <Grid.Item>
            <LazyChartCard
              title="Faturamento por vendedor, mês a mês"
              description="Uma linha por vendedor ao longo dos meses."
              help={CHART_HELP.revenueBySellerMonth}
            >
              <EntityMonthSeriesChart
                filters={filters}
                query={REVENUE_BY_SELLER_MONTH_QUERY}
                dataKey="revenueBySellerMonth"
              />
            </LazyChartCard>
          </Grid.Item>
        )}
        {canCompareSellers && (
          <Grid.Item>
            <LazyChartCard
              title="Pedidos por vendedor, mês a mês"
              description="Uma linha por vendedor: quantos pedidos cada um fechou em cada mês."
              help={CHART_HELP.ordersBySellerMonth}
            >
              {/* Mesma agregação do faturamento por vendedor: ela já devolve o
                  nº de pedidos, então não há query nova. */}
              <EntityMonthSeriesChart
                filters={filters}
                query={REVENUE_BY_SELLER_MONTH_QUERY}
                dataKey="revenueBySellerMonth"
                valueKey="orderCount"
                valueFormatter={formatNumber}
              />
            </LazyChartCard>
          </Grid.Item>
        )}
        {canCompareSellers && (
          <Grid.Item>
            <LazyChartCard
              title="Pedidos por vendedor"
              description="Quem fecha mais vezes — não necessariamente quem fatura mais."
              help={CHART_HELP.ordersBySeller}
            >
              <OrderCountRankingChart
                filters={filters}
                query={ORDERS_BY_SELLER_QUERY}
                dataKey="ordersBySeller"
                color={SERIES_BLUE}
              />
            </LazyChartCard>
          </Grid.Item>
        )}
        {canCompareSellers && (
          <Grid.Item>
            <LazyChartCard
              title="Ticket médio por vendedor"
              help={CHART_HELP.avgTicketBySeller}
            >
              <EntityRankingChart
                filters={filters}
                query={AVG_TICKET_BY_SELLER_QUERY}
                dataKey="avgTicketBySeller"
                valueKey="avgTicket"
                valueFormatter={formatMoney}
                seriesName="Ticket médio"
                color={SERIES_BLUE}
              />
            </LazyChartCard>
          </Grid.Item>
        )}
      </Grid.Root>
    </AnalyticsSection>
  );
}
