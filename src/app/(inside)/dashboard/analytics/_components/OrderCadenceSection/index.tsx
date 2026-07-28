"use client";

import { SERIES_GREEN, SERIES_ORANGE } from "@/components/Chart/chartTheme";
import { Grid } from "@/components/Grid";

import { CHART_HELP } from "../../chartHelp";
import { ChartFilters } from "../../interface";
import { formatDays } from "../../utils";
import { AnalyticsSection } from "../AnalyticsSection";
import { EntityRankingChart } from "../EntityRankingChart";
import {
  ORDER_INTERVAL_BY_CLIENT_QUERY,
  ORDER_INTERVAL_BY_FACTORY_QUERY,
} from "../EntityRankingChart/gql";
import { LazyChartCard } from "../LazyChartCard";

export function OrderCadenceSection({ filters }: { filters: ChartFilters }) {
  return (
    <AnalyticsSection
      title="Cadência de pedidos"
      description="Tempo médio entre um pedido e o próximo. Quanto menor, mais frequente a recompra."
    >
      <Grid.Root cols={{ base: 1, desktop: 2 }} gap={12}>
        <Grid.Item>
          <LazyChartCard
            title="Intervalo entre pedidos por fábrica"
            help={CHART_HELP.orderIntervalByFactory}
          >
            <EntityRankingChart
              filters={filters}
              query={ORDER_INTERVAL_BY_FACTORY_QUERY}
              dataKey="orderIntervalByFactory"
              valueKey="avgDays"
              valueFormatter={formatDays}
              seriesName="Intervalo médio"
              color={SERIES_ORANGE}
            />
          </LazyChartCard>
        </Grid.Item>
        <Grid.Item>
          <LazyChartCard
            title="Intervalo entre pedidos por cliente"
            help={CHART_HELP.orderIntervalByClient}
          >
            <EntityRankingChart
              filters={filters}
              query={ORDER_INTERVAL_BY_CLIENT_QUERY}
              dataKey="orderIntervalByClient"
              valueKey="avgDays"
              valueFormatter={formatDays}
              seriesName="Intervalo médio"
              color={SERIES_GREEN}
            />
          </LazyChartCard>
        </Grid.Item>
      </Grid.Root>
    </AnalyticsSection>
  );
}
