"use client";

import { Grid } from "@/components/Grid";

import { CHART_HELP } from "../../chartHelp";
import { ChartFilters } from "../../interface";
import { AnalyticsSection } from "../AnalyticsSection";
import { LazyChartCard } from "../LazyChartCard";
import { OrdersByClientChart } from "../OrdersByClientChart";
import { OrdersByFactoryChart } from "../OrdersByFactoryChart";

export function OrderVolumeSection({ filters }: { filters: ChartFilters }) {
  return (
    <AnalyticsSection
      title="Volume de pedidos"
      description="Quantos pedidos cada fábrica e cliente concentram no período."
    >
      <Grid.Root cols={{ base: 1, desktop: 2 }} gap={12}>
        <Grid.Item>
          <LazyChartCard
            title="Pedidos por fábrica"
            help={CHART_HELP.ordersByFactory}
          >
            <OrdersByFactoryChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>
        <Grid.Item>
          <LazyChartCard
            title="Pedidos por cliente"
            help={CHART_HELP.ordersByClient}
          >
            <OrdersByClientChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>
      </Grid.Root>
    </AnalyticsSection>
  );
}
