"use client";

import { SERIES_ORANGE } from "@/components/Chart/chartTheme";
import { Grid } from "@/components/Grid";
import { formatMoney } from "@/utils/format/masks";

import { CHART_HELP } from "../../chartHelp";
import { ChartFilters } from "../../interface";
import { storyStep } from "../../storyParts";
import { formatDays } from "../../utils";
import { AnalyticsSection } from "../AnalyticsSection";
import { BackorderWeightChart } from "../BackorderWeightChart";
import { DeliveryPerformanceChart } from "../DeliveryPerformanceChart";
import { EntityRankingChart } from "../EntityRankingChart";
import {
  AVG_TICKET_BY_FACTORY_QUERY,
  ORDER_INTERVAL_BY_FACTORY_QUERY,
} from "../EntityRankingChart/gql";
import { ItemsPerOrderChart } from "../ItemsPerOrderChart";
import { LazyChartCard } from "../LazyChartCard";

/**
 * Parte 6 — o outro lado do balcão: o que a fábrica entrega ao representante.
 *
 * Vem depois da carteira e do campo porque é a parte que o vendedor NÃO controla:
 * prazo furado e faturamento pela metade explicam cliente insatisfeito e pedido
 * repetido sem que ninguém tenha vendido pior.
 */
export function FactoryServiceSection({ filters }: { filters: ChartFilters }) {
  return (
    <AnalyticsSection
      id="fabricas"
      step={storyStep("fabricas")}
      title="Como as fábricas atendem"
      description="Se entregam no prazo, se faturam pela metade e que tipo de pedido rendem."
    >
      <Grid.Root cols={{ base: 1, desktop: 2 }} gap={12}>
        <Grid.Item>
          <LazyChartCard
            title="Prazo de entrega: prometido e real"
            description="Dias que a fábrica prometeu e dias que levou de fato."
            help={CHART_HELP.deliveryPerformance}
          >
            <DeliveryPerformanceChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>
        <Grid.Item>
          <LazyChartCard
            title="Peso da sobra de faturamento"
            description="Quanto dos pedidos do mês é sobra (backorder) e não venda nova."
            help={CHART_HELP.backorderWeight}
          >
            <BackorderWeightChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>
        <Grid.Item>
          <LazyChartCard
            title="Itens por pedido, por fábrica"
            description="Quantos produtos diferentes tem o pedido médio de cada marca."
            help={CHART_HELP.itemsPerOrder}
          >
            <ItemsPerOrderChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>
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
            title="Ticket médio por fábrica"
            help={CHART_HELP.avgTicketByFactory}
          >
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
      </Grid.Root>
    </AnalyticsSection>
  );
}
