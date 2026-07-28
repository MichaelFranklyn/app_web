"use client";

import { Grid } from "@/components/Grid";

import { CHART_HELP } from "../../chartHelp";
import { ChartFilters } from "../../interface";
import { AnalyticsSection } from "../AnalyticsSection";
import { AvgTicketByMonthChart } from "../AvgTicketByMonthChart";
import { LazyChartCard } from "../LazyChartCard";
import { NewVsReturningChart } from "../NewVsReturningChart";
import { OrderStatusByMonthChart } from "../OrderStatusByMonthChart";
import { RevenueConcentrationChart } from "../RevenueConcentrationChart";

/** Como a empresa se comporta ao longo do tempo: valor da venda, base de
 * clientes, o que acontece com os pedidos e de quem o faturamento depende. */
export function GrowthSection({ filters }: { filters: ChartFilters }) {
  return (
    <AnalyticsSection
      title="Evolução da empresa"
      description="Se o negócio está crescendo, encolhendo ou só se repetindo."
    >
      <Grid.Root cols={{ base: 1, desktop: 2 }} gap={12}>
        <Grid.Item>
          <LazyChartCard
            title="Ticket médio por mês"
            description="Quanto vale cada pedido, mês a mês."
            help={CHART_HELP.avgTicketByMonth}
          >
            <AvgTicketByMonthChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>
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
            title="Situação dos pedidos por mês"
            description="Em que pé estão hoje os pedidos feitos em cada mês."
            help={CHART_HELP.orderStatusByMonth}
          >
            <OrderStatusByMonthChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>
        <Grid.Item>
          <LazyChartCard
            title="De quem vem o faturamento"
            description="Quanto do total está concentrado nos maiores clientes."
            help={CHART_HELP.revenueConcentration}
          >
            <RevenueConcentrationChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>
      </Grid.Root>
    </AnalyticsSection>
  );
}
