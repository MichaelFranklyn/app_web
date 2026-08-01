"use client";

import { Grid } from "@/components/Grid";

import { CHART_HELP } from "../../chartHelp";
import { ChartFilters } from "../../interface";
import { storyStep } from "../../storyParts";
import { AnalyticsSection } from "../AnalyticsSection";
import { EntityMonthSeriesChart } from "../EntityMonthSeriesChart";
import { REVENUE_BY_FACTORY_MONTH_QUERY } from "../EntityMonthSeriesChart/gql";
import { LazyChartCard } from "../LazyChartCard";
import { OrdersByFactoryChart } from "../OrdersByFactoryChart";
import { RevenueByFactoryChart } from "../RevenueByFactoryChart";
import { RevenueConcentrationChart } from "../RevenueConcentrationChart";

/**
 * Parte 3 — de quem o resultado depende.
 *
 * O total das partes 1 e 2 esconde risco: faturamento igual pode vir de trinta
 * clientes ou de dois, de cinco marcas ou de uma. Aqui a pergunta muda de "quanto"
 * para "quão concentrado" — que é o que decide o tamanho do estrago quando um
 * cliente para de comprar ou uma fábrica reajusta preço.
 */
export function RevenueDependencySection({
  filters,
}: {
  filters: ChartFilters;
}) {
  return (
    <AnalyticsSection
      id="dependencia"
      step={storyStep("dependencia")}
      title="De quem vem o faturamento"
      description="Quanto do dinheiro depende de poucos clientes e de poucas fábricas."
    >
      <Grid.Root cols={{ base: 1, desktop: 2 }} gap={12}>
        <Grid.Item>
          <LazyChartCard
            title="Quanto os maiores clientes concentram"
            description="A fatia do faturamento que está nas mãos dos maiores."
            help={CHART_HELP.revenueConcentration}
          >
            <RevenueConcentrationChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>
        <Grid.Item>
          <LazyChartCard
            title="Faturamento por fábrica"
            help={CHART_HELP.revenueByFactory}
          >
            <RevenueByFactoryChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>
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
            title="Faturamento por fábrica, mês a mês"
            description="Uma linha por fábrica: quais estão ganhando e perdendo espaço."
            help={CHART_HELP.revenueByFactoryMonth}
          >
            <EntityMonthSeriesChart
              filters={filters}
              query={REVENUE_BY_FACTORY_MONTH_QUERY}
              dataKey="revenueByFactoryMonth"
            />
          </LazyChartCard>
        </Grid.Item>
      </Grid.Root>
    </AnalyticsSection>
  );
}
