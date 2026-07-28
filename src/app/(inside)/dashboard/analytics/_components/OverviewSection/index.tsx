"use client";

import { Grid } from "@/components/Grid";

import { ChartFilters } from "../../interface";
import { AnalyticsSection } from "../AnalyticsSection";
import { CommissionsByMonthChart } from "../CommissionsByMonthChart";
import { LazyChartCard } from "../LazyChartCard";
import { RevenueByFactoryChart } from "../RevenueByFactoryChart";
import { RevenueByMonthChart } from "../RevenueByMonthChart";
import { OrdersByMonthChart } from "../OrdersByMonthChart";

export function OverviewSection({ filters }: { filters: ChartFilters }) {
  return (
    <AnalyticsSection
      title="Visão geral"
      description="Faturamento, pedidos e comissões no período."
    >
      <Grid.Root cols={{ base: 1, desktop: 2 }} gap={12}>
        <Grid.Item>
          <LazyChartCard title="Faturamento por mês">
            <RevenueByMonthChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>
        <Grid.Item>
          <LazyChartCard title="Pedidos por mês">
            <OrdersByMonthChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>
        <Grid.Item>
          <LazyChartCard title="Faturamento por fábrica">
            <RevenueByFactoryChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>
        <Grid.Item>
          <LazyChartCard title="Comissões: a receber vs recebidas">
            <CommissionsByMonthChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>
      </Grid.Root>
    </AnalyticsSection>
  );
}
