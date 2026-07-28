"use client";

import { PageContent } from "@/components/PageContent";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
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
import { AnalyticsSummary } from "./_components/AnalyticsSummary";
import { AvgTicketSection } from "./_components/AvgTicketSection";
import { ClientBehaviorSection } from "./_components/ClientBehaviorSection";
import { FactoryPerformanceSection } from "./_components/FactoryPerformanceSection";
import { GrowthSection } from "./_components/GrowthSection";
import { OrderCadenceSection } from "./_components/OrderCadenceSection";
import { OrderVolumeSection } from "./_components/OrderVolumeSection";
import { OverviewSection } from "./_components/OverviewSection";
import { SellerPerformanceSection } from "./_components/SellerPerformanceSection";
import { ChartFilters } from "./interface";
import { getLast12MonthsRangeIso } from "./utils";

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

        {/* Ordem de leitura: primeiro o retrato do período (o que aconteceu),
            depois a evolução por dimensão (como cada parte vem se comportando). */}
        <OverviewSection filters={filters} />
        <OrderVolumeSection filters={filters} />
        <AvgTicketSection filters={filters} />
        <OrderCadenceSection filters={filters} />

        <GrowthSection filters={filters} />
        <SellerPerformanceSection filters={filters} />
        <FactoryPerformanceSection filters={filters} />
        <ClientBehaviorSection filters={filters} />
      </PageContent>
    </AnalyticsPrintContext.Provider>
  );
}
