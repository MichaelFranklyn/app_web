"use client";

import { Grid } from "@/components/Grid";

import { CHART_HELP } from "../../chartHelp";
import { ChartFilters } from "../../interface";
import { storyStep } from "../../storyParts";
import { AnalyticsSection } from "../AnalyticsSection";
import { LazyChartCard } from "../LazyChartCard";
import { OrdersByMonthChart } from "../OrdersByMonthChart";
import { RevenueByMonthChart } from "../RevenueByMonthChart";

/**
 * Parte 1 — o retrato, e só o retrato: quanto entrou e quantas vendas houve.
 *
 * Duas linhas simples de propósito. É a página inteira em duas perguntas, e
 * qualquer explicação (por que subiu, de quem veio) fica para as partes
 * seguintes — quem só quer saber "como estamos" para aqui.
 */
export function PeriodResultSection({ filters }: { filters: ChartFilters }) {
  return (
    <AnalyticsSection
      id="resultado"
      step={storyStep("resultado")}
      title="Como o período fechou"
      description="Quanto entrou e quantas vendas aconteceram, mês a mês."
    >
      <Grid.Root cols={{ base: 1, desktop: 2 }} gap={12}>
        <Grid.Item>
          <LazyChartCard
            title="Faturamento por mês"
            help={CHART_HELP.revenueByMonth}
          >
            <RevenueByMonthChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>
        <Grid.Item>
          <LazyChartCard
            title="Pedidos por mês"
            help={CHART_HELP.ordersByMonth}
          >
            <OrdersByMonthChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>
      </Grid.Root>
    </AnalyticsSection>
  );
}
