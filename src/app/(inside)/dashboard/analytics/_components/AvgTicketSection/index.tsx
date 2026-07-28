"use client";

import {
  SERIES_BLUE,
  SERIES_GREEN,
  SERIES_ORANGE,
} from "@/components/Chart/chartTheme";
import { Grid } from "@/components/Grid";
import { formatMoney } from "@/utils/format/masks";

import { ChartFilters } from "../../interface";
import { AnalyticsSection } from "../AnalyticsSection";
import { EntityRankingChart } from "../EntityRankingChart";
import {
  AVG_TICKET_BY_CLIENT_QUERY,
  AVG_TICKET_BY_FACTORY_QUERY,
  AVG_TICKET_BY_SELLER_QUERY,
} from "../EntityRankingChart/gql";
import { LazyChartCard } from "../LazyChartCard";

export function AvgTicketSection({ filters }: { filters: ChartFilters }) {
  return (
    <AnalyticsSection
      title="Ticket médio"
      description="Valor médio de cada pedido. Quanto maior, mais forte a venda."
    >
      <Grid.Root cols={{ base: 1, desktop: 2 }} gap={12}>
        <Grid.Item>
          <LazyChartCard title="Ticket médio por vendedor">
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
        <Grid.Item>
          <LazyChartCard title="Ticket médio por fábrica">
            <EntityRankingChart
              filters={filters}
              query={AVG_TICKET_BY_FACTORY_QUERY}
              dataKey="avgTicketByFactory"
              valueKey="avgTicket"
              valueFormatter={formatMoney}
              seriesName="Ticket médio"
              color={SERIES_ORANGE}
            />
          </LazyChartCard>
        </Grid.Item>
        <Grid.Item>
          <LazyChartCard title="Ticket médio por cliente">
            <EntityRankingChart
              filters={filters}
              query={AVG_TICKET_BY_CLIENT_QUERY}
              dataKey="avgTicketByClient"
              valueKey="avgTicket"
              valueFormatter={formatMoney}
              seriesName="Ticket médio"
              color={SERIES_GREEN}
            />
          </LazyChartCard>
        </Grid.Item>
      </Grid.Root>
    </AnalyticsSection>
  );
}
