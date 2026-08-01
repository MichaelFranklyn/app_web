"use client";

import { SERIES_GREEN } from "@/components/Chart/chartTheme";
import { Grid } from "@/components/Grid";
import { formatMoney } from "@/utils/format/masks";

import { CHART_HELP } from "../../chartHelp";
import { ChartFilters } from "../../interface";
import { storyStep } from "../../storyParts";
import { formatDays } from "../../utils";
import { AnalyticsSection } from "../AnalyticsSection";
import { ClientRetentionChart } from "../ClientRetentionChart";
import { ClientsAtRiskChart } from "../ClientsAtRiskChart";
import { EntityRankingChart } from "../EntityRankingChart";
import {
  AVG_TICKET_BY_CLIENT_QUERY,
  ORDER_INTERVAL_BY_CLIENT_QUERY,
} from "../EntityRankingChart/gql";
import { LazyChartCard } from "../LazyChartCard";
import { NewVsReturningChart } from "../NewVsReturningChart";
import { OrderCountRankingChart } from "../OrderCountRankingChart";
import { ORDERS_BY_CLIENT_QUERY } from "../OrderCountRankingChart/gql";

/**
 * Parte 4 — a carteira, que é de onde o faturamento das partes anteriores sai.
 *
 * A ordem interna é a vida do cliente: ele chega (novos e recompra), fica (a base
 * se mantém), começa a sumir (clientes em risco) e, enquanto está, compra em certa
 * frequência e tamanho (pedidos, ticket, intervalo).
 */
export function ClientPortfolioSection({ filters }: { filters: ChartFilters }) {
  return (
    <AnalyticsSection
      id="carteira"
      step={storyStep("carteira")}
      title="Sua carteira de clientes"
      description="Quem chega, quem volta, quem está sumindo e de quanto em quanto tempo cada um compra."
    >
      <Grid.Root cols={{ base: 1, desktop: 2 }} gap={12}>
        <Grid.Item>
          <LazyChartCard
            title="Clientes novos e recompra"
            description="Quem comprou pela primeira vez e quem voltou."
            help={CHART_HELP.newVsReturning}
          >
            <NewVsReturningChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>
        <Grid.Item>
          <LazyChartCard
            title="A base se mantém?"
            description="Quantos dos que compraram no mês já compravam no mês anterior."
            help={CHART_HELP.clientRetention}
          >
            <ClientRetentionChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>
        <Grid.Item>
          <LazyChartCard
            title="Clientes que estão sumindo"
            description="Passaram do próprio costume de compra. Em vermelho, os já atrasados."
            help={CHART_HELP.clientsAtRisk}
          >
            <ClientsAtRiskChart filters={filters} />
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
        <Grid.Item>
          <LazyChartCard
            title="Pedidos por cliente"
            help={CHART_HELP.ordersByClient}
          >
            <OrderCountRankingChart
              filters={filters}
              query={ORDERS_BY_CLIENT_QUERY}
              dataKey="ordersByClient"
              color={SERIES_GREEN}
            />
          </LazyChartCard>
        </Grid.Item>
        <Grid.Item>
          <LazyChartCard
            title="Ticket médio por cliente"
            help={CHART_HELP.avgTicketByClient}
          >
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
