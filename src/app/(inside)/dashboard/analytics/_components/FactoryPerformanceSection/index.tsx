"use client";

import { Grid } from "@/components/Grid";

import { ChartFilters } from "../../interface";
import { AnalyticsSection } from "../AnalyticsSection";
import { DeliveryPerformanceChart } from "../DeliveryPerformanceChart";
import { EntityMonthSeriesChart } from "../EntityMonthSeriesChart";
import { REVENUE_BY_FACTORY_MONTH_QUERY } from "../EntityMonthSeriesChart/gql";
import { LazyChartCard } from "../LazyChartCard";

/** Como cada fábrica se comporta: o quanto ela cresce na carteira e se
 * cumpre o prazo que promete. */
export function FactoryPerformanceSection({
  filters,
}: {
  filters: ChartFilters;
}) {
  return (
    <AnalyticsSection
      title="Evolução das fábricas"
      description="Quais fábricas estão ganhando espaço e quais estão atrasando entrega."
    >
      <Grid.Root cols={{ base: 1, desktop: 2 }} gap={12}>
        <Grid.Item>
          <LazyChartCard
            title="Faturamento por fábrica"
            description="Uma linha por fábrica ao longo dos meses."
          >
            <EntityMonthSeriesChart
              filters={filters}
              query={REVENUE_BY_FACTORY_MONTH_QUERY}
              dataKey="revenueByFactoryMonth"
            />
          </LazyChartCard>
        </Grid.Item>
        <Grid.Item>
          <LazyChartCard
            title="Prazo de entrega: prometido e real"
            description="Dias que a fábrica prometeu e dias que levou de fato."
          >
            <DeliveryPerformanceChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>
      </Grid.Root>
    </AnalyticsSection>
  );
}
