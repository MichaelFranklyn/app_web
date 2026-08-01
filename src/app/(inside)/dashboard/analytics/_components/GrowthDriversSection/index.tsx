"use client";

import { Grid } from "@/components/Grid";

import { CHART_HELP } from "../../chartHelp";
import { ChartFilters } from "../../interface";
import { storyStep } from "../../storyParts";
import { AnalyticsSection } from "../AnalyticsSection";
import { LazyChartCard } from "../LazyChartCard";
import { OrdersAndTicketByMonthChart } from "../OrdersAndTicketByMonthChart";
import { OrderSizeDistributionChart } from "../OrderSizeDistributionChart";
import { OrderStatusByMonthChart } from "../OrderStatusByMonthChart";

/**
 * Parte 2 — o mesmo resultado da parte 1, agora explicado.
 *
 * Três explicações possíveis para a linha ter subido ou descido: mudou o número
 * de vendas, mudou o tamanho delas, ou mudou o que aconteceu depois de vender
 * (o pedido virou entrega ou parou no caminho).
 */
export function GrowthDriversSection({ filters }: { filters: ChartFilters }) {
  return (
    <AnalyticsSection
      id="explicacao"
      step={storyStep("explicacao")}
      title="O que explica o resultado"
      description="Se a diferença veio de vender mais vezes, de vender mais caro, ou do que acontece depois da venda."
    >
      <Grid.Root cols={{ base: 1, desktop: 2 }} gap={12}>
        <Grid.Item>
          <LazyChartCard
            title="Mais pedidos ou pedidos maiores?"
            description="Barra: quantos pedidos no mês. Linha: valor médio de cada um."
            help={CHART_HELP.ordersAndTicketByMonth}
          >
            <OrdersAndTicketByMonthChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>
        <Grid.Item>
          <LazyChartCard
            title="Tamanho dos pedidos"
            description="Quantos pedidos caíram em cada faixa de valor."
            help={CHART_HELP.orderSizeDistribution}
          >
            <OrderSizeDistributionChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>
        <Grid.Item>
          <LazyChartCard
            title="Situação dos pedidos por mês"
            description="Em que pé estão hoje os pedidos feitos em cada mês."
            help={CHART_HELP.orderStatusByMonth}
          >
            <OrderStatusByMonthChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>
      </Grid.Root>
    </AnalyticsSection>
  );
}
