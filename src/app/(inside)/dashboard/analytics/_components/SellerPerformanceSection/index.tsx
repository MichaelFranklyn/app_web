"use client";

import { Grid } from "@/components/Grid";

import { CHART_HELP } from "../../chartHelp";
import { ChartFilters } from "../../interface";
import { AnalyticsSection } from "../AnalyticsSection";
import { EntityMonthSeriesChart } from "../EntityMonthSeriesChart";
import { REVENUE_BY_SELLER_MONTH_QUERY } from "../EntityMonthSeriesChart/gql";
import { LazyChartCard } from "../LazyChartCard";
import { VisitConversionChart } from "../VisitConversionChart";
import { WalletCoverageChart } from "../WalletCoverageChart";

/** Como cada vendedor vem se comportando: quanto vende, quanto rende cada
 * visita e que parte da carteira ele realmente movimenta. */
export function SellerPerformanceSection({
  filters,
}: {
  filters: ChartFilters;
}) {
  return (
    <AnalyticsSection
      title="Evolução dos vendedores"
      description="Quem está crescendo, quem está parando e quanto da carteira é trabalhado."
    >
      <Grid.Root cols={{ base: 1, desktop: 2 }} gap={12}>
        <Grid.Item>
          <LazyChartCard
            title="Faturamento por vendedor"
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
      </Grid.Root>
    </AnalyticsSection>
  );
}
