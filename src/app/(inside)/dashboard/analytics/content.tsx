"use client";

import {
  SERIES_BLUE,
  SERIES_GREEN,
  SERIES_ORANGE,
} from "@/components/Chart/chartTheme";
import { Grid } from "@/components/Grid";
import { PageContent } from "@/components/PageContent";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { formatMoney } from "@/utils/format/masks";
import { getCookie } from "@/utils/cookies/clientCookie";
import { useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

import { DASHBOARD_SELLERS_QUERY } from "../gql";
import {
  DashboardSellersResponse,
  DateRangeIso,
  SellerOption,
} from "../interface";
import { formatDateRangeLabel } from "../utils";
import { AnalyticsPrintContext } from "./analyticsPrintContext";
import { useAnalyticsPdf } from "./useAnalyticsPdf";
import { AnalyticsHeader } from "./_components/AnalyticsHeader";
import { AnalyticsSection } from "./_components/AnalyticsSection";
import { AnalyticsSummary } from "./_components/AnalyticsSummary";
import { CommissionsByMonthChart } from "./_components/CommissionsByMonthChart";
import { EntityRankingChart } from "./_components/EntityRankingChart";
import {
  AVG_TICKET_BY_CLIENT_QUERY,
  AVG_TICKET_BY_FACTORY_QUERY,
  AVG_TICKET_BY_SELLER_QUERY,
  ORDER_INTERVAL_BY_CLIENT_QUERY,
  ORDER_INTERVAL_BY_FACTORY_QUERY,
} from "./_components/EntityRankingChart/gql";
import { LazyChartCard } from "./_components/LazyChartCard";
import { OrdersByClientChart } from "./_components/OrdersByClientChart";
import { OrdersByFactoryChart } from "./_components/OrdersByFactoryChart";
import { OrdersByMonthChart } from "./_components/OrdersByMonthChart";
import { RevenueByFactoryChart } from "./_components/RevenueByFactoryChart";
import { RevenueByMonthChart } from "./_components/RevenueByMonthChart";
import { ChartFilters } from "./interface";
import { formatDays, getLast12MonthsRangeIso } from "./utils";

// Papéis que enxergam dados de qualquer vendedor e escolhem de quem ver.
const MANAGER_ROLES = ["OWNER", "ADMIN", "SU"];

export default function AnalyticsContent() {
  const initialRange = useMemo(getLast12MonthsRangeIso, []);
  const [range, setRange] = useState<DateRangeIso>(initialRange);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);

  // Cookie é client-only: lido após o mount para evitar mismatch de hidratação.
  const [canSelectSeller, setCanSelectSeller] = useState(false);
  useEffect(() => {
    const userData = getCookie<{ role?: string }>("userData");
    setCanSelectSeller(MANAGER_ROLES.includes(userData?.role ?? ""));
  }, []);

  const sellersQuery = useQuery<DashboardSellersResponse>(
    DASHBOARD_SELLERS_QUERY,
    { variables: { input: { first: 200 } }, skip: !canSelectSeller }
  );
  useQueryErrorToast(
    sellersQuery.error,
    "Não foi possível carregar a lista de vendedores."
  );
  const sellers: SellerOption[] = useMemo(
    () => sellersQuery.data?.dashboard_sellers.edges.map((e) => e.node) ?? [],
    [sellersQuery.data]
  );

  // Gestor começa vendo a empresa toda (sellerId null); vendedor é escopado pelo backend.
  const filters: ChartFilters = {
    from: range.from,
    to: range.to,
    sellerId: selectedSellerId,
  };

  const { contextValue, downloadPdf, isExporting } = useAnalyticsPdf();

  const handleDownloadPdf = () => {
    const sellerName = selectedSellerId
      ? (sellers.find((s) => s.id === selectedSellerId)?.name ?? "Vendedor")
      : "Todos os vendedores";
    downloadPdf({
      title: "Análises",
      subtitle: `${formatDateRangeLabel(range.from, range.to)} · ${sellerName}`,
    });
  };

  return (
    <AnalyticsPrintContext.Provider value={contextValue}>
      <PageContent>
        <AnalyticsHeader
          range={range}
          onRangeChange={setRange}
          canSelectSeller={canSelectSeller}
          sellers={sellers}
          selectedSellerId={selectedSellerId}
          onSelectSeller={setSelectedSellerId}
          onDownloadPdf={handleDownloadPdf}
          exportingPdf={isExporting}
        />

        <AnalyticsSummary filters={filters} />

        <AnalyticsSection
          title="Visão geral"
          description="Faturamento, pedidos e comissões no período."
        >
          <Grid.Root cols={{ base: 1, desktop: 2 }} gap={12}>
            <Grid.Item>
              <LazyChartCard title="Faturamento por mês">
                <RevenueByMonthChart filters={filters} />
              </LazyChartCard>
            </Grid.Item>
            <Grid.Item>
              <LazyChartCard title="Pedidos por mês">
                <OrdersByMonthChart filters={filters} />
              </LazyChartCard>
            </Grid.Item>
            <Grid.Item>
              <LazyChartCard title="Faturamento por fábrica">
                <RevenueByFactoryChart filters={filters} />
              </LazyChartCard>
            </Grid.Item>
            <Grid.Item>
              <LazyChartCard title="Comissões: a receber vs recebidas">
                <CommissionsByMonthChart filters={filters} />
              </LazyChartCard>
            </Grid.Item>
          </Grid.Root>
        </AnalyticsSection>

        <AnalyticsSection
          title="Volume de pedidos"
          description="Quantos pedidos cada fábrica e cliente concentram no período."
        >
          <Grid.Root cols={{ base: 1, desktop: 2 }} gap={12}>
            <Grid.Item>
              <LazyChartCard title="Pedidos por fábrica">
                <OrdersByFactoryChart filters={filters} />
              </LazyChartCard>
            </Grid.Item>
            <Grid.Item>
              <LazyChartCard title="Pedidos por cliente">
                <OrdersByClientChart filters={filters} />
              </LazyChartCard>
            </Grid.Item>
          </Grid.Root>
        </AnalyticsSection>

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

        <AnalyticsSection
          title="Cadência de pedidos"
          description="Tempo médio entre um pedido e o próximo. Quanto menor, mais frequente a recompra."
        >
          <Grid.Root cols={{ base: 1, desktop: 2 }} gap={12}>
            <Grid.Item>
              <LazyChartCard title="Intervalo entre pedidos por fábrica">
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
              <LazyChartCard title="Intervalo entre pedidos por cliente">
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
      </PageContent>
    </AnalyticsPrintContext.Provider>
  );
}
