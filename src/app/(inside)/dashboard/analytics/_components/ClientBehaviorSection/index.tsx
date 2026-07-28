"use client";

import { Grid } from "@/components/Grid";

import { ChartFilters } from "../../interface";
import { AnalyticsSection } from "../AnalyticsSection";
import { ClientRetentionChart } from "../ClientRetentionChart";
import { ClientsAtRiskChart } from "../ClientsAtRiskChart";
import { LazyChartCard } from "../LazyChartCard";

/** Como os clientes se comportam: quem está sumindo e se a base se mantém
 * comprando de um mês para o outro. */
export function ClientBehaviorSection({ filters }: { filters: ChartFilters }) {
  return (
    <AnalyticsSection
      title="Comportamento dos clientes"
      description="Quem está deixando de comprar e quanto da base se mantém."
    >
      <Grid.Root cols={{ base: 1, desktop: 2 }} gap={12}>
        <Grid.Item>
          <LazyChartCard
            title="Clientes que estão sumindo"
            description="Passaram do próprio costume de compra. Em vermelho, os já atrasados."
          >
            <ClientsAtRiskChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>
        <Grid.Item>
          <LazyChartCard
            title="A base se mantém?"
            description="Quantos dos que compraram no mês já compravam no mês anterior."
          >
            <ClientRetentionChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>
      </Grid.Root>
    </AnalyticsSection>
  );
}
