"use client";

import { Grid } from "@/components/Grid";

import { CHART_HELP } from "../../chartHelp";
import { ChartFilters } from "../../interface";
import { storyStep } from "../../storyParts";
import { AnalyticsSection } from "../AnalyticsSection";
import { LazyChartCard } from "../LazyChartCard";
import { CommissionByFactoryChart } from "./_components/CommissionByFactoryChart";
import { CommissionBySellerMonthChart } from "./_components/CommissionBySellerMonthChart";
import { CommissionBySellerStatusChart } from "./_components/CommissionBySellerStatusChart";
import { CommissionOverdueChart } from "./_components/CommissionOverdueChart";
import { CommissionRateByFactoryChart } from "./_components/CommissionRateByFactoryChart";
import { CommissionsByMonthChart } from "./_components/CommissionsByMonthChart";

interface Props {
  filters: ChartFilters;
  /**
   * Quem enxerga mais de um vendedor (gestor). O vendedor comum só tem as
   * próprias comissões, e comparar "todos os vendedores" com um único nome na
   * legenda seria ruído — para ele esses dois gráficos não aparecem.
   */
  canCompareSellers: boolean;
}

/**
 * Parte 7 — o fecho da história: o que sobra para quem vendeu.
 *
 * Fica no fim porque é consequência de tudo o que veio antes (faturamento, mix de
 * fábrica, prazo de repasse), e porque é o único bloco em que o gráfico vazio é
 * boa notícia — nada atrasado para cobrar.
 *
 * Todos os gráficos leem o MESMO mês — o da data em que a comissão cai
 * (`receiveDate`), como na tela de Comissões — e compartilham uma única busca
 * (ver `useCommissionRows`).
 */
export function CommissionsSection({ filters, canCompareSellers }: Props) {
  return (
    <AnalyticsSection
      id="comissoes"
      step={storyStep("comissoes")}
      title="Quanto sobra para você"
      description="A comissão que já entrou, a que está por entrar e a que está atrasada."
    >
      <Grid.Root cols={{ base: 1, desktop: 2 }} gap={12}>
        <Grid.Item>
          <LazyChartCard
            title="Comissão por mês"
            description="O que já entrou, o que a fábrica deve e o que ainda depende do cliente pagar."
            help={CHART_HELP.commissionsByMonth}
          >
            <CommissionsByMonthChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>

        {canCompareSellers && (
          <Grid.Item>
            <LazyChartCard
              title="Comissão por vendedor, mês a mês"
              description="Uma linha por vendedor: quanto cada um ganha em cada mês."
              help={CHART_HELP.commissionBySellerMonth}
            >
              <CommissionBySellerMonthChart filters={filters} />
            </LazyChartCard>
          </Grid.Item>
        )}

        {canCompareSellers && (
          <Grid.Item>
            <LazyChartCard
              title="Quanto cada vendedor já ganhou"
              description="A barra é o total do período, dividido entre recebido, a receber e previsto."
              help={CHART_HELP.commissionBySellerStatus}
            >
              <CommissionBySellerStatusChart filters={filters} />
            </LazyChartCard>
          </Grid.Item>
        )}

        <Grid.Item>
          <LazyChartCard
            title="De qual fábrica vem a comissão"
            description="Quanto de comissão cada fábrica gerou no período."
            help={CHART_HELP.commissionByFactory}
          >
            <CommissionByFactoryChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>

        <Grid.Item>
          <LazyChartCard
            title="Quanto rende cada fábrica"
            description="Comissão em porcentagem do que foi faturado com aquela marca."
            help={CHART_HELP.commissionRateByFactory}
          >
            <CommissionRateByFactoryChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>

        <Grid.Item>
          <LazyChartCard
            title="Comissão atrasada"
            description="O que passou da data de pagamento e ainda não caiu, por fábrica."
            help={CHART_HELP.commissionOverdue}
          >
            <CommissionOverdueChart filters={filters} />
          </LazyChartCard>
        </Grid.Item>
      </Grid.Root>
    </AnalyticsSection>
  );
}
